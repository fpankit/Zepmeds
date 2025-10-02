
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Calendar } from 'lucide-react';

export default function AshaAppointmentsPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-background">
            <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-slate-50/80 backdrop-blur-lg border-b dark:bg-background/80">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold">Appointments</h1>
                <div className="w-8" />
            </header>
            <main className="flex-1 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Appointments & Booth Scheduling</CardTitle>
                        <CardDescription>This feature is under construction.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center text-muted-foreground p-10">
                        <Calendar className="h-16 w-16 mx-auto mb-4" />
                        <p>Area-wise appointment scheduling and booth management will be available here soon.</p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
