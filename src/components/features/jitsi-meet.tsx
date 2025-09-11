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
  const containerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === 'undefined' || !window.JitsiMeetExternalAPI || !containerRef.current || jitsiApiRef.current) {
        return;
    }

    try {
        const domain = "meet.jit.si";
        const options = {
            roomName: roomName,
            width: "100%",
            height: "100%",
            parentNode: containerRef.current,
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
            },
        };

        const api = new window.JitsiMeetExternalAPI(domain, options);
        jitsiApiRef.current = api;
    } catch (error) {
        console.error("Failed to initialize Jitsi Meet:", error);
        toast({
            variant: "destructive",
            title: "Video Service Error",
            description: "Could not start the video consultation service. Please try again later.",
        });
    }

    return () => {
        if (jitsiApiRef.current) {
            jitsiApiRef.current.dispose();
            jitsiApiRef.current = null;
        }
    };
  }, [roomName, userName, toast]);

  return (
    <div className="relative h-[calc(100vh-80px)] w-full bg-black rounded-lg overflow-hidden">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
