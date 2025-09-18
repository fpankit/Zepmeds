
'use client';

import { Suspense, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function CallPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const error = searchParams.get('error');
    const meetLink = searchParams.get('meetLink');

    useEffect(() => {
        if (meetLink) {
            // Redirect the user to the Google Meet URL
            window.location.href = meetLink;
        }
    }, [meetLink]);

    if (error) {
        return (
            <div className="flex flex-col h-screen bg-background">
                <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background border-b">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <h1 className="text-xl font-bold">Video Consultation</h1>
                    <div className="w-8" />
                </header>
                <main className="flex flex-1 items-center justify-center text-center p-4">
                    <Card className="border-destructive">
                        <CardHeader>
                            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
                            <CardTitle>Connection Failed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{error}</p>
                            <Button className="mt-4" variant="secondary" onClick={() => router.push('/doctor')}>Try Again</Button>
                        </CardContent>
                    </Card>
                </main>
            </div>
        )
    }
    
    // This is the waiting screen. It will show until the meetLink is available and the useEffect above redirects.
    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold">Video Consultation</h1>
                 <div className="w-8" />
            </header>
            <main className="flex flex-1 items-center justify-center text-center p-4">
                <Card>
                    <CardHeader>
                        <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
                        <CardTitle>Generating Your Meeting...</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Please complete the sign-in process. This page will update automatically once the meeting link is ready.</p>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}


export default function VideoCallPage() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <CallPageContent />
        </Suspense>
    )
}

    