// This is needed to fix TypeScript errors when accessing `import.meta.env`.
// Vite exposes environment variables on this object.
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_API_URL?: string;
    }
  }
}

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  isOnline: boolean;
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
