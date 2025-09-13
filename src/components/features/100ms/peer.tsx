
'use client';

import { useVideo } from '@100mslive/react-sdk';
import React from 'react';

export function Peer({ peer }: { peer: any }) {
  const { videoRef } = useVideo({
    trackId: peer.videoTrack,
  });

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={peer.isLocal} // Mute video only for the local peer to prevent echo
        className={`h-full w-full object-cover ${peer.isLocal ? 'transform -scale-x-100' : ''}`}
      />
      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-sm px-2 py-1 rounded-md">
        {peer.name} {peer.isLocal ? '(You)' : ''}
      </div>
    </div>
  );
}
