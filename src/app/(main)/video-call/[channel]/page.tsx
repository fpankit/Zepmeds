
'use client';

import { Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Camera, Mic, PhoneOff, Users, Loader2, Video, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const PatientProfile = dynamic(
    () => import('@/components/features/patient-profile').then(mod => mod.PatientProfile),
    {
        ssr: false,
        loading: () => (
            <div className='p-4 space-y-4'>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
        )
    }
);


function VideoCallContent() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const channelName = params.channel as string;
    const patientId = searchParams.get('patientId');


    const handleLeave = () => {
        router.push('/doctor');
    };
    

    return (
        <div className="flex h-screen w-full bg-black text-white">
             {/* Main Video Grid */}
            <main className="flex-1 flex flex-col p-4 relative">
                <div className="flex-1 flex items-center justify-center">
                    <Card className="bg-gray-900 border-gray-800 text-center max-w-md">
                        <CardHeader>
                            <CardTitle className='flex items-center justify-center gap-2'>
                                <Video className="h-8 w-8 text-primary" />
                                Video Call in Progress
                            </CardTitle>
                            <CardDescription>Channel: {channelName}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="w-full h-48 bg-black rounded-lg flex items-center justify-center">
                                <p className="text-muted-foreground">Video feed is currently unavailable.</p>
                            </div>
                           
                            <div className="flex items-center justify-center gap-2 text-sm text-yellow-400">
                                <AlertTriangle className="h-4 w-4" />
                                <p>The video SDK has been temporarily disabled to ensure app stability.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                 {/* Control Bar */}
                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur-sm p-4 rounded-full flex justify-center items-center gap-4">
                     <Button variant="secondary" size="lg" className="rounded-full h-14 w-14" disabled>
                        <Mic />
                    </Button>
                     <Button variant="secondary" size="lg" className="rounded-full h-14 w-14" disabled>
                        <Camera />
                    </Button>
                     <Button onClick={handleLeave} variant="destructive" size="lg" className="rounded-full h-14 w-14"><PhoneOff /></Button>
                </div>
            </main>

            {/* Sidebar with Patient Details */}
             <aside className="w-80 hidden md:block bg-gray-900 border-l border-gray-800 p-4">
                 {patientId && <PatientProfile patientId={patientId} />}
             </aside>
        </div>
    );
}

export default function VideoCallPage() {
    return (
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <VideoCallContent />
        </Suspense>
    )
}
