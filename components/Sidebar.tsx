
import React from 'react';
import { Chat } from '../types';
import ChatListItem from './ChatListItem';
import { LogoIcon, SearchIcon, EditIcon } from './Icons';

interface SidebarProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ chats, selectedChatId, onSelectChat, isOpen }) => {
  return (
    <aside className={`absolute md:relative z-20 md:z-auto h-full flex flex-col bg-surface-2 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 w-full md:w-80 lg:w-96 border-r border-surface-3`}>
      <header className="p-4 border-b border-surface-3 flex-shrink-0">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <LogoIcon className="h-8 w-8 text-primary"/>
                <h1 className="text-xl font-bold text-on-surface">Chats</h1>
            </div>
            <button className="p-2 rounded-full hover:bg-surface-3 transition-colors">
                <EditIcon className="w-6 h-6"/>
            </button>
        </div>
        <div className="mt-4 relative">
            <SearchIcon className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 text-on-surface/50"/>
            <input type="text" placeholder="Search" className="w-full bg-surface-1 border border-surface-3 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"/>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto">
        <ul className="py-2">
          {chats.map(chat => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              isSelected={chat.id === selectedChatId}
              onSelect={() => onSelectChat(chat.id)}
            />
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
