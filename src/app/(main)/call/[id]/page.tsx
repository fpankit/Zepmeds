
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { JitsiMeet } from "@/components/features/jitsi-meet";
import { Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function CallPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const callId = resolvedParams.id;
  const router = useRouter();
  const { toast } = useToast();
  
  const { user } = useAuth();
  const [roomName, setRoomName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [callStatus, setCallStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!callId) {
        setIsLoading(false);
        return;
    }

    const callDocRef = doc(db, 'video_calls', callId);

    const unsubscribe = onSnapshot(callDocRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            setCallStatus(data.status);
            if (roomName === null) {
                setRoomName(`zepmeds-consult-${callId}`);
            }
        } else {
            console.error("Call room not found");
            setCallStatus("not_found");
        }
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [callId, roomName]);


  useEffect(() => {
      if (callStatus === 'declined') {
          toast({
              title: "Call Declined",
              description: "The doctor has declined the call. Please try another doctor.",
              variant: "destructive",
          });
          router.push('/doctor');
      } else if (callStatus === 'ended_by_doctor') {
           toast({
              title: "Call Ended",
              description: "The doctor has ended the call.",
          });
          router.push('/home');
      } else if (callStatus === 'not_found') {
          toast({
              title: "Call Not Found",
              description: "This call room does not exist.",
              variant: "destructive",
          });
           router.push('/doctor');
      }
  }, [callStatus, router, toast]);


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
