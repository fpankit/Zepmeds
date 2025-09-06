
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import type {
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

// These are now managed by useRef within the hook to be instance-specific
// and survive re-renders without being global.

export function useAgora({ appId, channelName, token }: AgoraConfig) {
  const agoraClientRef = useRef<IAgoraRTCClient | null>(null);
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const localVideoTrackRef = useRef<ICameraVideoTrack | null>(null);
  
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  
  const hasJoinedRef = useRef(false);

  const cleanup = useCallback(async () => {
    if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
    }
    if (localVideoTrackRef.current) {
        localVideoTrackRef.current.stop();
        localVideoTrackRef.current.close();
        localVideoTrackRef.current = null;
    }
    
    if(agoraClientRef.current) {
      agoraClientRef.current.removeAllListeners();
      if (hasJoinedRef.current) {
        await agoraClientRef.current.leave();
      }
    }
    setRemoteUsers([]);
    setIsJoined(false);
    setLocalVideoTrack(null);
    hasJoinedRef.current = false;
  }, []);


  const join = useCallback(async () => {
    if (!token || hasJoinedRef.current) return;
    
    setIsLoading(true);

    try {
        agoraClientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        const client = agoraClientRef.current;
        
        const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => {
            // Ensure we only subscribe when connected
            if(client.connectionState === 'CONNECTED') {
                await client.subscribe(user, mediaType);
                setRemoteUsers(prevUsers => [...prevUsers.filter(u => u.uid !== user.uid), user]);
                 if (mediaType === 'audio') {
                    user.audioTrack?.play();
                }
            }
        };
        
        const handleUserUnpublished = (user: IAgoraRTCRemoteUser) => {
            setRemoteUsers(prevUsers => prevUsers.filter(u => u.uid !== user.uid));
        };

        const handleConnectionStateChange = (curState: ConnectionState, revState: ConnectionState) => {
             // You can add more logic here to handle connection states, e.g., show a notification on disconnect.
            if (curState === "DISCONNECTED" || curState === "FAILED") {
                // If connection is lost, cleanup might be needed
                if(hasJoinedRef.current) {
                     cleanup();
                }
            }
        }

        client.on('user-published', handleUserPublished);
        client.on('user-unpublished', handleUserUnpublished);
        client.on('user-left', handleUserUnpublished);
        client.on('connection-state-change', handleConnectionStateChange);

        await client.join(appId, channelName, token, null);

        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        
        localAudioTrackRef.current = audioTrack;
        localVideoTrackRef.current = videoTrack;
        setLocalVideoTrack(videoTrack);
        
        await client.publish([audioTrack, videoTrack]);
        
        setIsJoined(true);
        hasJoinedRef.current = true;

    } catch (error) {
      console.error('Failed to join or publish:', error);
      await cleanup();
    } finally {
      setIsLoading(false);
    }
  }, [appId, channelName, token, cleanup]);


  const leave = useCallback(async () => {
    await cleanup();
  }, [cleanup]);

  const toggleAudio = useCallback(async () => {
    if (localAudioTrackRef.current) {
      await localAudioTrackRef.current.setEnabled(!localAudioTrackRef.current.enabled);
    }
  }, []);

  const toggleVideo = useCallback(async () => {
    if (localVideoTrackRef.current) {
      await localVideoTrackRef.current.setEnabled(!localVideoTrackRef.current.enabled);
    }
  }, []);


  return { isJoined, isLoading, remoteUsers, localVideoTrack, join, leave, toggleAudio, toggleVideo };
}
