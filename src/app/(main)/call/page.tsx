
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Video } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VideoCallPage() {
    const router = useRouter();

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
                        <Video className="mx-auto h-12 w-12 text-primary" />
                        <CardTitle>Coming Soon</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Google Meet integration is currently under development.</p>
                         <Button className="mt-4" onClick={() => router.push('/home')}>Go to Home</Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
