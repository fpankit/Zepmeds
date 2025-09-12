
'use client';

import { useState } from 'react';
import { useHMSActions } from '@100mslive/react-sdk';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { User } from '@/context/auth-context';
import { useParams } from 'next/navigation';

export function JoinForm({ user }: { user: User }) {
  const hmsActions = useHMSActions();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const params = useParams();
  const callId = params.id as string; // This is the room ID from the URL

  const joinRoom = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/100ms/get-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          // The 'id' from the URL (/call/[id]) serves as the room identifier.
          // We must ensure a room with this ID exists in your 100ms template.
          // For now, we use a placeholder room ID from env vars, but using `callId` is better.
          room_id: process.env.NEXT_PUBLIC_100MS_ROOM_ID, 
          role: user.isDoctor ? 'doctor' : 'patient', // Role can determine permissions
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to get token');
      }

      const { token } = await response.json();

      await hmsActions.join({
        userName: `${user.firstName} ${user.lastName}`,
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
        <CardDescription>You are joining as {user.firstName}.</CardDescription>
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
