import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useChat } from "@/hooks/useChat";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { User } from "@shared/schema";

interface AdminPanelProps {
  user: User;
}

export default function AdminPanel({ user }: AdminPanelProps) {
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [messageType, setMessageType] = useState<"info" | "warning" | "emergency">("info");
  const { setShowAdminPanel } = useChat();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: connectedUsers = [] } = useQuery<User[]>({
    queryKey: ['/api/users/online'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const sendBroadcastMutation = useMutation({
    mutationFn: async (data: { content: string; broadcastType: string }) => {
      return await apiRequest('POST', '/api/messages/broadcast', data);
    },
    onSuccess: () => {
      toast({
        title: "Broadcast Sent",
        description: "Your message has been broadcast to all users.",
      });
      setBroadcastMessage("");
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
        description: "Failed to send broadcast message.",
        variant: "destructive",
      });
    },
  });

  const handleSendBroadcast = () => {
    if (!broadcastMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message to broadcast.",
        variant: "destructive",
      });
      return;
    }

    sendBroadcastMutation.mutate({
      content: broadcastMessage,
      broadcastType: messageType,
    });
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case "warning": return "bg-yellow-500";
      case "emergency": return "bg-red-500";
      default: return "bg-orange-500";
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "warning": return "fas fa-exclamation-triangle";
      case "emergency": return "fas fa-exclamation-circle";
      default: return "fas fa-info-circle";
    }
  };

  return (
    <div className="w-80 bg-surface border-l border-gray-200 flex flex-col">
      <div className={`p-4 border-b border-gray-200 ${getMessageTypeColor(messageType)} text-white`}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Admin Panel</h2>
          <Button 
            variant="ghost" 
            size="sm"
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded text-white"
            onClick={() => setShowAdminPanel(false)}
            data-testid="button-close-admin-panel"
          >
            <i className="fas fa-times"></i>
          </Button>
        </div>
      </div>
      
      <div className="p-4 space-y-4 flex-1">
        <div>
          <label className="block text-sm font-medium mb-2">Broadcast Message</label>
          <Textarea 
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            className="resize-none"
            rows={4}
            placeholder="Enter your broadcast message..."
            data-testid="input-broadcast-message"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Message Type</label>
          <Select value={messageType} onValueChange={(value: "info" | "warning" | "emergency") => setMessageType(value)}>
            <SelectTrigger data-testid="select-message-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="info">
                <div className="flex items-center">
                  <i className="fas fa-info-circle mr-2 text-blue-500"></i>
                  Information
                </div>
              </SelectItem>
              <SelectItem value="warning">
                <div className="flex items-center">
                  <i className="fas fa-exclamation-triangle mr-2 text-yellow-500"></i>
                  Warning
                </div>
              </SelectItem>
              <SelectItem value="emergency">
                <div className="flex items-center">
                  <i className="fas fa-exclamation-circle mr-2 text-red-500"></i>
                  Emergency
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          className={`w-full ${getMessageTypeColor(messageType)} text-white hover:opacity-90 shadow-material-1`}
          onClick={handleSendBroadcast}
          disabled={sendBroadcastMutation.isPending}
          data-testid="button-send-broadcast"
        >
          {sendBroadcastMutation.isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Sending...
            </>
          ) : (
            <>
              <i className={`${getMessageTypeIcon(messageType)} mr-2`}></i>
              Send Broadcast
            </>
          )}
        </Button>
        
        <div className="border-t pt-4">
          <h3 className="font-medium mb-3">Connected Users ({connectedUsers.length})</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {connectedUsers.map((connectedUser: User) => (
              <div key={connectedUser.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">{connectedUser.firstName} {connectedUser.lastName}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  connectedUser.id === user.id ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                }`}>
                  {connectedUser.id === user.id ? 'You (Admin)' : 'Online'}
                </span>
              </div>
            ))}
            {connectedUsers.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-4">
                No users connected
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
