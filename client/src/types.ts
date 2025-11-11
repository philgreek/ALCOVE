export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  isOnline?: boolean;
  token?: string;
}

export interface Message {
  id:string;
  text?: string;
  audio?: {
    dataUrl: string;
  };
  timestamp: Date;
  senderId: string;
}

export interface Chat {
  id: string;
  users: User[];
  lastMessage: Message;
  unreadCount: number;
}