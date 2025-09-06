
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
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localTracksRef = useRef<{
    audioTrack: IMicrophoneAudioTrack | null;
    videoTrack: ICameraVideoTrack | null;
  }>({ audioTrack: null, videoTrack: null });

  const join = useCallback(async () => {
    if (!token) return;

    // Dynamically import AgoraRTC only on the client-side
    const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;

    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    clientRef.current = client;

    const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => {
      await client.subscribe(user, mediaType);
      if (mediaType === 'video') {
        // Check if user already exists to avoid duplicates
        setRemoteUsers((prevUsers) => {
            if (prevUsers.find(u => u.uid === user.uid)) {
                return prevUsers;
            }
            return [...prevUsers, user]
        });
        setTimeout(() => user.videoTrack?.play(`remote-player-${user.uid}`), 0);
      }
      if (mediaType === 'audio') {
        user.audioTrack?.play();
      }
    };

    const handleUserUnpublished = (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => {
      if (mediaType === 'video') {
        setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
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
      
      videoTrack.play('local-player');
      setIsJoined(true);
    } catch (error) {
      console.error('Failed to join channel:', error);
    }
  }, [appId, channelName, token]);

  const leave = useCallback(async () => {
    localTracksRef.current.audioTrack?.close();
    localTracksRef.current.videoTrack?.close();
    setLocalVideoTrack(null);
    
    if (clientRef.current && clientRef.current.connectionState === 'CONNECTED') {
        await clientRef.current?.leave();
    }
    
    setIsJoined(false);
    setRemoteUsers([]);
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

  return { isJoined, remoteUsers, localVideoTrack, join, leave, toggleAudio, toggleVideo };
}
