
'use client';

import { useEffect, useRef } from 'react';
import type { ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PlayerProps {
  uid: string | number;
  audioTrack?: IMicrophoneAudioTrack;
  videoTrack?: ICameraVideoTrack;
  isLocal?: boolean;
}

export function Player(props: PlayerProps) {
  const { uid, audioTrack, videoTrack, isLocal } = props;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && videoTrack) {
        videoTrack.play(ref.current);
    }
    return () => {
        videoTrack?.stop();
    };
  }, [videoTrack]);

  useEffect(() => {
    if (audioTrack) {
      audioTrack.play();
    }
    return () => {
      audioTrack?.stop();
    };
  }, [audioTrack]);

  return (
    <div
      ref={ref}
      className={cn(
        "w-full h-full bg-black rounded-lg relative overflow-hidden",
        isLocal ? "border-2 border-primary" : "border-2 border-gray-700"
      )}
    >
      {!videoTrack?.isPlaying && (
         <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="text-4xl bg-gray-700 text-white"><User size={48} /></AvatarFallback>
          </Avatar>
          <p className="mt-4 text-lg font-semibold">{uid === 'local' ? 'You' : `User ${uid}`}</p>
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
        {uid === 'local' ? 'You' : `User ${uid}`}
      </div>
    </div>
  );
}
