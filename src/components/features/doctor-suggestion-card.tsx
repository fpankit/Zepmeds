
'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { Doctor } from '@/hooks/use-calls';

interface DoctorSuggestionCardProps {
    doctor: Doctor;
}

export function DoctorSuggestionCard({ doctor }: DoctorSuggestionCardProps) {
    const router = useRouter();

    const getInitials = (name: string) => {
        if (!name) return 'Dr';
        return name.split(' ').map(n => n[0]).join('');
    };

    const handleTalkToAI = () => {
        router.push(`/echo-doc/call?doctorId=${doctor.id}&doctorName=${encodeURIComponent(doctor.name)}`);
    }

    return (
        <Card className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-primary">
                    <AvatarImage src={doctor.image} alt={doctor.name} />
                    <AvatarFallback className="text-xl">{getInitials(doctor.name)}</AvatarFallback>
                </Avatar>
                <div>
                    <h4 className="font-bold text-lg">{doctor.name}</h4>
                    <p className="text-primary">{doctor.specialty}</p>
                </div>
            </div>
            <Button onClick={handleTalkToAI}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Talk to AI
            </Button>
        </Card>
    );
}
