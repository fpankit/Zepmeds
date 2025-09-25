
'use client';

import { Peer } from './peer';
import { Controls } from './controls';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ConsultationSidebar } from './consultation-sidebar';
import { useAuth, User as AuthUser } from '@/context/auth-context';
import { useHMSStore, selectRemotePeers } from '@100mslive/react-sdk';

export interface Captions {
    original: string;
    translated: string;
}

export function Conference({ captions, setCaptions }: { captions: Captions, setCaptions: (captions: Captions) => void }) {
  // **THE FIX**: Instead of all peers, we only select remote peers.
  // This avoids race conditions with the local peer's tracks not being ready on initial render.
  const peers = useHMSStore(selectRemotePeers);
  const { user } = useAuth();
  const peerCount = peers.length;
  
  // The patient is the first (and likely only) remote peer.
  const patientPeer = peerCount > 0 ? peers[0] : null;
  
  const isDoctorView = user?.isDoctor;

  if (isDoctorView) {
      return (
          <div className="h-screen flex flex-col md:flex-row bg-black">
              {/* Main content: Video + Controls */}
              <div className="flex-1 flex flex-col">
                  <div className="flex-1 w-full overflow-hidden relative">
                      <div className="absolute inset-0">
                          {peerCount === 0 ? (
                              <div className="absolute inset-0 flex items-center justify-center">
                                  <p className="text-white">Waiting for the patient to join...</p>
                              </div>
                          ) : (
                              <div className={cn("w-full h-full p-2 gap-2 grid", peerCount === 1 ? "grid-rows-1" : "grid-cols-2 grid-rows-2")}>
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

              {/* Doctor's Sidebar */}
              <div className="w-full md:w-96 bg-background border-l border-border flex flex-col">
                  {patientPeer ? (
                    <ConsultationSidebar patientId={patientPeer.customerUserId} patientName={patientPeer.name} />
                  ) : (
                    <div className="p-4 text-center text-muted-foreground italic">
                        Patient details will appear here once they join.
                    </div>
                  )}
              </div>
          </div>
      )
  }

  // --- PATIENT VIEW ---
  return (
    <div className="h-screen flex flex-col bg-black">
      <div className="flex-1 w-full overflow-hidden relative">
        <div className="absolute inset-0">
            {peerCount === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-white">Waiting for the doctor to join...</p>
                </div>
            ) : (
                 <div 
                    className={cn(
                        "w-full h-full p-2 gap-2 grid",
                        peerCount === 1 ? "grid-cols-1" :
                        peerCount <= 4 ? "grid-cols-2 grid-rows-2" :
                        "grid grid-cols-3 grid-rows-3" 
                    )}
                >
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
