import React, { useState, useEffect, useCallback } from 'react';
import { Chat, Message } from './types';
import { getChats, getMessages, createMessage } from './services/apiService';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { MessageIcon, MenuIcon } from './components/Icons';

const App: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // В будущем здесь будет логика для WebSocket

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const initialChats = await getChats();
        setChats(initialChats);
      } catch (err: any) {
        console.error("Failed to fetch chats:", err);
        setError(`Failed to load chats. Is the backend server running? (${err.message})`);
      }
      setIsLoading(false);
    };
    fetchInitialData();
  }, []);


  useEffect(() => {
    if (selectedChatId) {
      const fetchMessages = async () => {
        setIsLoading(true);
        setError(null);
        setMessages([]);
        try {
          const chatMessages = await getMessages(selectedChatId);
          const parsedMessages = chatMessages.map(m => ({...m, timestamp: new Date(m.timestamp)}));
          setMessages(parsedMessages);
        } catch (err: any) {
          console.error("Failed to fetch messages:", err);
          setError(`Failed to load messages: ${err.message}`);
        }
        setIsLoading(false);
      };
      fetchMessages();
    }
  }, [selectedChatId]);

  const handleSendMessage = useCallback(async (content: { text?: string; audio?: { dataUrl: string }}) => {
    if (!selectedChatId) return;

    const currentUserId = 'user-0'; 

    const tempId = `temp-${Date.now()}`;
    const newMessage: Message = {
      id: tempId,
      ...content,
      timestamp: new Date(),
      senderId: currentUserId,
    };

    setMessages(prev => [...prev, newMessage]);

    try {
      const savedMessage = await createMessage(selectedChatId, currentUserId, content);
      
      setMessages(prev => prev.map(m => m.id === tempId ? {...savedMessage, timestamp: new Date(savedMessage.timestamp)} : m));

      setChats(prevChats => {
        const chatIndex = prevChats.findIndex(c => c.id === selectedChatId);
        if (chatIndex === -1) return prevChats;
        
        const lastMessageText = savedMessage.text || 'Voice message';
        
        const updatedChat = {
            ...prevChats[chatIndex],
            lastMessage: {...savedMessage, text: lastMessageText, timestamp: new Date(savedMessage.timestamp)}
        };

        const otherChats = prevChats.filter(c => c.id !== selectedChatId);
        return [updatedChat, ...otherChats];
      });

    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setError(`Failed to send message: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

  }, [selectedChatId]);

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    if (window.innerWidth < 768) {
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
            isPartnerTyping={false}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-surface-2 p-4">
           {error ? (
              <div className="text-center text-red-600 bg-red-100 p-6 rounded-lg shadow-md max-w-md">
                <h2 className="text-xl font-semibold">An Error Occurred</h2>
                <p className="mt-2 text-sm">{error}</p>
                <p className="mt-4 text-xs text-gray-500">Please ensure the backend server is running and accessible.</p>
              </div>
           ) : (
            <div className="text-center">
              <MessageIcon className="w-24 h-24 text-surface-3 mx-auto" />
              <h2 className="mt-4 text-2xl font-semibold">Welcome to React Messenger</h2>
              <p className="mt-2 text-on-surface/70">Select a conversation to start chatting</p>
               <button onClick={() => setIsSidebarOpen(true)} className="mt-4 md-hidden inline-flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-full">
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
