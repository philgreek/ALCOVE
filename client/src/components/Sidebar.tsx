import React from 'react';
import { Chat, User } from '../types';
import ChatListItem from './ChatListItem';
import SearchResultItem from './SearchResultItem';
import { LogoIcon, SearchIcon, EditIcon } from './Icons';

interface SidebarProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentUserId: string;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: User[];
  isSearching: boolean;
  onStartChat: (partnerId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  chats, 
  selectedChatId, 
  onSelectChat, 
  isOpen, 
  currentUserId, 
  onLogout,
  searchQuery,
  onSearchChange,
  searchResults,
  isSearching,
  onStartChat
}) => {
  const showSearchResults = searchQuery.length > 0;

  return (
    <aside className={`absolute md:relative z-20 md:z-auto h-full flex flex-col bg-surface-2 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 w-full sm:w-80 lg:w-96 border-r border-surface-3`}>
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
            <input 
              type="text" 
              placeholder="Search users to start a chat" 
              className="w-full bg-surface-1 border border-surface-3 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto">
        {showSearchResults ? (
          <div>
            <h2 className="p-3 text-sm font-semibold text-on-surface/60">Search Results</h2>
            <ul className="py-2">
              {isSearching && <li className="p-4 text-center text-on-surface/70">Searching...</li>}
              {!isSearching && searchResults.length === 0 && <li className="p-4 text-center text-on-surface/70">No users found.</li>}
              {searchResults.map(user => (
                <SearchResultItem key={user.id} user={user} onSelect={onStartChat} />
              ))}
            </ul>
          </div>
        ) : (
          <ul className="py-2">
            {chats.map(chat => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isSelected={chat.id === selectedChatId}
                onSelect={() => onSelectChat(chat.id)}
                currentUserId={currentUserId}
              />
            ))}
          </ul>
        )}
      </div>
      <footer className="p-4 border-t border-surface-3">
          <button onClick={onLogout} className="w-full text-left p-2 rounded-lg hover:bg-surface-3">Logout</button>
      </footer>
    </aside>
  );
};

export default Sidebar;