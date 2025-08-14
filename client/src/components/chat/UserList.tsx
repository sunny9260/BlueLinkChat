import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChat } from "@/hooks/useChat";
import { User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface UserListProps {
  users: User[];
  currentUserId: string;
}

export default function UserList({ users, currentUserId }: UserListProps) {
  const { selectedUser, setSelectedUser } = useChat();

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
  };

  const filteredUsers = users.filter(user => user.id !== currentUserId);

  if (filteredUsers.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <i className="fas fa-users text-gray-400"></i>
        </div>
        <p className="text-sm text-gray-500">No other users online</p>
        <p className="text-xs text-gray-400 mt-1">Waiting for connections...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filteredUsers.map((user) => (
        <div 
          key={user.id}
          className={`flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors ${
            selectedUser?.id === user.id ? 'bg-blue-50 border border-blue-200' : ''
          }`}
          onClick={() => handleSelectUser(user)}
          data-testid={`user-item-${user.id}`}
        >
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.profileImageUrl || undefined} />
              <AvatarFallback>
                {(user.firstName?.[0] || '') + (user.lastName?.[0] || '')}
              </AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${
              user.isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
          </div>
          <div className="flex-1 ml-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm" data-testid={`text-user-name-${user.id}`}>
                {user.firstName} {user.lastName}
              </h3>
              <span className="text-xs text-on-background">
                {user.lastSeen && formatDistanceToNow(new Date(user.lastSeen), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-on-background truncate">
              {user.isOnline ? 'Online' : 'Last seen recently'}
            </p>
          </div>
          {/* You could add unread message indicator here */}
          {/* <div className="w-2 h-2 bg-secondary rounded-full ml-2"></div> */}
        </div>
      ))}
    </div>
  );
}
