import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/chat/Sidebar";
import ChatArea from "@/components/chat/ChatArea";
import AdminPanel from "@/components/chat/AdminPanel";
import { useChat } from "@/hooks/useChat";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function Chat() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { connectWebSocket, disconnectWebSocket } = useWebSocket();
  const { selectedUser, showAdminPanel } = useChat();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  // Connect to WebSocket when user is authenticated
  useEffect(() => {
    if (user?.id) {
      connectWebSocket(user.id);
      return () => disconnectWebSocket();
    }
  }, [user?.id, connectWebSocket, disconnectWebSocket]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col md:flex-row max-w-7xl mx-auto bg-surface shadow-material-1">
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-200 p-2 z-10">
        <div className="flex justify-around">
          <button className="flex flex-col items-center p-2 text-primary" data-testid="nav-chats">
            <i className="fas fa-comments text-lg"></i>
            <span className="text-xs mt-1">Chats</span>
          </button>
          <button className="flex flex-col items-center p-2 text-on-background" data-testid="nav-users">
            <i className="fas fa-users text-lg"></i>
            <span className="text-xs mt-1">Users</span>
          </button>
          <button className="flex flex-col items-center p-2 text-on-background" data-testid="nav-connect">
            <i className="fas fa-bluetooth text-lg"></i>
            <span className="text-xs mt-1">Connect</span>
          </button>
          <button className="flex flex-col items-center p-2 text-on-background" data-testid="nav-settings">
            <i className="fas fa-cog text-lg"></i>
            <span className="text-xs mt-1">Settings</span>
          </button>
        </div>
      </div>

      <Sidebar user={user} />
      <ChatArea user={user} selectedUser={selectedUser} />
      {showAdminPanel && user.isAdmin && <AdminPanel user={user} />}
    </div>
  );
}
