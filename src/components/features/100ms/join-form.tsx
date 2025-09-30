
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
            let errorMessage = 'Failed to get auth token.';
            try {
                const err = await response.json();
                errorMessage = err.error || errorMessage;
            } catch (e) {
                // The response was not JSON, use the status text.
                errorMessage = response.statusText;
            }
            throw new Error(errorMessage);
        }
        const { token } = await response.json();

        // ** THE FIX **: Removed initEndpoint and roomCode. 
        // The room ID is now embedded in the auth token by the server, 
        // which is the simplest and most reliable way to connect.
        await hmsActions.join({
            userName: user.isGuest ? 'Guest' : `${user.firstName} ${user.lastName}`,
            authToken: token,
            settings: {
                isAudioMuted: true, // Start with audio muted
            },
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
