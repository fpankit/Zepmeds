
'use client';

import { useAuth } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

// IMPORTANT: This URL points to your live Vercel application.
const ECHO_DOC_VERCEL_URL = 'https://ai-medicalagent.vercel.app/';

// This is a placeholder for a function that would generate a secure token (e.g., a JWT)
// In a real application, this should be done on a backend to keep secrets safe.
async function generateUserToken(userId: string): Promise<string> {
    // For demonstration, we'll just return a mock token.
    // In a real implementation, you would make an API call to your backend to generate a JWT.
    console.log(`Generating token for user: ${userId}`);
    await new Promise(resolve => setTimeout(resolve, 300)); // simulate async call
    return `mock-jwt-for-user-${userId}-signed-with-secret-key`;
}


export default function EchoDocPage() {
  const { user, loading: authLoading } = useAuth();
  const [appUrl, setAppUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initialize() {
        if (authLoading) return;

        if (!user) {
            // Handle case where user is not logged in, maybe redirect or show a message.
            // For now, we'll just stop the loading state.
             setIsLoading(false);
            return;
        }

        try {
            const token = await generateUserToken(user.id);
            const urlWithToken = `${ECHO_DOC_VERCEL_URL}?token=${token}`;
            setAppUrl(urlWithToken);
        } catch (error) {
            console.error("Failed to generate token:", error);
        } finally {
            setIsLoading(false);
        }
    }

    initialize();
  }, [user, authLoading]);

  if (isLoading) {
    return (
        <div className="container mx-auto p-4">
            <Skeleton className="w-full h-[80vh] rounded-lg" />
        </div>
    )
  }

  if (!user) {
    return (
        <div className="container mx-auto p-4 text-center">
            <h2 className="text-xl font-bold">Authentication Required</h2>
            <p className="text-muted-foreground">Please log in to use Echo Doc AI.</p>
        </div>
    )
  }
  
  if (!appUrl) {
     return (
        <div className="container mx-auto p-4 text-center">
            <h2 className="text-xl font-bold text-destructive">Could not load Echo Doc AI</h2>
            <p className="text-muted-foreground">There was an error initializing the application. Please try again later.</p>
        </div>
    )
  }

  return (
    <div className="w-full h-[calc(100vh-var(--header-height)-var(--bottom-nav-height))] p-2">
        <iframe
            src={appUrl}
            className="w-full h-full border-2 border-border rounded-lg"
            title="Echo Doc AI"
            sandbox="allow-scripts allow-same-origin allow-forms"
        />
        <style jsx>{`
            :root {
                --header-height: 4rem; /* 64px */
                --bottom-nav-height: 4rem; /* 64px */
            }
        `}</style>
    </div>
  );
}
