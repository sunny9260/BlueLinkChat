import { useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();

  const connectWebSocket = useCallback((userId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      // Authenticate the connection
      ws.send(JSON.stringify({
        type: 'auth',
        userId: userId,
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'message') {
          // Invalidate queries to refresh messages
          queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
          queryClient.invalidateQueries({ queryKey: ['/api/messages/broadcasts'] });
        } else if (data.type === 'userStatus') {
          // Invalidate user queries to refresh online status
          queryClient.invalidateQueries({ queryKey: ['/api/users'] });
          queryClient.invalidateQueries({ queryKey: ['/api/users/online'] });
        } else if (data.type === 'typing') {
          // Handle typing indicators
          console.log(`User ${data.senderId} is ${data.isTyping ? 'typing' : 'not typing'}`);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (wsRef.current === ws) {
          connectWebSocket(userId);
        }
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current = ws;
  }, [queryClient]);

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendTypingIndicator = useCallback((recipientId: string, isTyping: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        recipientId,
        isTyping,
      }));
    }
  }, []);

  return {
    connectWebSocket,
    disconnectWebSocket,
    sendTypingIndicator,
  };
}
