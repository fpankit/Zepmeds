
'use client';

import { useVideo } from '@100mslive/react-sdk';
import { useAudio } from '@100mslive/hms-video-store';

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
