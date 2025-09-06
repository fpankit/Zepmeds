
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
const agoraClient: IAgoraRTCClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

export function useAgora({ appId, channelName, token }: AgoraConfig) {
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  
  const [isJoined, setIsJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(true); // Start in joining state
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const isJoiningRef = useRef(false);

  const cleanup = useCallback(async () => {
    // Unsubscribe and remove all listeners
    agoraClient.removeAllListeners();
    
    // Stop and close local tracks
    localAudioTrackRef.current?.stop();
    localAudioTrackRef.current?.close();
    localAudioTrackRef.current = null;
    
    localVideoTrack?.stop();
    localVideoTrack?.close();
    setLocalVideoTrack(null);
    
    // Leave the channel if connected
    if (agoraClient.connectionState === 'CONNECTED' || agoraClient.connectionState === 'CONNECTING') {
      try {
        await agoraClient.leave();
      } catch (e) {
        console.error("Error leaving channel:", e);
      }
    }

    // Reset state
    setRemoteUsers([]);
    setIsJoined(false);
    isJoiningRef.current = false;
  }, [localVideoTrack]);

  const join = useCallback(async () => {
    if (!token || isJoiningRef.current || isJoined) return;
    
    isJoiningRef.current = true;
    setIsJoining(true);

    try {
      const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => {
        // Only subscribe if the client is in the 'CONNECTED' state
        if (agoraClient.connectionState === 'CONNECTED') {
           await agoraClient.subscribe(user, mediaType);
        }
        setRemoteUsers(Array.from(agoraClient.remoteUsers));
        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
      };

      const handleUserUnpublished = () => {
        setRemoteUsers(Array.from(agoraClient.remoteUsers));
      };

      agoraClient.on('user-published', handleUserPublished);
      agoraClient.on('user-unpublished', handleUserUnpublished);
      agoraClient.on('user-left', handleUserUnpublished);

      await agoraClient.join(appId, channelName, token, null);
      
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      
      localAudioTrackRef.current = audioTrack;
      setLocalVideoTrack(videoTrack);
      
      await agoraClient.publish([audioTrack, videoTrack]);
      
      setIsJoined(true);

    } catch (error) {
      console.error('Failed to join or publish:', error);
      await cleanup(); // Cleanup on failure
    } finally {
      setIsJoining(false);
      isJoiningRef.current = false;
    }
  }, [appId, channelName, token, cleanup, isJoined]);

  const leave = useCallback(async () => {
    await cleanup();
  }, [cleanup]);

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

  // Effect to join and leave the channel
  useEffect(() => {
    join();
    return () => {
      leave();
    };
  }, [join, leave]);


  return { 
    isJoined, 
    isJoining,
    remoteUsers, 
    localVideoTrack, 
    isAudioMuted,
    isVideoMuted,
    join, 
    leave, 
    toggleAudio, 
    toggleVideo 
  };
}
