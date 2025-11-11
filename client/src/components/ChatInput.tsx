import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, AttachmentIcon, MicIcon, StopCircleIcon } from './Icons';

interface ChatInputProps {
  onSendMessage: (content: { text?: string; audio?: { dataUrl: string }}) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);


  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      setRecordingTime(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      const options = { mimeType: 'audio/webm' };
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      });

      mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
            const base64String = reader.result as string;
            onSendMessage({ audio: { dataUrl: base64String } });
        };
        
        audioChunksRef.current = [];
        stream.getTracks().forEach(track => track.stop()); // Stop microphone access
        if(timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      });

      mediaRecorder.start();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Microphone access was denied. Please allow access in your browser settings.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage({ text: text.trim() });
      setText('');
    }
  };
  
  useEffect(() => {
    return () => {
        if(timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  return (
    <div className="p-3 border-t border-surface-3 bg-surface-2 flex-shrink-0">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        {!isRecording && (
          <button type="button" className="p-2 rounded-full hover:bg-surface-3 transition-colors flex-shrink-0">
              <AttachmentIcon className="w-6 h-6"/>
          </button>
        )}
        <div className="relative flex-1">
          {isRecording ? (
             <div className="flex items-center justify-between w-full bg-surface-1 rounded-full py-3 px-5">
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-3"></div>
                    <span className="text-on-surface font-mono">{formatTime(recordingTime)}</span>
                </div>
                 <button type="button" onClick={handleMicClick} className="p-1 rounded-full text-red-500 hover:bg-red-100 transition-colors flex-shrink-0">
                    <StopCircleIcon className="w-6 h-6"/>
                 </button>
             </div>
          ) : (
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-surface-1 border-none rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-primary"
              autoComplete="off"
            />
          )}
        </div>
        {text.trim() ? (
            <button type="submit" className="p-3 bg-primary text-on-primary rounded-full hover:bg-primary-light transition-colors flex-shrink-0">
                <SendIcon className="w-6 h-6" />
            </button>
        ) : (
             <button type="button" onClick={handleMicClick} className={`p-3 ${isRecording ? 'bg-red-500' : 'bg-primary'} text-on-primary rounded-full hover:bg-primary-light transition-colors flex-shrink-0`}>
                <MicIcon className="w-6 h-6"/>
             </button>
        )}
      </form>
    </div>
  );
};

export default ChatInput;
