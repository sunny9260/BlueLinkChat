import {
  users,
  messages,
  chatRooms,
  chatParticipants,
  type User,
  type UpsertUser,
  type Message,
  type InsertMessage,
  type ChatRoom,
  type InsertChatRoom,
  type ChatParticipant,
  type InsertChatParticipant,
  type MessageWithSender,
  type ChatRoomWithParticipants,
} from "@shared/schema";
import { randomUUID } from "crypto";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserOnlineStatus(id: string, isOnline: boolean): Promise<void>;
  getOnlineUsers(): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesForUser(userId: string, otherUserId?: string): Promise<MessageWithSender[]>;
  getBroadcastMessages(): Promise<MessageWithSender[]>;
  markMessageAsRead(messageId: string): Promise<void>;
  getUnreadMessagesCount(userId: string): Promise<number>;
  
  // Chat room operations
  createChatRoom(chatRoom: InsertChatRoom): Promise<ChatRoom>;
  getChatRoomsForUser(userId: string): Promise<ChatRoomWithParticipants[]>;
  addParticipantToChatRoom(participant: InsertChatParticipant): Promise<ChatParticipant>;
  getOrCreateDirectChatRoom(user1Id: string, user2Id: string): Promise<ChatRoom>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private messages: Map<string, Message>;
  private chatRooms: Map<string, ChatRoom>;
  private chatParticipants: Map<string, ChatParticipant>;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.chatRooms = new Map();
    this.chatParticipants = new Map();
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    const user: User = {
      ...existingUser,
      ...userData,
      id: userData.id || randomUUID(),
      email: userData.email ?? null,
      firstName: userData.firstName ?? null,
      lastName: userData.lastName ?? null,
      profileImageUrl: userData.profileImageUrl ?? null,
      isAdmin: userData.isAdmin ?? false,
      isOnline: userData.isOnline ?? false,
      lastSeen: userData.lastSeen ?? new Date(),
      updatedAt: new Date(),
      createdAt: existingUser?.createdAt || new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUserOnlineStatus(id: string, isOnline: boolean): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.isOnline = isOnline;
      user.lastSeen = new Date();
      this.users.set(id, user);
    }
  }

  async getOnlineUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.isOnline);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Message operations
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const message: Message = {
      ...messageData,
      id: randomUUID(),
      recipientId: messageData.recipientId ?? null,
      messageType: messageData.messageType ?? "direct",
      broadcastType: messageData.broadcastType ?? null,
      isRead: messageData.isRead ?? false,
      createdAt: new Date(),
    };
    this.messages.set(message.id, message);
    return message;
  }

  async getMessagesForUser(userId: string, otherUserId?: string): Promise<MessageWithSender[]> {
    const allMessages = Array.from(this.messages.values());
    let userMessages: Message[];

    if (otherUserId) {
      // Get direct messages between two users
      userMessages = allMessages.filter(msg => 
        msg.messageType === "direct" &&
        ((msg.senderId === userId && msg.recipientId === otherUserId) ||
         (msg.senderId === otherUserId && msg.recipientId === userId))
      );
    } else {
      // Get all messages for user (including broadcasts)
      userMessages = allMessages.filter(msg => 
        msg.messageType === "broadcast" ||
        msg.senderId === userId ||
        msg.recipientId === userId
      );
    }

    // Add sender information
    return userMessages.map(msg => ({
      ...msg,
      sender: this.users.get(msg.senderId)!,
      recipient: msg.recipientId ? this.users.get(msg.recipientId) : undefined,
    })).sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async getBroadcastMessages(): Promise<MessageWithSender[]> {
    const broadcasts = Array.from(this.messages.values())
      .filter(msg => msg.messageType === "broadcast");
    
    return broadcasts.map(msg => ({
      ...msg,
      sender: this.users.get(msg.senderId)!,
    })).sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    const message = this.messages.get(messageId);
    if (message) {
      message.isRead = true;
      this.messages.set(messageId, message);
    }
  }

  async getUnreadMessagesCount(userId: string): Promise<number> {
    return Array.from(this.messages.values()).filter(msg => 
      msg.recipientId === userId && !msg.isRead
    ).length;
  }

  // Chat room operations
  async createChatRoom(chatRoomData: InsertChatRoom): Promise<ChatRoom> {
    const chatRoom: ChatRoom = {
      ...chatRoomData,
      id: randomUUID(),
      name: chatRoomData.name ?? null,
      isGroup: chatRoomData.isGroup ?? false,
      createdAt: new Date(),
    };
    this.chatRooms.set(chatRoom.id, chatRoom);
    return chatRoom;
  }

  async getChatRoomsForUser(userId: string): Promise<ChatRoomWithParticipants[]> {
    const userParticipations = Array.from(this.chatParticipants.values())
      .filter(p => p.userId === userId);
    
    const chatRooms = userParticipations.map(p => this.chatRooms.get(p.chatRoomId!)).filter(Boolean) as ChatRoom[];
    
    return chatRooms.map(room => {
      const participants = Array.from(this.chatParticipants.values())
        .filter(p => p.chatRoomId === room.id)
        .map(p => this.users.get(p.userId!))
        .filter(Boolean) as User[];
      
      const roomMessages = Array.from(this.messages.values())
        .filter(msg => msg.recipientId === room.id || participants.some(p => p.id === msg.senderId))
        .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
      
      const lastMessage = roomMessages[0] ? {
        ...roomMessages[0],
        sender: this.users.get(roomMessages[0].senderId)!,
      } : undefined;
      
      const unreadCount = roomMessages.filter(msg => 
        msg.recipientId === userId && !msg.isRead
      ).length;
      
      return {
        ...room,
        participants,
        lastMessage,
        unreadCount,
      };
    });
  }

  async addParticipantToChatRoom(participantData: InsertChatParticipant): Promise<ChatParticipant> {
    const participant: ChatParticipant = {
      ...participantData,
      id: randomUUID(),
      joinedAt: new Date(),
    };
    this.chatParticipants.set(participant.id, participant);
    return participant;
  }

  async getOrCreateDirectChatRoom(user1Id: string, user2Id: string): Promise<ChatRoom> {
    // Check if a direct chat room already exists between these users
    const existingRoom = Array.from(this.chatRooms.values()).find(room => {
      if (room.isGroup) return false;
      
      const participants = Array.from(this.chatParticipants.values())
        .filter(p => p.chatRoomId === room.id)
        .map(p => p.userId);
      
      return participants.length === 2 && 
             participants.includes(user1Id) && 
             participants.includes(user2Id);
    });
    
    if (existingRoom) {
      return existingRoom;
    }
    
    // Create new direct chat room
    const chatRoom = await this.createChatRoom({
      name: null,
      isGroup: false,
      createdBy: user1Id,
    });
    
    // Add both users as participants
    await this.addParticipantToChatRoom({
      chatRoomId: chatRoom.id,
      userId: user1Id,
    });
    
    await this.addParticipantToChatRoom({
      chatRoomId: chatRoom.id,
      userId: user2Id,
    });
    
    return chatRoom;
  }
}

export const storage = new MemStorage();
