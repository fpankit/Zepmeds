
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

// Store client and tracks outside of the component state to make them stable across renders
let agoraClient: IAgoraRTCClient | null = null;
let localAudioTrack: IMicrophoneAudioTrack | null = null;
let localVideoTrackState: ICameraVideoTrack | null = null;


export function useAgora({ appId, channelName, token }: AgoraConfig) {
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  
  const isJoiningRef = useRef(false);

  const leave = useCallback(async () => {
      if (localAudioTrack) {
          localAudioTrack.stop();
          localAudioTrack.close();
          localAudioTrack = null;
      }
      if (localVideoTrackState) {
          localVideoTrackState.stop();
          localVideoTrackState.close();
          localVideoTrackState = null;
      }
      
      if(agoraClient) {
        agoraClient.removeAllListeners();
        if (isJoined || agoraClient.connectionState === 'CONNECTED' || agoraClient.connectionState === 'CONNECTING') {
            await agoraClient.leave();
        }
      }

      setRemoteUsers([]);
      setIsJoined(false);
      setLocalVideoTrack(null);
      isJoiningRef.current = false;
  }, [isJoined]);


  const join = useCallback(async () => {
    if (!token || isJoined || isJoiningRef.current) return;
    
    isJoiningRef.current = true;
    setIsLoading(true);

    const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
    
    // Use a single client instance
    if (!agoraClient) {
        agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    }

    const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => {
      await agoraClient!.subscribe(user, mediaType);
      setRemoteUsers(prevUsers => [...prevUsers.filter(u => u.uid !== user.uid), user]);
      if (mediaType === 'audio') {
        user.audioTrack?.play();
      }
    };
    
    const handleUserUnpublished = (user: IAgoraRTCRemoteUser) => {
        setRemoteUsers(prevUsers => prevUsers.filter(u => u.uid !== user.uid));
    };

    agoraClient.on('user-published', handleUserPublished);
    agoraClient.on('user-unpublished', handleUserUnpublished);
    agoraClient.on('user-left', handleUserUnpublished);

    try {
      await agoraClient.join(appId, channelName, token, null);

      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      
      localAudioTrack = audioTrack;
      localVideoTrackState = videoTrack;
      
      setLocalVideoTrack(videoTrack);
      
      await agoraClient.publish([audioTrack, videoTrack]);
      
      setIsJoined(true);

    } catch (error) {
      console.error('Failed to join channel:', error);
      await leave();
    } finally {
      setIsLoading(false);
      isJoiningRef.current = false;
    }
  }, [appId, channelName, token, isJoined, leave]);


  const toggleAudio = useCallback(async () => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(!localAudioTrack.enabled);
    }
  }, []);

  const toggleVideo = useCallback(async () => {
    if (localVideoTrackState) {
      await localVideoTrackState.setEnabled(!localVideoTrackState.enabled);
    }
  }, []);


  return { isJoined, isLoading, remoteUsers, localVideoTrack, join, leave, toggleAudio, toggleVideo };
}
