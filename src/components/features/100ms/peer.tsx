'use client';

import { useVideo } from '@100mslive/react-sdk';
import React, { useRef, useEffect } from 'react';

export function Peer({ peer }: { peer: any }) {
  const { videoRef } = useVideo({
    trackId: peer.videoTrack,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // useEffect to handle the audio track
  useEffect(() => {
    if (peer.audioTrack && audioRef.current) {
      // Create a new MediaStream and add the audio track to it, as per the fix.
      const mediaStream = new MediaStream([peer.audioTrack]);
      audioRef.current.srcObject = mediaStream;
    }
  }, [peer.audioTrack]);

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      {peer.videoTrack ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={true} // Video is always muted to prevent echo
          className={`h-full w-full object-cover ${peer.isLocal ? 'transform -scale-x-100' : ''}`}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-gray-800 text-white text-lg">
          {peer.name ? peer.name[0].toUpperCase() : '👤'}
        </div>
      )}

      {/* The audio element is needed to hear the remote peer */}
      <audio
        ref={audioRef}
        autoPlay
        playsInline
        muted={peer.isLocal} // Only mute the local peer's audio to prevent echo
      />

      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-sm px-2 py-1 rounded-md">
        {peer.name} {peer.isLocal ? '(You)' : ''}
      </div>
    </div>
  );
}
