import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { User } from "@shared/schema";

interface MessageInputProps {
  currentUser: User;
  recipient: User;
}

export default function MessageInput({ currentUser, recipient }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { content: string; recipientId: string }) => {
      return await apiRequest('POST', '/api/messages', data);
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;

    sendMessageMutation.mutate({
      content: message,
      recipientId: recipient.id,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    
    // Handle typing indicator
    if (!isTyping) {
      setIsTyping(true);
      // You could emit typing event to WebSocket here
    }
    
    // Clear typing indicator after user stops typing
    setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="p-4 bg-surface border-t border-gray-200">
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" data-testid="button-attach">
          <i className="fas fa-paperclip text-on-background"></i>
        </Button>
        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="py-3 px-4 bg-gray-100 rounded-full border-none focus:ring-2 focus:ring-primary focus:bg-white transition-all pr-12"
            disabled={sendMessageMutation.isPending}
            data-testid="input-message"
          />
          <Button 
            variant="ghost" 
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-200 rounded-full"
            data-testid="button-emoji"
          >
            <i className="fas fa-smile text-on-background"></i>
          </Button>
        </div>
        <Button 
          className="p-3 bg-primary text-white rounded-full hover:bg-primary-dark shadow-material-1"
          onClick={handleSendMessage}
          disabled={sendMessageMutation.isPending || !message.trim()}
          data-testid="button-send-message"
        >
          {sendMessageMutation.isPending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <i className="fas fa-paper-plane"></i>
          )}
        </Button>
      </div>
    </div>
  );
}
