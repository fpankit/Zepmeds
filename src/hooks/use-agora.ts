
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
  const isJoiningRef = useRef(false);
  const isMountedRef = useRef(false); // Ref to track component mount state

  const leave = useCallback(async () => {
    if (agoraClient.connectionState !== 'CONNECTED') {
      return;
    }
      
    localAudioTrackRef.current?.stop();
    localAudioTrackRef.current?.close();
    localAudioTrackRef.current = null;
    
    localVideoTrack?.stop();
    localVideoTrack?.close();
    setLocalVideoTrack(null);
    
    await agoraClient.leave();

    setRemoteUsers([]);
    setIsJoined(false);
    isJoiningRef.current = false;
  }, [localVideoTrack]);


  useEffect(() => {
    isMountedRef.current = true;
    
    const join = async () => {
      if (isJoiningRef.current || agoraClient.connectionState === 'CONNECTED') {
        return;
      }
      isJoiningRef.current = true;
      setIsJoining(true);

      const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => {
          await agoraClient.subscribe(user, mediaType);
          if (isMountedRef.current) {
            setRemoteUsers(Array.from(agoraClient.remoteUsers));
          }
          if (mediaType === 'audio') {
            user.audioTrack?.play();
          }
      };

      const handleUserUnpublished = () => {
          if (isMountedRef.current) {
            setRemoteUsers(Array.from(agoraClient.remoteUsers));
          }
      };
      
      const handleConnectionStateChange = (curState: ConnectionState) => {
          if (isMountedRef.current) {
            if (curState === 'CONNECTED') {
                setIsJoined(true);
                setIsJoining(false);
            } else if (curState === 'DISCONNECTED' || curState === 'FAILED') {
                setIsJoined(false);
                setIsJoining(false);
                isJoiningRef.current = false;
            }
          }
      }
      
      try {
          agoraClient.on('user-published', handleUserPublished);
          agoraClient.on('user-unpublished', handleUserUnpublished);
          agoraClient.on('user-left', handleUserUnpublished);
          agoraClient.on('connection-state-change', handleConnectionStateChange);

          await agoraClient.join(appId, channelName, token, null);
          
          // Check if component is still mounted after join
          if (!isMountedRef.current) return;

          const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
          
          if (!isMountedRef.current) {
            audioTrack.close();
            videoTrack.close();
            return;
          }

          localAudioTrackRef.current = audioTrack;
          setLocalVideoTrack(videoTrack);
          
          await agoraClient.publish([audioTrack, videoTrack]);
          
      } catch (error) {
          console.error('Failed to join or publish:', error);
          if (isMountedRef.current) {
            setIsJoining(false);
            isJoiningRef.current = false;
          }
      }
    };
    
    join();

    return () => {
        isMountedRef.current = false;
        agoraClient.removeAllListeners();
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
