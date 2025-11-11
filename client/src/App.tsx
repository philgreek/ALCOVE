import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useWebRTC } from './context/WebRTCContext';
import IncomingCall from './components/IncomingCall';
import VideoCallModal from './components/VideoCallModal';

const App: React.FC = () => {
  const { call, callAccepted, myVideo, userVideo, stream, callEnded } = useWebRTC();
  
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
      
      {call && call.isReceivingCall && !callAccepted && <IncomingCall />}
      {stream && callAccepted && !callEnded && (
        <VideoCallModal myVideoRef={myVideo} userVideoRef={userVideo} />
      )}
    </>
  );
};

export default App;