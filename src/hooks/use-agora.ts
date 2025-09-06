
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
  
  const leave = useCallback(async () => {
    // Only execute if actually connected
    if (agoraClient.connectionState !== 'CONNECTED') {
      return;
    }
      
    localAudioTrackRef.current?.stop();
    localAudioTrackRef.current?.close();
    localAudioTrackRef.current = null;
    
    localVideoTrack?.stop();
    localVideoTrack?.close();
    setLocalVideoTrack(null);
    
    // Unpublish is not needed as we are leaving the channel, which handles it.
    await agoraClient.leave();

    setRemoteUsers([]);
    setIsJoined(false);
  }, [localVideoTrack]);


  useEffect(() => {
    const join = async () => {
      // Prevent re-entry if already connecting or connected
      if (agoraClient.connectionState === 'CONNECTING' || agoraClient.connectionState === 'CONNECTED') {
          return;
      }
      setIsJoining(true);

      const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => {
          await agoraClient.subscribe(user, mediaType);
          setRemoteUsers(Array.from(agoraClient.remoteUsers));
          if (mediaType === 'audio') {
            user.audioTrack?.play();
          }
      };

      const handleUserUnpublished = () => {
          setRemoteUsers(Array.from(agoraClient.remoteUsers));
      };
      
      const handleConnectionStateChange = (curState: ConnectionState) => {
          if (curState === 'CONNECTED') {
              setIsJoined(true);
              setIsJoining(false);
          } else if (curState === 'DISCONNECTED' || curState === 'FAILED') {
              setIsJoined(false);
              setIsJoining(false);
          }
      }
      
      try {
          agoraClient.on('user-published', handleUserPublished);
          agoraClient.on('user-unpublished', handleUserUnpublished);
          agoraClient.on('user-left', handleUserUnpublished);
          agoraClient.on('connection-state-change', handleConnectionStateChange);

          await agoraClient.join(appId, channelName, token, null);
          
          const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
          
          localAudioTrackRef.current = audioTrack;
          setLocalVideoTrack(videoTrack);
          
          await agoraClient.publish([audioTrack, videoTrack]);
          
      } catch (error) {
          console.error('Failed to join or publish:', error);
          setIsJoining(false);
      }
    };
    
    join();

    return () => {
        agoraClient.removeAllListeners();
        leave();
    };
  }, [appId, channelName, token, leave]);


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
