
'use client';

import { useState } from 'react';
import { useHMSActions } from '@100mslive/react-sdk';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { User } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';

export function JoinForm({ user }: { user: User }) {
  const hmsActions = useHMSActions();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const params = useParams();

  // The appointment ID from the URL is used as the room name for the call
  const roomName = params.id as string;

  const joinRoom = async () => {
    setIsLoading(true);
    
    const userRole = user.isDoctor ? 'host' : 'guest';

    try {
        const response = await fetch('/api/100ms/get-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.id,
                role: userRole,
            }),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to get auth token.');
        }
        const { token } = await response.json();

        await hmsActions.join({
            userName: user.isGuest ? 'Guest' : `${user.firstName} ${user.lastName}`,
            authToken: token,
            settings: {
                isAudioMuted: true, // Start with audio muted
            },
            // The room name is now dynamically set from the URL (appointment/call ID)
            // This is passed to 100ms to identify/create the room session
            initEndpoint: process.env.NEXT_PUBLIC_HMS_INIT_ENDPOINT,
            roomCode: process.env.NEXT_PUBLIC_HMS_ROOM_ID,
            // The room name is passed in the config, it is used to identify the room
            // and is also available in the room object on the client side.
            // We use the call ID from the URL as the unique room name.
            config: {
                room: roomName
            }
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
