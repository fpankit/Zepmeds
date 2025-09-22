
'use client';

import { useState } from 'react';
import { useHMSActions } from '@100mslive/react-sdk';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { User } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

export function JoinForm({ user, appointmentId }: { user: User, appointmentId: string }) {
  const hmsActions = useHMSActions();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const joinRoom = async () => {
    setIsLoading(true);
    
    // Determine the role based on the user type, matching the 100ms dashboard roles.
    const userRole = user.isDoctor ? 'host' : 'guest';

    try {
        const response = await fetch('/api/100ms/get-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.id,
                role: userRole,
                room_id: appointmentId, // Pass the dynamic appointment/call ID as the room_id
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
                isAudioMuted: false,
                isVideoMuted: false,
            },
            // Use the unique appointment ID as the room name for identification
            // This also helps in the leaveRoom logic to find the right document.
            roomName: appointmentId, 
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
