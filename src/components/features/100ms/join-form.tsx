
'use client';

import { useState } from 'react';
import { useHMSActions } from '@100mslive/react-sdk';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { User } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation'; // Import useParams

// This component now takes the appointmentId as a prop
export function JoinForm({ user, appointmentId }: { user: User, appointmentId: string }) {
  const hmsActions = useHMSActions();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const joinRoom = async () => {
    setIsLoading(true);
    
    const userRole = user.isDoctor ? 'host' : 'guest';

    try {
        // The room ID is now the static template ID to avoid management token issues
        const response = await fetch('/api/100ms/get-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.id,
                room_id: process.env.NEXT_PUBLIC_HMS_TEMPLATE_ID, // Use the static template ID
                role: userRole,
            }),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to get auth token.');
        }
        const { token } = await response.json();
        
        // Pass the appointmentId in the room name to be able to retrieve it later
        await hmsActions.join({
            userName: user.isGuest ? 'Guest' : `${user.firstName} ${user.lastName}`,
            authToken: token,
            settings: {
                isAudioOn: true,
                isVideoOn: true,
            },
            initEndpoint: process.env.NEXT_PUBLIC_HMS_INIT_ENDPOINT,
            // The `name` property is used to identify the call instance, separate from the room_id.
            // This is useful for logging, billing, or identifying calls in webhooks.
            name: appointmentId, 
        });

    } catch (e: any) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Failed to Join Call",
        description: e.message || 'An unknown error occurred.',
      })
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Join Video Call</CardTitle>
        <CardDescription>You are joining as {user.isGuest ? 'Guest' : user.firstName}.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={joinRoom} disabled={isLoading} className="w-full">
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Joining...</>
          ) : (
            'Join Now'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
