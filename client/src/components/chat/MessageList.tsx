import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { MessageWithSender, User } from "@shared/schema";
import { format } from "date-fns";

interface MessageListProps {
  currentUser: User;
  otherUser: User;
}

export default function MessageList({ currentUser, otherUser }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery<MessageWithSender[]>({
    queryKey: ['/api/messages', { otherUserId: otherUser.id }],
    refetchInterval: 1000, // Refresh every second for real-time updates
  });

  const { data: broadcastMessages = [] } = useQuery<MessageWithSender[]>({
    queryKey: ['/api/messages/broadcasts'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Combine and sort all messages
  const allMessages = [...messages, ...broadcastMessages].sort(
    (a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()
  );

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  const formatMessageTime = (date: Date | string) => {
    return format(new Date(date), 'h:mm a');
  };

  const getBroadcastStyle = (broadcastType?: string) => {
    switch (broadcastType) {
      case 'warning':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'emergency':
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-blue-100 border-blue-300 text-blue-800';
    }
  };

  const getBroadcastIcon = (broadcastType?: string) => {
    switch (broadcastType) {
      case 'warning':
        return 'fas fa-exclamation-triangle text-yellow-600';
      case 'emergency':
        return 'fas fa-exclamation-circle text-red-600';
      default:
        return 'fas fa-broadcast-tower text-blue-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4" data-testid="messages-container">
      {allMessages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-comment text-gray-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">No messages yet</h3>
            <p className="text-sm text-gray-500">Start the conversation by sending a message!</p>
          </div>
        </div>
      ) : (
        allMessages.map((message: MessageWithSender) => {
          const isFromCurrentUser = message.senderId === currentUser.id;
          const isBroadcast = message.messageType === 'broadcast';

          if (isBroadcast) {
            return (
              <div key={message.id} className="flex justify-center" data-testid={`message-broadcast-${message.id}`}>
                <div className={`border rounded-lg p-3 max-w-md text-center ${getBroadcastStyle(message.broadcastType!)}`}>
                  <div className="flex items-center justify-center mb-2">
                    <i className={`${getBroadcastIcon(message.broadcastType!)} mr-2`}></i>
                    <span className="text-sm font-medium">Admin Broadcast</span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-75 mt-2 block">
                    {formatMessageTime(message.createdAt!)}
                  </span>
                </div>
              </div>
            );
          }

          return (
            <div 
              key={message.id} 
              className={`flex items-start space-x-2 animate-fade-in ${
                isFromCurrentUser ? 'justify-end' : ''
              }`}
              data-testid={`message-${message.id}`}
            >
              {!isFromCurrentUser && (
                <Avatar className="w-8 h-8">
                  <AvatarImage src={message.sender.profileImageUrl || undefined} />
                  <AvatarFallback>
                    {(message.sender.firstName?.[0] || '') + (message.sender.lastName?.[0] || '')}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={`flex-1 ${isFromCurrentUser ? 'flex flex-col items-end' : ''}`}>
                <div className={`rounded-lg p-3 max-w-xs shadow-material-1 ${
                  isFromCurrentUser 
                    ? 'chat-bubble-sent text-white' 
                    : 'chat-bubble-received text-on-surface'
                }`}>
                  <p className="text-sm">{message.content}</p>
                </div>
                <div className={`flex items-center mt-1 space-x-1 ${
                  isFromCurrentUser ? '' : ''
                }`}>
                  <span className="text-xs text-on-background">
                    {formatMessageTime(message.createdAt!)}
                  </span>
                  {isFromCurrentUser && (
                    <i className="fas fa-check-double text-secondary text-xs"></i>
                  )}
                </div>
              </div>
              {isFromCurrentUser && (
                <Avatar className="w-8 h-8">
                  <AvatarImage src={currentUser.profileImageUrl || undefined} />
                  <AvatarFallback>
                    {(currentUser.firstName?.[0] || '') + (currentUser.lastName?.[0] || '')}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
