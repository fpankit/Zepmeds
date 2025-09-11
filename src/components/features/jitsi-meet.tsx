
"use client";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

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

  useEffect(() => {
    // Ensure Jitsi API is loaded and the container is available.
    // Crucially, check if the API has already been initialized.
    if (typeof window === 'undefined' || !window.JitsiMeetExternalAPI || !jitsiContainerRef.current || jitsiApiRef.current) {
        return;
    }

    try {
        const domain = "meet.jit.si";
        const options = {
            roomName: roomName,
            width: "100%",
            height: "100%",
            parentNode: jitsiContainerRef.current,
            userInfo: {
                displayName: userName,
            },
            configOverwrite: {
                startWithAudioMuted: false,
                startWithVideoMuted: false,
                prejoinPageEnabled: false,
            },
            interfaceConfigOverwrite: {
                TOOLBAR_BUTTONS: [
                    "microphone",
                    "camera",
                    "chat",
                    "raisehand",
                    "tileview",
                    "hangup",
                ],
                SHOW_JITSI_WATERMARK: false,
                SHOW_BRAND_WATERMARK: false,
                SHOW_WATERMARK_FOR_GUESTS: false,
                TOOLBAR_ALWAYS_VISIBLE: true,
            },
        };

        const api = new window.JitsiMeetExternalAPI(domain, options);
        jitsiApiRef.current = api;

    } catch (error) {
        console.error("Failed to initialize Jitsi Meet:", error);
        toast({
            variant: "destructive",
            title: "Video Service Error",
            description: "Could not start the video consultation service.",
        });
    }

    // Cleanup function to run when the component unmounts.
    return () => {
        if (jitsiApiRef.current) {
            jitsiApiRef.current.dispose();
            jitsiApiRef.current = null;
        }
    };
  // The dependency array is intentionally empty to ensure this effect runs only once.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] w-full bg-black rounded-lg overflow-hidden">
        <div ref={jitsiContainerRef} className="flex-1" />
    </div>
  );
}
