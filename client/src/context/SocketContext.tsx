import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { SocketContextType } from '../types';

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.id) {
      // Используем прокси Vite в разработке и переменную окружения в продакшене
      const SERVER_URL = import.meta.env.PROD ? import.meta.env.VITE_SERVER_URL : '/';
      
      const newSocket = io(SERVER_URL, {
        query: { userId: user.id },
        transports: ['websocket']
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else {
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
