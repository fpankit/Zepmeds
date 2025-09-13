
'use client';

import { useVideo } from '@100mslive/react-sdk';
import React from 'react';

export function Peer({ peer }: { peer: any }) {
  const { videoRef } = useVideo({
    trackId: peer.videoTrack,
  });
  const audioRef = React.useRef<HTMLAudioElement>(null);

  React.useEffect(() => {
    if (audioRef.current && peer.audioTrack) {
        // The peer.audioTrack object is a MediaStream that can be directly assigned to srcObject.
        // The previous error was wrapping this in "new MediaStream([peer.audioTrack])", which is incorrect.
        (audioRef.current as HTMLAudioElement).srcObject = peer.audioTrack;
    }
  }, [peer.audioTrack]);

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted={true} // Mute all video elements to prevent echo, audio is handled separately
        playsInline
        className={`h-full w-full object-cover ${peer.isLocal ? 'transform -scale-x-100' : ''}`}
      />
      {peer.audioTrack && (
         <audio ref={audioRef} autoPlay playsInline muted={peer.isLocal} />
      )}
      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-sm px-2 py-1 rounded-md">
        {peer.name} {peer.isLocal ? '(You)' : ''}
      </div>
    </div>
  );
}
