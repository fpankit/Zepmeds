
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

  const join = useCallback(async () => {
    if (!token || isJoined || isLoading) return;

    setIsLoading(true);

    const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;

    if (!clientRef.current) {
        clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    }
    const client = clientRef.current;

    const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => {
      await client.subscribe(user, mediaType);
      if (mediaType === 'video') {
        setRemoteUsers((prevUsers) => {
            if (prevUsers.find(u => u.uid === user.uid)) {
                return prevUsers;
            }
            return [...prevUsers, user]
        });
      }
      if (mediaType === 'audio') {
        user.audioTrack?.play();
      }
    };

    const handleUserUnpublished = (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => {
       if (mediaType === 'video') {
        setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
      }
      if (mediaType === 'audio') {
        user.audioTrack?.stop();
      }
    };

    const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
      setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
    };

    client.on('user-published', handleUserPublished);
    client.on('user-unpublished', handleUserUnpublished);
    client.on('user-left', handleUserLeft);

    try {
      await client.join(appId, channelName, token, null);

      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      localTracksRef.current = { audioTrack, videoTrack };
      setLocalVideoTrack(videoTrack);
      
      await client.publish([audioTrack, videoTrack]);
      
      setIsJoined(true);
    } catch (error) {
      console.error('Failed to join channel:', error);
    } finally {
        setIsLoading(false);
    }
  }, [appId, channelName, token, isJoined, isLoading]);

  const leave = useCallback(async () => {
    if (localTracksRef.current.audioTrack) {
      localTracksRef.current.audioTrack.stop();
      localTracksRef.current.audioTrack.close();
      localTracksRef.current.audioTrack = null;
    }
    if (localTracksRef.current.videoTrack) {
      localTracksRef.current.videoTrack.stop();
      localTracksRef.current.videoTrack.close();
      localTracksRef.current.videoTrack = null;
    }
    setLocalVideoTrack(null);
    setRemoteUsers([]);
    setIsJoined(false);
    
    if (clientRef.current && (clientRef.current.connectionState === 'CONNECTED' || clientRef.current.connectionState === 'CONNECTING')) {
        await clientRef.current.leave();
    }
    
    clientRef.current?.removeAllListeners();
    // Do not nullify clientRef.current here to allow re-joining
  }, []);

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
