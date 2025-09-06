
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng';


export const useAgora = ({ appId, channel }: { appId: string; channel: string; }) => {
    const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
    const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
    const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
    const [isJoined, setIsJoined] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

    const clientRef = useRef<IAgoraRTCClient | null>(null);
    const AgoraRTCRef = useRef<any>(null); // Use 'any' to avoid type issues with dynamic import
    const isMountedRef = useRef(false);

    useEffect(() => {
        isMountedRef.current = true;
        
        const initAgora = async () => {
            // Dynamically import Agora
            const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
            AgoraRTCRef.current = AgoraRTC;
            
            if (!isMountedRef.current) return;

            clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        };
        
        initAgora();

        return () => {
            isMountedRef.current = false;
            // Ensure we leave and clean up if the component unmounts for any reason
            if (clientRef.current && (isJoined || isJoining)) {
                 leave();
            }
        };
    }, []);

    const join = useCallback(async () => {
        const agoraClient = clientRef.current;
        if (!agoraClient || isJoined || isJoining) return;
        
        setIsJoining(true);

        try {
            const handleUserPublished = (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
                 if (!isMountedRef.current) return;
                 // The user object is mutable, so we need to create a new array to trigger a re-render
                 setRemoteUsers(prevUsers => [...prevUsers]);
            };

            const handleUserUnpublished = (user: IAgoraRTCRemoteUser) => {
                 if (!isMountedRef.current) return;
                 setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
            };

            const handleUserJoined = (user: IAgoraRTCRemoteUser) => {
                if (!isMountedRef.current) return;
                console.log('User joined:', user.uid);
                setRemoteUsers((prevUsers) => [...prevUsers, user]);
            };

            const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
                if (!isMountedRef.current) return;
                console.log('User left:', user.uid);
                setRemoteUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
            };

            agoraClient.on('user-published', handleUserPublished);
            agoraClient.on('user-unpublished', handleUserUnpublished);
            agoraClient.on('user-joined', handleUserJoined);
            agoraClient.on('user-left', handleUserLeft);

            await agoraClient.join(appId, channel, null, null);
            if (!isMountedRef.current) return;

            const [audioTrack, videoTrack] = await AgoraRTCRef.current!.createMicrophoneAndCameraTracks();
            if (!isMountedRef.current) {
                audioTrack.close();
                videoTrack.close();
                return;
            }

            setLocalAudioTrack(audioTrack);
            setLocalVideoTrack(videoTrack);
            
            await agoraClient.publish([audioTrack, videoTrack]);
            if (!isMountedRef.current) return;

            setIsJoined(true);
        } catch (error) {
            console.error('Failed to join or publish:', error);
            // In case of error, reset the state
            setIsJoined(false);
            setLocalAudioTrack(null);
            setLocalVideoTrack(null);
            remoteUsers.forEach(user => user.audioTrack?.stop());
            setRemoteUsers([]);
        } finally {
             if (isMountedRef.current) {
                setIsJoining(false);
            }
        }
    }, [appId, channel, isJoined, isJoining]);

    const leave = useCallback(async () => {
        const agoraClient = clientRef.current;

        localAudioTrack?.close();
        localVideoTrack?.close();

        setLocalAudioTrack(null);
        setLocalVideoTrack(null);
        setRemoteUsers([]);
        
        if (isJoined) {
            await agoraClient?.leave();
            setIsJoined(false);
        }
        
        agoraClient?.removeAllListeners();
    }, [isJoined, localAudioTrack, localVideoTrack]);

    return {
        localAudioTrack,
        localVideoTrack,
        remoteUsers,
        join,
        leave,
        isJoined,
        isJoining
    };
};
