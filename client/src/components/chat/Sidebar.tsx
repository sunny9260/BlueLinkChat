import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChat } from "@/hooks/useChat";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import UserList from "./UserList";
import logoSvg from "@/assets/logo.svg";

interface SidebarProps {
  user: User;
}

export default function Sidebar({ user }: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { showAdminPanel, setShowAdminPanel } = useChat();

  const { data: onlineUsers = [] } = useQuery<User[]>({
    queryKey: ['/api/users/online'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const toggleAdminPanel = () => {
    setShowAdminPanel(!showAdminPanel);
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
          data-testid="mobile-overlay"
        />
      )}

      {/* Desktop Sidebar / Mobile Sliding Sidebar */}
      <div className={`
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static fixed left-0 top-0 bottom-0 w-80 bg-surface border-r border-gray-200 flex-col z-50 transition-transform duration-300
        ${isMobileOpen ? 'flex' : 'hidden md:flex'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-primary text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10">
                <img src={logoSvg} alt="OfflineChat Logo" className="w-full h-full" data-testid="app-logo" />
              </div>
              <div>
                <h1 className="text-lg font-medium">OfflineChat</h1>
                <p className="text-sm opacity-90">Connected via Local Network</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="notification-dot w-3 h-3 bg-secondary rounded-full"></div>
              <button 
                className="md:hidden p-1 hover:bg-white hover:bg-opacity-20 rounded"
                onClick={toggleMobileSidebar}
                data-testid="button-close-sidebar"
              >
                <i className="fas fa-times text-white"></i>
              </button>
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user.profileImageUrl || undefined} alt={`${user.firstName} ${user.lastName}`} />
              <AvatarFallback>
                {(user.firstName?.[0] || '') + (user.lastName?.[0] || '')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium" data-testid="text-username">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-on-background">
                {user.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = "/api/logout"}
              data-testid="button-logout"
            >
              <i className="fas fa-sign-out-alt text-on-background"></i>
            </Button>
          </div>
        </div>

        {/* Admin Panel Toggle (if admin) */}
        {user.isAdmin && (
          <div className="p-4 border-b border-gray-200">
            <Button 
              className="w-full bg-secondary text-white hover:bg-opacity-90 shadow-material-1"
              onClick={toggleAdminPanel}
              data-testid="button-admin-panel"
            >
              <i className="fas fa-broadcast-tower mr-2"></i>
              Admin Broadcast
            </Button>
          </div>
        )}

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Nearby Users ({onlineUsers.length})</h2>
              <Button 
                variant="ghost" 
                size="sm"
                data-testid="button-refresh-users"
              >
                <i className="fas fa-sync text-primary"></i>
              </Button>
            </div>
            
            <UserList users={onlineUsers} currentUserId={user.id} />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Toggle Button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-30 p-2 bg-primary text-white rounded-full shadow-lg"
        onClick={toggleMobileSidebar}
        data-testid="button-open-sidebar"
      >
        <i className="fas fa-bars"></i>
      </button>
    </>
  );
}
