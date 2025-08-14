import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@shared/schema";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

interface ChatAreaProps {
  user: User;
  selectedUser: User | null;
}

export default function ChatArea({ user, selectedUser }: ChatAreaProps) {
  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-comments text-gray-400 text-2xl"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">No Chat Selected</h3>
          <p className="text-sm text-gray-500">Choose a user from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 bg-surface border-b border-gray-200 shadow-material-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={selectedUser.profileImageUrl || undefined} />
              <AvatarFallback>
                {(selectedUser.firstName?.[0] || '') + (selectedUser.lastName?.[0] || '')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-medium" data-testid="text-chat-user-name">
                {selectedUser.firstName} {selectedUser.lastName}
              </h2>
              <p className="text-sm text-on-background flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${
                  selectedUser.isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`}></span>
                <span data-testid="text-user-status">
                  {selectedUser.isOnline ? 'Active now' : 'Offline'}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" data-testid="button-call">
              <i className="fas fa-phone text-on-background"></i>
            </Button>
            <Button variant="ghost" size="sm" data-testid="button-video">
              <i className="fas fa-video text-on-background"></i>
            </Button>
            <Button variant="ghost" size="sm" data-testid="button-info">
              <i className="fas fa-info-circle text-on-background"></i>
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <MessageList currentUser={user} otherUser={selectedUser} />

      {/* Message Input */}
      <MessageInput currentUser={user} recipient={selectedUser} />
    </div>
  );
}
