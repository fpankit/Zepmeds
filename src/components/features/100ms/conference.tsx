
'use client';

import { Peer } from './peer';
import { Controls } from './controls';

export function Conference({ peers }: { peers: any[] }) {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 w-full overflow-hidden">
        <div className="relative w-full h-full">
            {peers.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-white">Waiting for others to join...</p>
                </div>
            ) : (
                <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                    {peers.map(peer => (
                        <Peer key={peer.id} peer={peer} />
                    ))}
                </div>
            )}
        </div>
      </div>
      <Controls />
    </div>
  );
}
