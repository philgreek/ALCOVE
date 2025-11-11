
export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  isOnline: boolean;
}

export interface Message {
  id: string;
  text: string;
  timestamp: Date;
  senderId: string;
}

export interface Chat {
  id: string;
  users: User[];
  lastMessage: Message;
  unreadCount: number;
}
