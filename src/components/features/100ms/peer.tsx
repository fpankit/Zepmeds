
'use client';

import { useVideo } from '@100mslive/react-sdk';
import React from 'react';

export function Peer({ peer }: { peer: any }) {
  const { videoRef } = useVideo({
    trackId: peer.videoTrack,
  });

  return (
    <div className="relative bg-black rounded-lg overflow-hidden w-full h-full">
      {peer.videoTrack ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={true} // Always mute video elements to prevent browser policy issues. Audio is handled separately.
          className={`h-full w-full object-cover ${peer.isLocal ? 'transform -scale-x-100' : ''}`}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-gray-800 text-white text-lg">
          {peer.name ? peer.name[0].toUpperCase() : '👤'}
        </div>
      )}

      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-sm px-2 py-1 rounded-md">
        {peer.name} {peer.isLocal ? '(You)' : ''}
      </div>
    </div>
  );
}
