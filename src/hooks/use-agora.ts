
'use client';

import { useState, useEffect, useRef } from 'react';
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from 'agora-rtc-sdk-ng';

AgoraRTC.setLogLevel(3); // Set to 1 for detailed logs

type AgoraHookOptions = {
    appId: string;
    channel: string;
};

export const useAgora = ({ appId, channel }: AgoraHookOptions) => {
    const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
    const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
    const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
    const [isJoined, setIsJoined] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

    const clientRef = useRef<IAgoraRTCClient | null>(null);
    const isMountedRef = useRef(false);

    useEffect(() => {
        isMountedRef.current = true;
        // Initialize Agora client on mount
        clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        
        return () => {
            isMountedRef.current = false;
            // Cleanup on unmount
            if (clientRef.current) {
                leave();
            }
        };
    }, []);

    const join = async () => {
        const agoraClient = clientRef.current;
        if (!agoraClient || isJoined || isJoining) return;
        
        setIsJoining(true);

        try {
            const handleUserPublished = (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
                if (!isMountedRef.current) return;
                setRemoteUsers((prevUsers) => [...prevUsers, user]);
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

            const uid = await agoraClient.join(appId, channel, null, null);
            if (!isMountedRef.current) return;

            const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
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
        } finally {
             if (isMountedRef.current) {
                setIsJoining(false);
            }
        }
    };

    const leave = async () => {
        const agoraClient = clientRef.current;
        if (!agoraClient) return;

        localAudioTrack?.close();
        localVideoTrack?.close();
        setLocalAudioTrack(null);
        setLocalVideoTrack(null);

        setRemoteUsers([]);
        
        if (isJoined) {
            await agoraClient.leave();
            setIsJoined(false);
        }

        agoraClient.removeAllListeners();
    };

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
