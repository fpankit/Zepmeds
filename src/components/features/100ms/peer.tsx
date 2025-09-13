
'use client';

import { useVideo, useAudio } from '@100mslive/react-sdk';

export function Peer({ peer }: { peer: any }) {
  const { videoRef } = useVideo({
    trackId: peer.videoTrack,
  });

  const { audioRef } = useAudio({
    trackId: peer.audioTrack
  });

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted={peer.isLocal} // Mute local peer to prevent echo, but not remote peers
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
