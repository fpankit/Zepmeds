
'use client';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const SymptomCheckerChat = dynamic(
  () => import('@/components/features/symptom-checker-chat').then(mod => mod.SymptomCheckerChat),
  { 
    ssr: false,
    loading: () => <div className="p-4"><Skeleton className="h-[80vh] w-full" /></div>
  }
);


export default function SymptomCheckerPage() {
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
      <SymptomCheckerChat />
    </div>
  );
}
