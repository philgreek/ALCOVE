import React from 'react';
import { useWebRTC } from '../context/WebRTCContext';
import { PhoneIcon } from './Icons';

const IncomingCall: React.FC = () => {
  const { answerCall, declineCall, call } = useWebRTC();

  return (
    <div className="fixed bottom-5 right-5 z-50 bg-surface-1 shadow-2xl rounded-2xl p-6 flex items-center animate-pulse">
      <div className="relative mr-4">
        <PhoneIcon className="w-10 h-10 text-primary" />
        <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-light"></span>
        </span>
      </div>
      <div>
        <h3 className="font-bold text-lg text-on-surface">Incoming Call</h3>
        <p className="text-on-surface/70">{call?.from.name || 'Someone'} is calling...</p>
        <div className="mt-4 flex gap-4">
          <button
            onClick={answerCall}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Accept
          </button>
          <button
            onClick={declineCall}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCall;
