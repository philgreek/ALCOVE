import React, { useRef, useEffect } from 'react';
import { User, Message } from '../types';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { PhoneIcon, VideoIcon, MoreIcon, MenuIcon } from './Icons';

interface ChatWindowProps {
  chatPartner: User;
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  isPartnerTyping: boolean;
  onToggleSidebar: () => void;
}

const TypingIndicator: React.FC = () => (
    <div className="px-4 py-3 rounded-2xl bg-surface-2 text-on-surface rounded-bl-none self-start">
        <div className="flex items-center space-x-1">
            <span className="w-2 h-2 bg-on-surface/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 bg-on-surface/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 bg-on-surface/40 rounded-full animate-bounce"></span>
        </div>
    </div>
);


const ChatWindow: React.FC<ChatWindowProps> = ({ chatPartner, messages, onSendMessage, isLoading, isPartnerTyping, onToggleSidebar }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isPartnerTyping]);

  return (
    <div className="flex flex-col h-full bg-surface-1">
      <header className="flex items-center p-3 border-b border-surface-3 flex-shrink-0 bg-surface-2/50 backdrop-blur-sm z-10">
        <button onClick={onToggleSidebar} className="md:hidden p-2 mr-2 rounded-full hover:bg-surface-3">
          <MenuIcon className="w-6 h-6"/>
        </button>
        <div className="relative">
          <img src={chatPartner.avatarUrl} alt={chatPartner.name} className="w-12 h-12 rounded-full object-cover" />
          {chatPartner.isOnline && <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-surface-2"></span>}
        </div>
        <div className="ml-4">
          <h2 className="text-lg font-bold">{chatPartner.name}</h2>
          <p className="text-sm text-on-surface/60">{chatPartner.isOnline ? 'Online' : 'Offline'}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-surface-3 transition-colors"><PhoneIcon className="w-6 h-6"/></button>
            <button className="p-2 rounded-full hover:bg-surface-3 transition-colors"><VideoIcon className="w-6 h-6"/></button>
            <button className="p-2 rounded-full hover:bg-surface-3 transition-colors"><MoreIcon className="w-6 h-6"/></button>
        </div>
      </header>

      <div className="flex-1 p-4 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <p>Loading messages...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(message => (
              <MessageBubble key={message.id} message={message} isSender={message.senderId === 'user-0'} />
            ))}
            {isPartnerTyping && (
                 <div className="flex justify-start">
                    <TypingIndicator />
                 </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <ChatInput onSendMessage={onSendMessage} />
    </div>
  );
};

export default ChatWindow;