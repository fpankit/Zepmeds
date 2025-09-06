
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
  const isMountedRef = useRef(true);


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

    if (agoraClient.connectionState === 'CONNECTED' || agoraClient.connectionState === 'CONNECTING') {
       await agoraClient.leave();
    }
    
    if (isMountedRef.current) {
      setRemoteUsers([]);
      setIsJoined(false);
    }
  }, [localVideoTrack]);


  useEffect(() => {
    isMountedRef.current = true;

    const join = async () => {
        if (agoraClient.connectionState === 'CONNECTED' || agoraClient.connectionState === 'CONNECTING') {
            return;
        }

        if (isMountedRef.current) setIsJoining(true);

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
            await agoraClient.join(appId, channelName, token, null);

            // If component unmounted while joining, leave channel and exit.
            if (!isMountedRef.current) {
              await agoraClient.leave();
              return;
            }

            // Create tracks. If unmounted, clean up and exit.
            const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
            if (!isMountedRef.current) {
                audioTrack.close();
                videoTrack.close();
                await agoraClient.leave();
                return;
            }
            
            localAudioTrackRef.current = audioTrack;
            setLocalVideoTrack(videoTrack);
            
            // Publish tracks. If unmounted, exit.
            await agoraClient.publish([audioTrack, videoTrack]);
            if (!isMountedRef.current) return;

            setIsJoined(true);
        } catch (error) {
            console.error('Failed to join or publish:', error);
        } finally {
            if (isMountedRef.current) {
                setIsJoining(false);
            }
        }
    };
    
    join();

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
