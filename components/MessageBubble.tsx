
import React from 'react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isSender: boolean;
}

const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isSender }) => {
  const bubbleClasses = isSender
    ? 'bg-primary text-on-primary rounded-br-none self-end'
    : 'bg-surface-2 text-on-surface rounded-bl-none self-start';
  
  const containerClasses = isSender ? 'justify-end' : 'justify-start';

  return (
    <div className={`flex ${containerClasses}`}>
        <div className={`flex flex-col max-w-xs md:max-w-md ${isSender ? 'items-end' : 'items-start'}`}>
            <div className={`px-4 py-3 rounded-2xl ${bubbleClasses}`}>
                <p>{message.text}</p>
            </div>
            <span className="text-xs text-on-surface/50 mt-1 px-1">{formatTime(message.timestamp)}</span>
        </div>
    </div>
  );
};

export default MessageBubble;
