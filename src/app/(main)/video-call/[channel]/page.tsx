
'use client';

import { Mic, MicOff, PhoneOff, Video, VideoOff, Users, ScreenShare } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PatientProfile } from '@/components/features/patient-profile';

// This is a placeholder URL. Replace with your actual video call service provider.
// The service should be configured to allow embedding.
// Example for Whereby: https://your-subdomain.whereby.com/
const VIDEO_SERVICE_BASE_URL = "https://zepmeds.whereby.com";


export default function VideoCallPage() {
    const router = useRouter();
    const params = useParams();
    const channelName = params.channel as string;

    // A real implementation would fetch the patientId associated with this channel/appointment
    const patientId = "new.user@example.com".replace("@", "_").replace(/\./g, "_"); // Placeholder ID

    if (!channelName) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <p>Invalid channel name.</p>
            </div>
        )
    }

    const meetingUrl = `${VIDEO_SERVICE_BASE_URL}/${channelName}?embed&audio=on&video=on&background=off&screenshare=on&chat=on`;

    const handleEndCall = () => {
        // Navigate back to the doctor's dashboard or home page
        router.push('/doctor'); 
    };

    return (
        <div className="flex h-screen w-full bg-black text-white">
            {/* Main Video Area */}
            <main className="flex-1 flex flex-col">
                <div className="flex-1 w-full h-full">
                    <iframe
                        src={meetingUrl}
                        allow="camera; microphone; fullscreen; speaker; display-capture"
                        className="h-full w-full border-0"
                        title="Video Call"
                    ></iframe>
                </div>
                
                {/* Control Bar */}
                <div className="bg-gray-900/80 backdrop-blur-sm p-4 flex justify-center items-center gap-4">
                     <Button variant="secondary" size="lg" className="rounded-full h-14 w-14 bg-gray-700 hover:bg-gray-600"><Mic /></Button>
                     <Button variant="secondary" size="lg" className="rounded-full h-14 w-14 bg-gray-700 hover:bg-gray-600"><Video /></Button>
                     <Button variant="secondary" size="lg" className="rounded-full h-14 w-14 bg-gray-700 hover:bg-gray-600"><ScreenShare /></Button>
                     <Button variant="secondary" size="lg" className="rounded-full h-14 w-14 bg-gray-700 hover:bg-gray-600"><Users /></Button>
                     <Button onClick={handleEndCall} variant="destructive" size="lg" className="rounded-full h-14 w-14"><PhoneOff /></Button>
                </div>
            </main>

            {/* Sidebar with Patient Details */}
            <aside className="w-80 hidden md:block bg-gray-900 border-l border-gray-800 p-4">
                <PatientProfile patientId={patientId} />
            </aside>
        </div>
    );
}
