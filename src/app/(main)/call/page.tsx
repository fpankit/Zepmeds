
'use client';

import { Suspense, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Video, AlertCircle, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function CallPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    // This effect will run on the client, after the page loads.
    // It checks if there is a meet link in session storage and redirects.
    useEffect(() => {
        const meetLink = sessionStorage.getItem('meetLink');
        if (meetLink) {
            sessionStorage.removeItem('meetLink'); // Clean up
            window.location.href = meetLink;
        }
    }, []);

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
                {error ? (
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
                ) : (
                    <Card>
                        <CardHeader>
                            <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
                            <CardTitle>Generating Your Meeting...</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Please complete the sign-in process in the other tab. This page will redirect automatically.</p>
                        </CardContent>
                    </Card>
                )}
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

    