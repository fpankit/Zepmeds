'use client';

import { Button } from '@/components/ui/button';
import { EchoDocLogo } from '@/components/icons/echodoc-logo';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

function BrainIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5.5a4.5 4.5 0 0 1 4.5 4.5v.3a3.4 3.4 0 0 1 3.1 3.2 3.5 3.5 0 0 1-3.5 3.5H7.4a3.5 3.5 0 0 1-3.2-3.5A3.4 3.4 0 0 1 7.3 10v-.5A4.5 4.5 0 0 1 12 5.5Z" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.1)" />
      <path d="M12 17a4.5 4.5 0 0 0 4.5-4.5v-.3a3.4 3.4 0 0 0-3.1-3.2 3.5 3.5 0 0 0 3.5-3.5H7.4a3.5 3.5 0 0 0 3.2 3.5A3.4 3.4 0 0 0 7.3 12v.5A4.5 4.5 0 0 0 12 17Z" stroke="hsl(var(--primary))" />
      <path d="M16 12.5a2.5 2.5 0 1 0-5 0" />
      <path d="M12 12.5v1.7a1.8 1.8 0 0 1-1.8 1.8h-.4a1.8 1.8 0 0 1-1.8-1.8v-1.7" />
    </svg>
  );
}


export default function EchoDocLandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const handleGetStarted = () => {
    if(user?.isGuest) {
      router.push('/login');
    } else {
      router.push('/echo-doc'); 
    }
  }

  return (
    <div className="flex flex-col min-h-[80vh] items-center justify-center text-center px-4">
        <div className="space-y-6 max-w-2xl">
           <div className="inline-flex items-center justify-center gap-4">
            <BrainIcon className="h-16 w-16" />
           </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
             Elevate Healthcare Services Using AI Voice Agents
          </h1>
          <p className="text-lg text-muted-foreground">
            Use conversational AI to offer non-stop medical help — detect issues, handle bookings, and support
            patients with natural, voice-based care
          </p>
          <Button
            size="lg"
            onClick={handleGetStarted}
          >
            Get Started
          </Button>
        </div>
    </div>
  );
}
