
'use client';

import { Peer } from './peer';
import { Controls } from './controls';
import { AnimatePresence, motion } from 'framer-motion';

interface Captions {
    original: string;
    translated: string;
}

export function Conference({ peers, captions, setCaptions }: { peers: any[], captions: Captions, setCaptions: (captions: Captions) => void }) {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 w-full overflow-hidden relative">
        <div className="absolute inset-0">
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
        
        {/* Captions Overlay */}
        <AnimatePresence>
        {captions.translated && (
             <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-3xl p-4 text-center"
             >
                <div className="bg-black/60 backdrop-blur-md rounded-lg p-3 inline-block">
                    <p className="text-sm text-gray-300 mb-1">{captions.original}</p>
                    <p className="text-xl font-bold text-white">{captions.translated}</p>
                </div>
            </motion.div>
        )}
        </AnimatePresence>

      </div>
      <Controls setCaptions={setCaptions} />
    </div>
  );
}
