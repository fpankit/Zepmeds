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
      <path d="M12 5.5a4.5 4.5 0 0 1 4.5 4.5v.3a3.4 3.4 0 0 1 3.1 3.2 3.5 3.5 0 0 1-3.5 3.5H7.4a3.5 3.5 0 0 1-3.2-3.5A3.4 3.4 0 0 1 7.3 10v-.5A4.5 4.5 0 0 1 12 5.5Z" stroke="#F87171" fill="#FECACA" />
      <path d="M12 17a4.5 4.5 0 0 0 4.5-4.5v-.3a3.4 3.4 0 0 0-3.1-3.2 3.5 3.5 0 0 0 3.5-3.5H7.4a3.5 3.5 0 0 0 3.2 3.5A3.4 3.4 0 0 0 7.3 12v.5A4.5 4.5 0 0 0 12 17Z" stroke="#F87171" />
      <path d="M16 12.5a2.5 2.5 0 1 0-5 0" />
      <path d="M12 12.5v1.7a1.8 1.8 0 0 1-1.8 1.8h-.4a1.8 1.8 0 0 1-1.8-1.8v-1.7" />
    </svg>
  );
}


export default function EchoDocPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const handleGetStarted = () => {
    // If user is a guest, send to login. Otherwise, to the dashboard.
    if(user?.isGuest) {
      router.push('/login');
    } else {
      router.push('/echo-doc/dashboard'); // This page will be created in the next step
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <div className="flex items-center gap-2">
          <EchoDocLogo className="h-8 w-8" />
          <span className="font-bold text-lg text-slate-800">EchoDoc AI</span>
        </div>
        <div className="ml-auto">
          <Button variant="outline" onClick={() => router.push('/login')}>
            Login
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="space-y-6 max-w-2xl">
           <div className="inline-flex items-center justify-center gap-4">
            <BrainIcon className="h-16 w-16" />
           </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-slate-900">
             Elevate Healthcare Services Using AI Voice Agents
          </h1>
          <p className="text-lg text-slate-600">
            Use conversational AI to offer non-stop medical help — detect issues, handle bookings, and support
            patients with natural, voice-based care
          </p>
          <Button
            size="lg"
            className="bg-slate-900 text-white hover:bg-slate-800"
            onClick={handleGetStarted}
          >
            Get Started
          </Button>
        </div>
      </main>
    </div>
  );
}
