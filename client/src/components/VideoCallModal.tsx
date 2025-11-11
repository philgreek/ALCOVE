import React from 'react';
import { useWebRTC } from '../context/WebRTCContext';
import { MicIcon, MicOffIcon, VideoIcon, VideoOffIcon, CallEndIcon } from './Icons';

interface VideoCallModalProps {
    myVideoRef: React.RefObject<HTMLVideoElement>;
    userVideoRef: React.RefObject<HTMLVideoElement>;
}

const VideoCallModal: React.FC<VideoCallModalProps> = ({ myVideoRef, userVideoRef }) => {
    const { 
        leaveCall, 
        toggleAudio, 
        toggleVideo, 
        isAudioEnabled, 
        isVideoEnabled,
        call 
    } = useWebRTC();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center p-4">
            <div className="relative w-full h-full max-w-6xl max-h-[80vh] bg-on-surface rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row gap-2 p-2">
                {/* Remote User's Video */}
                <div className="relative flex-1 bg-black rounded-lg overflow-hidden">
                    <video playsInline ref={userVideoRef} autoPlay className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-sm px-2 py-1 rounded">
                        {call?.from.name || 'Partner'}
                    </div>
                </div>

                {/* My Video */}
                <div className="relative w-full md:w-1/4 h-1/3 md:h-auto bg-black rounded-lg overflow-hidden self-center md:self-auto">
                     <video playsInline muted ref={myVideoRef} autoPlay className="w-full h-full object-cover" />
                     <div className="absolute bottom-2 left-2 bg-black/50 text-white text-sm px-2 py-1 rounded">
                        You
                    </div>
                </div>
            </div>

             {/* Controls */}
            <div className="mt-4 flex items-center justify-center gap-4">
                <button 
                    onClick={toggleAudio} 
                    className={`p-4 rounded-full transition-colors ${isAudioEnabled ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-500 hover:bg-red-400'}`}
                >
                    {isAudioEnabled ? <MicIcon className="w-6 h-6 text-white" /> : <MicOffIcon className="w-6 h-6 text-white" />}
                </button>
                 <button 
                    onClick={toggleVideo} 
                    className={`p-4 rounded-full transition-colors ${isVideoEnabled ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-500 hover:bg-red-400'}`}
                >
                    {isVideoEnabled ? <VideoIcon className="w-6 h-6 text-white" /> : <VideoOffIcon className="w-6 h-6 text-white" />}
                </button>
                 <button 
                    onClick={() => leaveCall()} 
                    className="p-4 rounded-full bg-red-600 hover:bg-red-500 transition-colors"
                >
                    <CallEndIcon className="w-6 h-6 text-white" />
                </button>
            </div>
        </div>
    );
};

export default VideoCallModal;
