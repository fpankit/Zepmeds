
'use client';

import { PhoneOff, Users } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PatientProfile } from '@/components/features/patient-profile';
import { useAuth } from '@/context/auth-context';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect, useState }from 'react';

// This is a placeholder URL. Replace with your actual video call service provider.
// The service should be configured to allow embedding.
// Example for Whereby: https://your-subdomain.whereby.com/
const VIDEO_SERVICE_BASE_URL = "https://zepmeds.whereby.com";


export default function VideoCallPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const channelName = params.channel as string;

    const [patientId, setPatientId] = useState<string | null>(user?.id || null);

    useEffect(() => {
        const fetchCallData = async () => {
            if (channelName && !user?.id) { // Only fetch if patientId is not from auth context
                const callDocRef = doc(db, "calls", channelName);
                const callDocSnap = await getDoc(callDocRef);
                if (callDocSnap.exists()) {
                    setPatientId(callDocSnap.data().patientId);
                }
            }
        };
        fetchCallData();
    }, [channelName, user?.id])

    if (!channelName) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <p>Invalid channel name.</p>
            </div>
        )
    }

    // You might want to append user's name or other details as URL parameters
    const meetingUrl = `${VIDEO_SERVICE_BASE_URL}/${channelName}?embed&audio=on&video=on&background=off&screenshare=on&chat=on`;

    const handleEndCall = () => {
        // Here you would also update the call status in Firestore to 'completed'
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
                     {/* The actual controls are handled inside the Whereby iframe. 
                         These can be for custom app logic or branding.
                         For simplicity, we only have the end call and participants button.
                     */}
                     <Button variant="secondary" size="lg" className="rounded-full h-14 w-14 bg-gray-700 hover:bg-gray-600"><Users /></Button>
                     <Button onClick={handleEndCall} variant="destructive" size="lg" className="rounded-full h-14 w-14"><PhoneOff /></Button>
                </div>
            </main>

            {/* Sidebar with Patient Details */}
            <aside className="w-80 hidden md:block bg-gray-900 border-l border-gray-800 p-4">
                {patientId ? <PatientProfile patientId={patientId} /> : <div className="text-center text-gray-400">Loading patient details...</div>}
            </aside>
        </div>
    );
}
