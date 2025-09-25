
'use client';

import { Peer } from './peer';
import { Controls } from './controls';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ConsultationSidebar } from './consultation-sidebar';
import { useAuth, User as AuthUser } from '@/context/auth-context';
import { useHMSStore, selectRemotePeers, selectLocalPeer } from '@100mslive/react-sdk';

export interface Captions {
    original: string;
    translated: string;
}

export function Conference({ captions, setCaptions }: { captions: Captions, setCaptions: (captions: Captions) => void }) {
  // **THE FIX**: Fetch both local and remote peers separately.
  const localPeer = useHMSStore(selectLocalPeer);
  const remotePeers = useHMSStore(selectRemotePeers);
  
  const peers = localPeer ? [localPeer, ...remotePeers] : remotePeers;
  const peerCount = peers.length;

  const { user } = useAuth();
  
  // The patient is the first remote peer.
  const patientPeer = remotePeers.length > 0 ? remotePeers[0] : null;
  
  const isDoctorView = user?.isDoctor;

  const getGridClass = (count: number) => {
    if (count <= 1) return "grid-cols-1 grid-rows-1";
    if (count === 2) return "grid-cols-2 grid-rows-1";
    if (count <= 4) return "grid-cols-2 grid-rows-2";
    if (count <= 6) return "grid-cols-3 grid-rows-2";
    if (count <= 9) return "grid-cols-3 grid-rows-3";
    return "grid-cols-4 grid-rows-3"; // Max 12
  }

  if (isDoctorView) {
      return (
          <div className="h-screen flex flex-col md:flex-row bg-black">
              {/* Main content: Video + Controls */}
              <div className="flex-1 flex flex-col">
                  <div className="flex-1 w-full overflow-hidden relative">
                      <div className="absolute inset-0">
                          {peerCount === 1 && localPeer ? (
                              <div className="absolute inset-0 flex items-center justify-center p-4 flex-col gap-4">
                                  <Peer key={localPeer.id} peer={localPeer} />
                                  <p className="text-white mt-4">Waiting for the patient to join...</p>
                              </div>
                          ) : (
                              <div className={cn("w-full h-full p-2 gap-2 grid", getGridClass(peerCount))}>
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
            {peerCount === 1 && localPeer ? (
                <div className="absolute inset-0 flex items-center justify-center p-4 flex-col gap-4">
                    <Peer key={localPeer.id} peer={localPeer} />
                    <p className="text-white mt-4">Waiting for the doctor to join...</p>
                </div>
            ) : (
                 <div className={cn("w-full h-full p-2 gap-2 grid", getGridClass(peerCount))}>
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
