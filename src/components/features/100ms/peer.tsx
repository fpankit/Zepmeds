'use client';

import { useVideo } from '@100mslive/react-sdk';
import React from 'react';

export function Peer({ peer }: { peer: any }) {
  const { videoRef } = useVideo({
    trackId: peer.videoTrack,
  });

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      {/* The useVideo hook attaches the stream (video and audio) to this element.
          We only mute it for the local user to prevent audio echo. Remote users'
          audio will play through their video element because muted will be false. */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={peer.isLocal}
        className={`h-full w-full object-cover ${peer.isLocal ? 'transform -scale-x-100' : ''}`}
      />

      {!peer.videoTrack && (
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
