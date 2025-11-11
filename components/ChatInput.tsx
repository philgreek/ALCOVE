
import React, { useState } from 'react';
import { SendIcon, AttachmentIcon, MicIcon } from './Icons';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  return (
    <div className="p-3 border-t border-surface-3 bg-surface-2 flex-shrink-0">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <button type="button" className="p-2 rounded-full hover:bg-surface-3 transition-colors flex-shrink-0">
            <AttachmentIcon className="w-6 h-6"/>
        </button>
        <div className="relative flex-1">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="w-full bg-surface-1 border-none rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-primary"
            autoComplete="off"
          />
          <button type="button" className="absolute top-1/2 right-3 -translate-y-1/2 p-1 rounded-full hover:bg-surface-3 transition-colors flex-shrink-0">
            <MicIcon className="w-6 h-6"/>
          </button>
        </div>
        <button type="submit" className="p-3 bg-primary text-on-primary rounded-full hover:bg-primary-light transition-colors flex-shrink-0 disabled:bg-gray-400" disabled={!text.trim()}>
          <SendIcon className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
