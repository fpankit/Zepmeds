
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

const agoraClient: IAgoraRTCClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

export function useAgora({ appId, channelName, token }: AgoraConfig) {
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  
  const [isJoined, setIsJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);

  const leave = useCallback(async () => {
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
    
    agoraClient.removeAllListeners();

    if (agoraClient.connectionState === 'CONNECTED') {
       await agoraClient.leave();
    }

    setRemoteUsers([]);
    setIsJoined(false);
  }, [localVideoTrack]);


  useEffect(() => {
    let isMounted = true;

    const join = async () => {
        if (agoraClient.connectionState === 'CONNECTED' || agoraClient.connectionState === 'CONNECTING') {
            return;
        }

        setIsJoining(true);

        const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => {
            if (!isMounted) return;
            await agoraClient.subscribe(user, mediaType);
            setRemoteUsers(Array.from(agoraClient.remoteUsers));
        };

        const handleUserUnpublished = () => {
            if (!isMounted) return;
            setRemoteUsers(Array.from(agoraClient.remoteUsers));
        };
        
        agoraClient.on('user-published', handleUserPublished);
        agoraClient.on('user-unpublished', handleUserUnpublished);
        agoraClient.on('user-left', handleUserUnpublished);
        
        try {
            await agoraClient.join(appId, channelName, token, null);
            if (!isMounted) return;

            const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
            if (!isMounted) {
                audioTrack.close();
                videoTrack.close();
                return;
            }

            localAudioTrackRef.current = audioTrack;
            setLocalVideoTrack(videoTrack);
            
            await agoraClient.publish([audioTrack, videoTrack]);
            if (!isMounted) return;

            setIsJoined(true);
        } catch (error) {
            console.error('Failed to join or publish:', error);
        } finally {
            if (isMounted) {
                setIsJoining(false);
            }
        }
    };
    
    join();

    return () => {
        isMounted = false;
        leave();
    };
  }, [appId, channelName, token, leave]);


  const toggleAudio = useCallback(async () => {
    if (localAudioTrackRef.current) {
      await localAudioTrackRef.current.setEnabled(!localAudioTrackRef.current.enabled);
      setIsAudioMuted(!localAudioTrackRef.current.enabled);
    }
  }, []);

  const toggleVideo = useCallback(async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(!localVideoTrack.enabled);
      setIsVideoMuted(!localVideoTrack.enabled);
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
