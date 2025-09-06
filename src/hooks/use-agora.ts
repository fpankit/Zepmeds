
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng';

interface AgoraConfig {
  appId: string;
  channelName: string;
  token: string | null;
}

// Create a single, persistent client instance.
const agoraClient: IAgoraRTCClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

export function useAgora({ appId, channelName, token }: AgoraConfig) {
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  
  const [isJoined, setIsJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  // Ref to track if the component is mounted, to prevent state updates on unmounted components.
  const isMountedRef = useRef(true);


  const leave = useCallback(async () => {
    // Stop and close local tracks
    if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
    }
    if (localVideoTrack) {
        localVideoTrack.stop();
        localVideoTrack.close();
        setLocalVideoTrack(null);
    }
    
    // Remove all listeners to prevent memory leaks
    agoraClient.removeAllListeners();

    // Leave the channel only if connected
    if (agoraClient.connectionState === 'CONNECTED') {
       await agoraClient.leave();
    }
    
    // Reset state
    if (isMountedRef.current) {
      setRemoteUsers([]);
      setIsJoined(false);
    }
  }, [localVideoTrack]);


  useEffect(() => {
    isMountedRef.current = true;

    const join = async () => {
        // Prevent joining if already connected or connecting
        if (agoraClient.connectionState === 'CONNECTED' || agoraClient.connectionState === 'CONNECTING') {
            return;
        }

        if (isMountedRef.current) setIsJoining(true);

        // Event handlers
        const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => {
            if (!isMountedRef.current) return;
            await agoraClient.subscribe(user, mediaType);
            setRemoteUsers(Array.from(agoraClient.remoteUsers));
        };

        const handleUserUnpublished = () => {
            if (!isMountedRef.current) return;
            setRemoteUsers(Array.from(agoraClient.remoteUsers));
        };
        
        agoraClient.on('user-published', handleUserPublished);
        agoraClient.on('user-unpublished', handleUserUnpublished);
        agoraClient.on('user-left', handleUserUnpublished);
        
        try {
            // Join the channel
            await agoraClient.join(appId, channelName, token, null);
            if (!isMountedRef.current) return;

            // Create and publish local tracks
            const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
            if (!isMountedRef.current) {
                audioTrack.close();
                videoTrack.close();
                return;
            }

            localAudioTrackRef.current = audioTrack;
            setLocalVideoTrack(videoTrack);
            
            await agoraClient.publish([audioTrack, videoTrack]);
            if (!isMountedRef.current) return;

            setIsJoined(true);
        } catch (error) {
            console.error('Failed to join or publish:', error);
            // Optionally, set an error state here to show in the UI
        } finally {
            if (isMountedRef.current) {
                setIsJoining(false);
            }
        }
    };
    
    join();

    // The cleanup function is critical for React's StrictMode and for leaving the call.
    return () => {
        isMountedRef.current = false;
        leave();
    };
  }, [appId, channelName, token, leave]);


  const toggleAudio = useCallback(async () => {
    if (localAudioTrackRef.current) {
      const isEnabled = localAudioTrackRef.current.enabled;
      await localAudioTrackRef.current.setEnabled(!isEnabled);
      setIsAudioMuted(isEnabled);
    }
  }, []);

  const toggleVideo = useCallback(async () => {
    if (localVideoTrack) {
      const isEnabled = localVideoTrack.enabled;
      await localVideoTrack.setEnabled(!isEnabled);
      setIsVideoMuted(isEnabled);
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
