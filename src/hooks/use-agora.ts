
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng';

interface AgoraConfig {
  appId: string;
  channelName: string;
  token: string;
}

export function useAgora({ appId, channelName, token }: AgoraConfig) {
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localTracksRef = useRef<{
    audioTrack: IMicrophoneAudioTrack | null;
    videoTrack: ICameraVideoTrack | null;
  }>({ audioTrack: null, videoTrack: null });
  const isJoiningRef = useRef(false);


  const leave = useCallback(async () => {
    if (localTracksRef.current.audioTrack) {
      localTracksRef.current.audioTrack.stop();
      localTracksRef.current.audioTrack.close();
    }
    if (localTracksRef.current.videoTrack) {
      localTracksRef.current.videoTrack.stop();
      localTracksRef.current.videoTrack.close();
    }
    localTracksRef.current = { audioTrack: null, videoTrack: null };

    if (clientRef.current) {
        clientRef.current.removeAllListeners();
        if (isJoined) {
          await clientRef.current.leave();
        }
    }
    
    setLocalVideoTrack(null);
    setRemoteUsers([]);
    setIsJoined(false);
    isJoiningRef.current = false;
  }, [isJoined]);


  const join = useCallback(async () => {
    if (!token || isJoined || isLoading || isJoiningRef.current) return;

    setIsLoading(true);
    isJoiningRef.current = true;

    const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;

    if (!clientRef.current) {
        clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    }
    const client = clientRef.current;

    const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => {
      await client.subscribe(user, mediaType);
      setRemoteUsers((prevUsers) => [...prevUsers.filter(u => u.uid !== user.uid), user]);
      if (mediaType === 'audio') {
        user.audioTrack?.play();
      }
    };

    const handleUserUnpublished = (user: IAgoraRTCRemoteUser) => {
        setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
    };

    client.on('user-published', handleUserPublished);
    client.on('user-unpublished', handleUserUnpublished);
    client.on('user-left', handleUserUnpublished);

    try {
      await client.join(appId, channelName, token, null);

      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      localTracksRef.current = { audioTrack, videoTrack };
      setLocalVideoTrack(videoTrack);
      
      await client.publish([audioTrack, videoTrack]);
      
      setIsJoined(true);
    } catch (error) {
      console.error('Failed to join channel:', error);
      await leave(); // Clean up on failure
    } finally {
        setIsLoading(false);
        isJoiningRef.current = false;
    }
  }, [appId, channelName, token, isJoined, isLoading, leave]);

  const toggleAudio = useCallback(async () => {
    if (localTracksRef.current.audioTrack) {
      await localTracksRef.current.audioTrack.setEnabled(!localTracksRef.current.audioTrack.enabled);
    }
  }, []);

  const toggleVideo = useCallback(async () => {
    if (localTracksRef.current.videoTrack) {
      await localTracksRef.current.videoTrack.setEnabled(!localTracksRef.current.videoTrack.enabled);
    }
  }, []);

  return { isJoined, isLoading, remoteUsers, localVideoTrack, join, leave, toggleAudio, toggleVideo };
}
