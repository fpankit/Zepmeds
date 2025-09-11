
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { JitsiMeet } from "@/components/features/jitsi-meet";
import { Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from 'firebase/firestore';

export default function CallPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [roomName, setRoomName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { id: callId } = params;

  useEffect(() => {
    const fetchCallDetails = async () => {
        if (!callId) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            // The document ID in Firestore is the room ID for Jitsi
            const callDocRef = doc(db, 'video_calls', callId);
            const callDoc = await getDoc(callDocRef);
            if (callDoc.exists()) {
                setRoomName(`zepmeds-consult-${callId}`);
            } else {
                console.error("Call room not found");
            }
        } catch(e) {
            console.error("Error fetching call details:", e);
        } finally {
            setIsLoading(false);
        }
    };

    fetchCallDetails();
  }, [callId]);


  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading...</p>
      </div>
    );
  }

  if (!roomName) {
      return (
           <div className="flex h-screen w-full items-center justify-center bg-background">
            <p>Call not found.</p>
           </div>
      )
  }

  return (
    <div className="p-4">
      <JitsiMeet 
        roomName={roomName}
        userName={user ? `${user.firstName} ${user.lastName}` : "Guest"}
      />
    </div>
  );
}
