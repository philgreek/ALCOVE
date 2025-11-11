import React, { useState, useEffect, useCallback } from 'react';
import { Chat, Message } from './types';
import { getChats, getMessages, createMessage } from './services/mockApiService';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { MenuIcon, MessageIcon } from './components/Icons';

// В реальном приложении URL API и сокетов должны быть в переменных окружения
// const API_URL = process.env.REACT_APP_API_URL;
// const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;

const App: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // В реальном приложении здесь будет логика для WebSocket
  // const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const initialChats = await getChats();
        setChats(initialChats);
      } catch (error: any) {
        console.error("Failed to fetch chats:", error);
        setError(`Failed to load chats. Is the backend server running? (${error.message})`);
      }
      setIsLoading(false);
    };
    fetchInitialData();
  }, []);

  // Пример логики для WebSocket
  /*
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('newMessage', (newMessage: Message) => {
      // Если сообщение для текущего открытого чата, добавляем его
      if (newMessage.chatId === selectedChatId) {
        setMessages(prev => [...prev, newMessage]);
      }
      // Обновляем последнее сообщение в списке чатов
      setChats(prevChats => {
         const updatedChat = prevChats.find(c => c.id === newMessage.chatId);
         if (!updatedChat) return prevChats;
         updatedChat.lastMessage = newMessage;
         const otherChats = prevChats.filter(c => c.id !== newMessage.chatId);
         return [updatedChat, ...otherChats];
      });
    });

    return () => {
      newSocket.close();
    };
  }, [selectedChatId]);
  */

  useEffect(() => {
    if (selectedChatId) {
      const fetchMessages = async () => {
        setIsLoading(true);
        setError(null);
        setMessages([]); // Clear previous messages
        try {
          const chatMessages = await getMessages(selectedChatId);
          // Даты из JSON нужно будет парсить
          const parsedMessages = chatMessages.map(m => ({...m, timestamp: new Date(m.timestamp)}));
          setMessages(parsedMessages);
        } catch (error: any) {
          console.error("Failed to fetch messages:", error);
          setError(`Failed to load messages: ${error.message}`);
        }
        setIsLoading(false);
      };
      fetchMessages();
    }
  }, [selectedChatId]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!selectedChatId) return;

    // В реальном приложении ID пользователя будет браться из сессии/токена
    const currentUserId = 'user-0'; 

    const tempId = `temp-${Date.now()}`;
    const newMessage: Message = {
      id: tempId,
      text,
      timestamp: new Date(),
      senderId: currentUserId,
    };

    setMessages(prev => [...prev, newMessage]);

    try {
      // Отправляем сообщение на сервер
      const savedMessage = await createMessage(selectedChatId, text, currentUserId);
      
      // Заменяем временное сообщение на сохраненное с реальным ID
      setMessages(prev => prev.map(m => m.id === tempId ? {...savedMessage, timestamp: new Date(savedMessage.timestamp)} : m));

      // Обновляем список чатов
      setChats(prevChats => {
        const updatedChat = prevChats.find(c => c.id === selectedChatId);
        if (!updatedChat) return prevChats;
        updatedChat.lastMessage = {...savedMessage, timestamp: new Date(savedMessage.timestamp)};
        const otherChats = prevChats.filter(c => c.id !== selectedChatId);
        return [updatedChat, ...otherChats];
      });

      // В реальном приложении сообщение другим участникам будет отправлено через WebSocket
      // socket?.emit('sendMessage', savedMessage);

    } catch (error) {
      console.error("Failed to send message:", error);
      // Возвращаем UI в состояние до отправки в случае ошибки
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setError(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

  }, [selectedChatId]);

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    if (window.innerWidth < 768) { // md breakpoint
      setIsSidebarOpen(false);
    }
  };

  const selectedChat = chats.find(c => c.id === selectedChatId);
  const chatPartner = selectedChat?.users.find(u => u.id !== 'user-0');

  return (
    <div className="h-screen w-screen bg-surface-1 text-on-surface flex overflow-hidden">
      <Sidebar 
        chats={chats} 
        selectedChatId={selectedChatId} 
        onSelectChat={handleSelectChat}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <main className="flex-1 flex flex-col transition-all duration-300">
        {selectedChat && chatPartner ? (
          <ChatWindow
            chatPartner={chatPartner}
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            isPartnerTyping={false} // This should come from the backend via WebSockets
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-surface-2 p-4">
           {error ? (
              <div className="text-center text-red-600 bg-red-100 p-6 rounded-lg">
                <h2 className="text-xl font-semibold">An Error Occurred</h2>
                <p className="mt-2 text-sm">{error}</p>
              </div>
           ) : (
            <div className="text-center">
              <MessageIcon className="w-24 h-24 text-surface-3 mx-auto" />
              <h2 className="mt-4 text-2xl font-semibold">Welcome to React Messenger</h2>
              <p className="mt-2 text-on-surface/70">Select a conversation to start chatting</p>
               <button onClick={() => setIsSidebarOpen(true)} className="mt-4 md:hidden inline-flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-full">
                <MenuIcon className="w-5 h-5" />
                Open Chats
              </button>
            </div>
           )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;