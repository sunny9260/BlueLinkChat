import { create } from 'zustand';
import { User } from '@shared/schema';

interface ChatState {
  selectedUser: User | null;
  showAdminPanel: boolean;
  setSelectedUser: (user: User | null) => void;
  setShowAdminPanel: (show: boolean) => void;
}

export const useChat = create<ChatState>((set) => ({
  selectedUser: null,
  showAdminPanel: false,
  setSelectedUser: (user) => set({ selectedUser: user }),
  setShowAdminPanel: (show) => set({ showAdminPanel: show }),
}));
