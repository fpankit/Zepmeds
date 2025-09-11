
"use client";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";

declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}

interface JitsiMeetProps {
  roomName: string;
  userName: string;
}

export function JitsiMeet({ roomName, userName }: JitsiMeetProps) {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.JitsiMeetExternalAPI || !jitsiContainerRef.current || jitsiApiRef.current || !user) {
        return;
    }

    const initJitsi = async () => {
        try {
            // Step 1: Fetch the JWT from our new backend endpoint
            const tokenResponse = await fetch('/api/jitsi/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    room: roomName,
                    user: {
                        id: user.id,
                        name: userName,
                        email: user.email,
                        isModerator: user.isDoctor,
                    },
                }),
            });

            if (!tokenResponse.ok) {
                const errorData = await tokenResponse.json();
                throw new Error(errorData.error || 'Failed to fetch Jitsi token.');
            }

            const { token } = await tokenResponse.json();

            // Step 2: Initialize Jitsi with the fetched JWT
            const domain = "8x8.vc";
            const options = {
                roomName: roomName,
                jwt: token, // Use the JWT here
                width: "100%",
                height: "100%",
                parentNode: jitsiContainerRef.current,
                userInfo: {
                    displayName: userName,
                },
                configOverwrite: {
                    prejoinPageEnabled: false,
                },
                interfaceConfigOverwrite: {
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_BRAND_WATERMARK: false,
                },
            };

            const api = new window.JitsiMeetExternalAPI(domain, options);
            jitsiApiRef.current = api;

            api.addEventListener('videoConferenceJoined', () => {
                setIsLoading(false);
            });

        } catch (error: any) {
            console.error("Failed to initialize Jitsi Meet:", error);
            toast({
                variant: "destructive",
                title: "Video Service Error",
                description: error.message || "Could not start the video consultation service.",
            });
            setIsLoading(false);
        }
    };

    initJitsi();

    return () => {
        if (jitsiApiRef.current) {
            jitsiApiRef.current.dispose();
            jitsiApiRef.current = null;
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] w-full bg-black rounded-lg overflow-hidden relative">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-2">Connecting to secure call...</p>
        </div>
      )}
      <div ref={jitsiContainerRef} className="flex-1" />
    </div>
  );
}
