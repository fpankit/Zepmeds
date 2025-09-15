
'use client';

import { useState } from 'react';
import { useHMSActions } from '@100mslive/react-sdk';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { User } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { HMS_CONFIG } from '@/lib/hms.config';

export function JoinForm({ user, roomId }: { user: User, roomId: string }) {
  const hmsActions = useHMSActions();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const joinRoom = async () => {
    setIsLoading(true);
    
    // Determine the role based on the user type, matching the 100ms dashboard roles.
    const userRole = user.isDoctor ? 'host' : 'guest';

    if (!HMS_CONFIG.ROOM_ID) {
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "100ms Room ID is not configured in environment variables.",
      });
      setIsLoading(false);
      return;
    }

    try {
        const response = await fetch('/api/100ms/get-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.id,
                room_id: HMS_CONFIG.ROOM_ID, // Use the static Room ID from config
                role: userRole,
            }),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to get auth token.');
        }
        const { token } = await response.json();

        // The call document ID from Firestore is still used to uniquely identify the user in the call metadata
        const metadata = { callId: roomId };

        await hmsActions.join({
            userName: user.isGuest ? 'Guest' : `${user.firstName} ${user.lastName}`,
            authToken: token,
            metadata: JSON.stringify(metadata)
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
    // Don't set isLoading to false on success, as the component will unmount.
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
