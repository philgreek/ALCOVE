import React from "react";
import { Socket } from "socket.io-client";

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  isOnline?: boolean;
  token?: string;
}

export interface Message {
  id:string;
  chatId?: string;
  text?: string;
  audio?: {
    dataUrl: string;
  };
  timestamp: Date;
  senderId: string;
}

export interface Chat {
  id: string;
  users: User[];
  lastMessage: Message;
  unreadCount: number;
}


// WebRTC Types
export interface Call {
  isReceivingCall: boolean;
  from: {
    id: string;
    name: string;
  };
  signal: any;
}

export interface WebRTCContextType {
  call: Call | null;
  callAccepted: boolean;
  myVideo: React.RefObject<HTMLVideoElement>;
  userVideo: React.RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
  callUser: (id: string, partnerName: string) => void;
  answerCall: () => void;
  leaveCall: () => void;
  declineCall: () => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  callEnded: boolean;
}

export interface SocketContextType {
  socket: Socket | null;
}