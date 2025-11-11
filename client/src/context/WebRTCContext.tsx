import React, { createContext, useState, useRef, useEffect, useContext, ReactNode } from 'react';
import Peer from 'simple-peer';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { WebRTCContextType, Call } from '../types';

const WebRTCContext = createContext<WebRTCContextType | undefined>(undefined);

const WebRTCProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { socket } = useSocket();
  const { user } = useAuth();

  const [call, setCall] = useState<Call | null>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<Peer.Instance | null>(null);
  
  const setupMedia = async () => {
    try {
        const currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(currentStream);
        if (myVideo.current) {
            myVideo.current.srcObject = currentStream;
        }
        return currentStream;
    } catch (error) {
        console.error("Error accessing media devices.", error);
        return null;
    }
  };

  useEffect(() => {
    if (!socket || !user) return;
    
    socket.on('call-incoming', ({ from, signal }) => {
      setCall({ isReceivingCall: true, from, signal });
    });
    
    socket.on('call-ended', () => {
        leaveCall(false); // Don't emit event back
    });

    return () => {
        socket.off('call-incoming');
        socket.off('call-ended');
    }

  }, [socket, user]);

  const callUser = async (id: string, partnerName: string) => {
    const currentStream = await setupMedia();
    if (!currentStream || !socket || !user) return;
    
    setCallEnded(false);
    
    setCall({
        isReceivingCall: false,
        from: { id, name: partnerName },
        signal: null,
    });
    
    const peer = new Peer({ initiator: true, trickle: true, stream: currentStream });

    peer.on('signal', (data) => {
      socket.emit('call-user', {
        to: id,
        from: { id: user.id, name: user.name },
        signalData: data,
      });
    });

    peer.on('stream', (remoteStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });

    socket.on('call-accepted', (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = async () => {
    const currentStream = await setupMedia();
    if (!currentStream || !socket || !call) return;
    
    setCallAccepted(true);
    setCallEnded(false);
    
    const peer = new Peer({ initiator: false, trickle: true, stream: currentStream });

    peer.on('signal', (data) => {
      socket.emit('answer-call', { signal: data, to: call.from.id });
    });

    peer.on('stream', (remoteStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });

    peer.signal(call.signal);
    connectionRef.current = peer;
  };

  const leaveCall = (emitEvent = true) => {
    setCallEnded(true);
    setCallAccepted(false);
    setCall(null);

    if (emitEvent && socket && call) {
        const partnerId = call.from.id;
        socket.emit('call-ended', { to: partnerId });
    }

    if (connectionRef.current) {
      connectionRef.current.destroy();
      connectionRef.current = null;
    }
    
    stream?.getTracks().forEach(track => track.stop());
    setStream(null);
  };
  
  const declineCall = () => {
    setCall(null);
    // Optionally, notify the caller that the call was declined
  };
  
  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = !isVideoEnabled;
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !isAudioEnabled;
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  return (
    <WebRTCContext.Provider value={{
      call,
      callAccepted,
      myVideo,
      userVideo,
      stream,
      callUser,
      answerCall,
      leaveCall,
      declineCall,
      toggleVideo,
      toggleAudio,
      isVideoEnabled,
      isAudioEnabled,
      callEnded
    }}>
      {children}
    </WebRTCContext.Provider>
  );
};

const useWebRTC = () => {
  const context = useContext(WebRTCContext);
  if (context === undefined) {
    throw new Error('useWebRTC must be used within a WebRTCProvider');
  }
  return context;
};

export { WebRTCProvider, useWebRTC };
