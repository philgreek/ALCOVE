import React from 'react';
import { User } from '../types';

interface SearchResultItemProps {
  user: User;
  onSelect: (userId: string) => void;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ user, onSelect }) => {
  return (
    <li onClick={() => onSelect(user.id)}>
      <div className="flex items-center p-3 mx-2 my-1 cursor-pointer rounded-2xl hover:bg-surface-3 transition-colors">
        <div className="relative flex-shrink-0">
          <img src={user.avatarUrl} alt={user.name} className="w-14 h-14 rounded-full object-cover" />
           {user.isOnline && <span className="absolute bottom-0 right-0 block h-4 w-4 rounded-full bg-green-500 border-2 border-surface-2"></span>}
        </div>
        <div className="ml-4 flex-1 overflow-hidden">
          <p className="font-bold text-on-surface">{user.name}</p>
        </div>
      </div>
    </li>
  );
};

export default SearchResultItem;