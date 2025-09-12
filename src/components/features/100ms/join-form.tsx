
'use client';

import { useState } from 'react';
import { useHMSActions } from '@100mslive/react-sdk';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { User } from '@/context/auth-context';

// IMPORTANT: Replace this with a REAL room_id from your 100ms dashboard.
// This ID should come from the "Rooms" section, not the "Templates" section.
const HMS_ROOM_ID = "YOUR_REAL_ROOM_ID_HERE";

export function JoinForm({ user, roomId: callId }: { user: User, roomId: string }) {
  const hmsActions = useHMSActions();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const joinRoom = async () => {
    setIsLoading(true);
    setError('');

    if (HMS_ROOM_ID === "YOUR_REAL_ROOM_ID_HERE") {
        setError("Please replace 'YOUR_REAL_ROOM_ID_HERE' in src/components/features/100ms/join-form.tsx with an actual room ID from your 100ms dashboard.");
        setIsLoading(false);
        return;
    }
    
    try {
        const response = await fetch('/api/100ms/get-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.id,
                room_id: HMS_ROOM_ID, // Always use the correct, hardcoded room ID
                role: user.isDoctor ? 'doctor' : (user.isGuest ? 'guest' : 'patient'),
            }),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to get token');
        }
        const { token } = await response.json();

      await hmsActions.join({
        userName: user.isGuest ? 'Guest' : `${user.firstName} ${user.lastName}`,
        authToken: token,
      });

    } catch (e: any) {
      console.error(e);
      setError(e.message || 'An unknown error occurred.');
    } finally {
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
        {error && <p className="text-red-500 text-sm">{error}</p>}
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
