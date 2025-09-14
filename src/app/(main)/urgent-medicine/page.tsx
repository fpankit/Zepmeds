
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Bell, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

function UrgentMedicineContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialName = searchParams.get('name') || '';

  const [medicineName, setMedicineName] = useState(initialName);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineName.trim()) {
      toast({ variant: 'destructive', title: 'Medicine name is required.' });
      return;
    }
    if (!user || user.isGuest) {
      toast({ variant: 'destructive', title: 'Please log in to make a request.' });
      router.push('/login');
      return;
    }
    setIsLoading(true);

    try {
        await addDoc(collection(db, 'urgent_requests'), {
            userId: user.id,
            userName: `${user.firstName} ${user.lastName}`,
            userPhone: user.phone,
            medicineName: medicineName,
            status: 'pending',
            createdAt: serverTimestamp(),
        });
        setIsSubmitted(true);
    } catch (error) {
        console.error("Failed to submit urgent request:", error);
        toast({ variant: 'destructive', title: 'Request Failed', description: 'Could not submit your request. Please try again.' });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center p-4 bg-background border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold ml-4">Urgent Medicine Request</h1>
      </header>

      <main className="flex-1 p-4 flex items-center justify-center">
        {isSubmitted ? (
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                    <CardTitle>Request Submitted!</CardTitle>
                    <CardDescription>
                        We have received your request for <strong>{medicineName}</strong>. Our team will contact you shortly to confirm availability and arrange delivery within the hour.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button className="w-full" onClick={() => router.push('/home')}>
                        Back to Home
                    </Button>
                </CardFooter>
            </Card>
        ) : (
             <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Medicine Not Available?</CardTitle>
                <CardDescription>
                  Let us know which medicine you need urgently, and we'll arrange it for you within 1 hour.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="medicineName">Medicine Name</Label>
                    <Input
                      id="medicineName"
                      placeholder="e.g., Crocin Pain Relief"
                      value={medicineName}
                      onChange={(e) => setMedicineName(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bell className="mr-2 h-4 w-4" />}
                    {isLoading ? 'Submitting...' : 'Notify & Arrange'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
        )}
      </main>
    </div>
  );
}


export default function UrgentMedicinePage() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <UrgentMedicineContent />
        </Suspense>
    )
}

    