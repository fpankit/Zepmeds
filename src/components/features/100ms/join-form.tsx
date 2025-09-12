
'use client';

import { useState } from 'react';
import { useHMSActions } from '@100mslive/react-sdk';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { User } from '@/context/auth-context';

export function JoinForm({ user, roomId }: { user: User, roomId: string }) {
  const hmsActions = useHMSActions();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const guestAuthToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2ZXJzaW9uIjoyLCJ0eXBlIjoiYXBwIiwiYXBwX2RhdGEiOm51bGwsImFjY2Vzc19rZXkiOiI2OGJiZDQ4ODE0NWNiNGU4NDQ5YjBkZDciLCJyb2xlIjoiZ3Vlc3QiLCJyb29tX2lkIjoiNjhjM2FkYmRhNWJhODMyNmU2ZWI4MmRmIiwidXNlcl9pZCI6IjM4NWE3OTEzLThkMjAtNDA1Ny05MmQ5LWJjZjk3NmM1ODQ5ZCIsImV4cCI6MTc1Nzc0MTE3MiwianRpIjoiMTlmMjU0M2ItZjQwNS00ZDAyLWIwOTUtYmJiZjg3ZjY1NTBmIiwiaWF0IjoxNzU3NjU0NzcyLCJpc3MiOiI2OGJiZDQ4ODE0NWNiNGU4NDQ5YjBkZDUiLCJuYmYiOjE3NTc2NTQ3NzIsInN1YiI6ImFwaSJ9.SNSDMxQ2ffP1zqT12a-ZoneM3CYIoRYsmaWx0s6LGbI";

  const joinRoom = async () => {
    setIsLoading(true);
    setError('');
    
    try {
        let token = '';
        if (user.isGuest) {
            token = guestAuthToken;
        } else {
            const response = await fetch('/api/100ms/get-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.id,
                    room_id: roomId, 
                    role: user.isDoctor ? 'doctor' : 'patient',
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to get token');
            }
            const tokenData = await response.json();
            token = tokenData.token;
        }


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
