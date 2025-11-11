import React, { useState, useEffect, useCallback, useRef } from 'react';
// Исправлено: Добавлен импорт типа Chat для устранения ошибки компиляции.
import { Chat, Message, User } from '../types';
import { getChats, getMessages, createMessage, searchUsers, createChat } from '../services/apiService';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import { MessageIcon, MenuIcon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const ChatPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();

  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<number | null>(null);
  
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch initial chat data
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
        if (err.message.includes('403') || err.message.includes('401')) logout();
      }
      setIsLoading(false);
    };
    fetchInitialData();
  }, [logout]);

  // WebSocket message listener effect
  useEffect(() => {
    if (!socket) return;

    if (!notificationAudioRef.current) {
        notificationAudioRef.current = new Audio('/notification.mp3');
    }

    const handleNewMessage = (newMessage: Message) => {
        notificationAudioRef.current?.play().catch(e => console.error("Error playing sound:", e));

        setChats(prevChats => {
            const chatToUpdate = prevChats.find(c => c.id === newMessage.chatId);
            if (!chatToUpdate) return prevChats;
            
            const updatedChat = {
                ...chatToUpdate,
                lastMessage: { ...newMessage, timestamp: new Date(newMessage.timestamp) }
            };
            
            const otherChats = prevChats.filter(c => c.id !== newMessage.chatId);
            return [updatedChat, ...otherChats];
        });

        if (newMessage.chatId === selectedChatId) {
            setMessages(prevMessages => [...prevMessages, { ...newMessage, timestamp: new Date(newMessage.timestamp) }]);
        }
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
        socket.off('newMessage', handleNewMessage);
    };
  }, [socket, selectedChatId]);


  // Debounced search effect
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsSearching(true);
    searchTimeoutRef.current = window.setTimeout(async () => {
      try {
        const results = await searchUsers(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error("Failed to search users:", err);
        setError("Failed to search for users.");
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Fetch messages for selected chat
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
    if (!selectedChatId || !user) return;

    const tempId = `temp-${Date.now()}`;
    const newMessage: Message = {
      id: tempId,
      ...content,
      timestamp: new Date(),
      senderId: user.id,
    };

    setMessages(prev => [...prev, newMessage]);

    try {
      const savedMessage = await createMessage(selectedChatId, content);
      
      setMessages(prev => prev.map(m => m.id === tempId ? {...savedMessage, timestamp: new Date(savedMessage.timestamp)} : m));

      setChats(prevChats => {
        const updatedChat = prevChats.find(c => c.id === selectedChatId);
        if (!updatedChat) return prevChats;
        updatedChat.lastMessage = {...savedMessage, timestamp: new Date(savedMessage.timestamp)};
        const otherChats = prevChats.filter(c => c.id !== selectedChatId);
        return [updatedChat, ...otherChats];
      });

    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setError(`Failed to send message: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [selectedChatId, user]);

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setSearchQuery('');
    setSearchResults([]);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };
  
  const handleStartChat = useCallback(async (partnerId: string) => {
    try {
      const newChat = await createChat(partnerId);
      if (!chats.some(c => c.id === newChat.id)) {
        const populatedChat = {
          ...newChat,
          lastMessage: {
            ...newChat.lastMessage,
            timestamp: newChat.lastMessage.timestamp ? new Date(newChat.lastMessage.timestamp) : new Date()
          }
        }
        setChats(prev => [populatedChat, ...prev]);
      }
      handleSelectChat(newChat.id);
    } catch (err: any) {
      console.error("Failed to start chat:", err);
      setError(`Failed to start chat: ${err.message}`);
    }
  }, [chats]);

  const currentUserId = user?.id;
  const selectedChat = chats.find(c => c.id === selectedChatId);
  const chatPartner = selectedChat?.users.find(u => u.id !== currentUserId);

  if (!currentUserId) return <div className="flex items-center justify-center h-screen w-screen">Loading user...</div>;

  return (
    <div className="h-screen w-screen bg-surface-1 text-on-surface flex overflow-hidden">
      <Sidebar 
        chats={chats} 
        selectedChatId={selectedChatId} 
        onSelectChat={handleSelectChat}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        currentUserId={currentUserId}
        onLogout={logout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchResults={searchResults}
        isSearching={isSearching}
        onStartChat={handleStartChat}
      />
      
      <main className="flex-1 flex flex-col transition-all duration-300">
        {selectedChat && chatPartner ? (
          <ChatWindow
            chatPartner={chatPartner}
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading && messages.length === 0}
            isPartnerTyping={false} // This feature is for a future update
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            currentUserId={currentUserId}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-surface-2 p-4">
           {error ? (
              <div className="text-center text-red-600 bg-red-100 p-6 rounded-lg shadow-md max-w-md">
                <h2 className="text-xl font-semibold">An Error Occurred</h2>
                <p className="mt-2 text-sm">{error}</p>
                <p className="mt-4 text-xs text-gray-500">Please ensure the backend server is running and accessible. You might need to log in again.</p>
              </div>
           ) : (
            <div className="text-center">
              <MessageIcon className="w-24 h-24 text-surface-3 mx-auto" />
              <h2 className="mt-4 text-2xl font-semibold">Welcome, {user?.name}!</h2>
              <p className="mt-2 text-on-surface/70">Select a conversation or find a user to start chatting.</p>
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

export default ChatPage;
