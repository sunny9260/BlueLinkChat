import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertMessageSchema } from "@shared/schema";
import { z } from "zod";

interface WebSocketWithUser extends WebSocket {
  userId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.get('/api/users', isAuthenticated, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/users/online', isAuthenticated, async (req: any, res) => {
    try {
      const users = await storage.getOnlineUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching online users:", error);
      res.status(500).json({ message: "Failed to fetch online users" });
    }
  });

  // Message routes
  app.get('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { otherUserId } = req.query;
      const messages = await storage.getMessagesForUser(userId, otherUserId as string);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get('/api/messages/broadcasts', isAuthenticated, async (req: any, res) => {
    try {
      const messages = await storage.getBroadcastMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching broadcast messages:", error);
      res.status(500).json({ message: "Failed to fetch broadcast messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: userId,
      });
      
      const message = await storage.createMessage(messageData);
      
      // Broadcast message to connected WebSocket clients
      const messageWithSender = {
        ...message,
        sender: await storage.getUser(userId),
        recipient: message.recipientId ? await storage.getUser(message.recipientId) : undefined,
      };
      
      broadcastToClients(messageWithSender);
      
      res.json(messageWithSender);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  app.post('/api/messages/broadcast', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const broadcastSchema = insertMessageSchema.extend({
        broadcastType: z.enum(["info", "warning", "emergency"]).optional(),
      });
      
      const messageData = broadcastSchema.parse({
        ...req.body,
        senderId: userId,
        messageType: "broadcast",
        recipientId: null,
      });
      
      const message = await storage.createMessage(messageData);
      
      const messageWithSender = {
        ...message,
        sender: user,
      };
      
      // Broadcast to all connected clients
      broadcastToClients(messageWithSender);
      
      res.json(messageWithSender);
    } catch (error) {
      console.error("Error creating broadcast message:", error);
      res.status(500).json({ message: "Failed to create broadcast message" });
    }
  });

  app.patch('/api/messages/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.markMessageAsRead(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // Chat room routes
  app.get('/api/chat-rooms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const chatRooms = await storage.getChatRoomsForUser(userId);
      res.json(chatRooms);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      res.status(500).json({ message: "Failed to fetch chat rooms" });
    }
  });

  app.post('/api/chat-rooms/direct', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { otherUserId } = req.body;
      
      if (!otherUserId) {
        return res.status(400).json({ message: "Other user ID is required" });
      }
      
      const chatRoom = await storage.getOrCreateDirectChatRoom(userId, otherUserId);
      res.json(chatRoom);
    } catch (error) {
      console.error("Error creating/getting direct chat room:", error);
      res.status(500).json({ message: "Failed to create/get direct chat room" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients: Map<string, WebSocketWithUser> = new Map();

  wss.on('connection', (ws: WebSocketWithUser, req) => {
    console.log('New WebSocket connection');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'auth') {
          // Store user association with WebSocket connection
          ws.userId = message.userId;
          clients.set(message.userId, ws);
          
          // Update user online status
          await storage.updateUserOnlineStatus(message.userId, true);
          
          // Broadcast user online status to all clients
          broadcastUserStatus(message.userId, true);
          
          console.log(`User ${message.userId} connected via WebSocket`);
        } else if (message.type === 'typing') {
          // Broadcast typing indicator
          broadcastToUser(message.recipientId, {
            type: 'typing',
            senderId: ws.userId,
            isTyping: message.isTyping,
          });
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    ws.on('close', async () => {
      if (ws.userId) {
        clients.delete(ws.userId);
        await storage.updateUserOnlineStatus(ws.userId, false);
        broadcastUserStatus(ws.userId, false);
        console.log(`User ${ws.userId} disconnected from WebSocket`);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  function broadcastToClients(message: any) {
    const messageStr = JSON.stringify({
      type: 'message',
      data: message,
    });

    clients.forEach((client, userId) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  function broadcastToUser(userId: string, data: any) {
    const client = clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }

  function broadcastUserStatus(userId: string, isOnline: boolean) {
    const statusMessage = JSON.stringify({
      type: 'userStatus',
      userId,
      isOnline,
    });

    clients.forEach((client, clientUserId) => {
      if (clientUserId !== userId && client.readyState === WebSocket.OPEN) {
        client.send(statusMessage);
      }
    });
  }

  return httpServer;
}
