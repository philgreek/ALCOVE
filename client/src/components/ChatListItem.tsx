import React from 'react';
import { Chat } from '../types';

interface ChatListItemProps {
  chat: Chat;
  isSelected: boolean;
  onSelect: () => void;
}

const formatTimestamp = (date: Date) => {
    // Приводим к объекту Date, если это строка
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours < 24 && d.getDate() === now.getDate()) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
}


const ChatListItem: React.FC<ChatListItemProps> = ({ chat, isSelected, onSelect }) => {
  const partner = chat.users.find(u => u.id !== 'user-0');

  if (!partner) return null;

  const lastMessageText = chat.lastMessage.text || '🎤 Voice message';

  return (
    <li onClick={onSelect}>
      <div className={`flex items-center p-3 mx-2 my-1 cursor-pointer rounded-2xl transition-colors ${isSelected ? 'bg-secondary-container' : 'hover:bg-surface-3'}`}>
        <div className="relative flex-shrink-0">
            <img src={partner.avatarUrl} alt={partner.name} className="w-14 h-14 rounded-full object-cover" />
            {partner.isOnline && <span className="absolute bottom-0 right-0 block h-4 w-4 rounded-full bg-green-500 border-2 border-surface-2"></span>}
        </div>
        <div className="ml-4 flex-1 overflow-hidden">
          <div className="flex justify-between items-baseline">
            <p className={`font-bold ${isSelected ? 'text-on-secondary-container' : 'text-on-surface'}`}>{partner.name}</p>
            <p className={`text-xs ${isSelected ? 'text-on-secondary-container/80' : 'text-on-surface/60'}`}>
                {formatTimestamp(chat.lastMessage.timestamp)}
            </p>
          </div>
          <div className="flex justify-between items-start mt-1">
            <p className={`text-sm truncate pr-2 ${isSelected ? 'text-on-secondary-container/90' : 'text-on-surface/70'}`}>
              {lastMessageText}
            </p>
            {chat.unreadCount > 0 && (
              <span className="bg-primary text-on-primary text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                {chat.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </li>
  );
};

export default ChatListItem;
