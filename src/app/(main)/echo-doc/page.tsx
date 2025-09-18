
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Voicemail, ArrowRight, Bot } from 'lucide-react';

export default function EchoDocPage() {
    const router = useRouter();

    return (
        <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 flex items-center justify-center min-h-[80vh]">
            <Card className="max-w-xl text-center">
                <CardHeader>
                    <div className="mx-auto w-fit p-4 bg-teal-500/20 rounded-full mb-4">
                        <Bot className="h-16 w-16 text-teal-400" />
                    </div>
                    <CardTitle className="text-3xl font-bold">Talk to Echo Doc</CardTitle>
                    <CardDescription className="text-lg text-muted-foreground">
                        Your personal AI health assistant. Have a conversation, get your symptoms analyzed, and receive instant guidance in your own language.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button size="lg" onClick={() => router.push('/echo-doc/call')}>
                        Start Conversation <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
