
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  ConnectionState,
} from 'agora-rtc-sdk-ng';

interface AgoraConfig {
  appId: string;
  channelName: string;
  token: string;
}

// Create the Agora client instance outside the hook to ensure it's a singleton.
// This prevents re-initialization on every render and is crucial for stability.
const agoraClient: IAgoraRTCClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

export function useAgora({ appId, channelName, token }: AgoraConfig) {
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  
  const [isJoined, setIsJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  
  // This ref ensures that we only attempt to join once, preventing race conditions.
  const hasJoinedRef = useRef(false);

  const leave = useCallback(async () => {
    // Only leave if the client is in a connected state.
    if (agoraClient.connectionState !== 'CONNECTED') {
        return;
    }
      
    // Stop and close local tracks
    localAudioTrackRef.current?.stop();
    localAudioTrackRef.current?.close();
    localAudioTrackRef.current = null;
    
    localVideoTrack?.stop();
    localVideoTrack?.close();
    setLocalVideoTrack(null);
    
    // Unpublish and leave the channel
    await agoraClient.unpublish();
    await agoraClient.leave();

    setRemoteUsers([]);
    setIsJoined(false);
    hasJoinedRef.current = false;
  }, [localVideoTrack]);


  // Effect to join and handle component lifecycle
  useEffect(() => {
    
    const join = async () => {
        // Prevent joining if already joined or in the process
        if (hasJoinedRef.current || !token) return;

        hasJoinedRef.current = true;
        setIsJoining(true);

        const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => {
            await agoraClient.subscribe(user, mediaType);
            setRemoteUsers(Array.from(agoraClient.remoteUsers));
            if (mediaType === 'audio') {
            user.audioTrack?.play();
            }
        };

        const handleUserUnpublished = () => {
            setRemoteUsers(Array.from(agoraClient.remoteUsers));
        };
        
        const handleConnectionStateChange = (curState: ConnectionState) => {
            if (curState === 'CONNECTED') {
                setIsJoined(true);
                setIsJoining(false);
            } else if (curState === 'DISCONNECTED' || curState === 'FAILED') {
                setIsJoined(false);
                setIsJoining(false);
                hasJoinedRef.current = false; // Allow re-joining
            }
        }
        
        try {
            agoraClient.on('user-published', handleUserPublished);
            agoraClient.on('user-unpublished', handleUserUnpublished);
            agoraClient.on('user-left', handleUserUnpublished);
            agoraClient.on('connection-state-change', handleConnectionStateChange);

            await agoraClient.join(appId, channelName, token, null);
            
            const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
            
            localAudioTrackRef.current = audioTrack;
            setLocalVideoTrack(videoTrack);
            
            await agoraClient.publish([audioTrack, videoTrack]);
            
        } catch (error) {
            console.error('Failed to join or publish:', error);
            hasJoinedRef.current = false; // Reset on failure
            setIsJoining(false);
        }
    };
    
    join();

    // The cleanup function is critical for stability.
    // It will be called when the component unmounts.
    return () => {
        // Unsubscribe from all events to prevent memory leaks
        agoraClient.removeAllListeners();
        // Leave the channel gracefully
        leave();
    };
  }, [appId, channelName, token, leave]);


  const toggleAudio = useCallback(async () => {
    if (localAudioTrackRef.current) {
      const newMutedState = !localAudioTrackRef.current.enabled;
      await localAudioTrackRef.current.setEnabled(!newMutedState);
      setIsAudioMuted(newMutedState);
    }
  }, []);

  const toggleVideo = useCallback(async () => {
    if (localVideoTrack) {
      const newMutedState = !localVideoTrack.enabled;
      await localVideoTrack.setEnabled(!newMutedState);
      setIsVideoMuted(newMutedState);
    }
  }, [localVideoTrack]);

  return { 
    isJoined, 
    isJoining,
    remoteUsers, 
    localVideoTrack, 
    isAudioMuted,
    isVideoMuted,
    leave, 
    toggleAudio, 
    toggleVideo 
  };
}
