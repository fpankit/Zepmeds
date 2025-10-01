
'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import {
  Bell,
  Search,
  Video,
  Calendar,
  Clock,
  Star,
  Bookmark,
  Loader2,
  Mic,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// Mock data based on the design
const upcomingAppointment = {
  doctor: {
    name: 'Dr. Ali Khan',
    specialty: 'Cardiology',
    image:
      'https://firebasestorage.googleapis.com/v0/b/zepmeds-admin-panel.appspot.com/o/images%2Fdoctors%2Fdoc-ai-2.png?alt=media',
  },
  date: '18 Nov, Monday',
  time: '8pm - 8:30 pm',
};

const popularDoctors = [
  {
    id: 'doc1',
    name: 'Dr. Ali Khan',
    specialty: 'Cardiology',
    rating: 4.9,
    reviews: 190,
    image:
      'https://firebasestorage.googleapis.com/v0/b/zepmeds-admin-panel.appspot.com/o/images%2Fdoctors%2Fdoc-ai-2.png?alt=media',
  },
  {
    id: 'doc2',
    name: 'Dr. Priya Mehta',
    specialty: 'Dermatology',
    rating: 4.8,
    reviews: 150,
    image:
      'https://firebasestorage.googleapis.com/v0/b/zepmeds-admin-panel.appspot.com/o/images%2Fdoctors%2Fdoc-ai-3.png?alt=media',
  },
];

const specialties = ['All', 'Cardiology', 'Dermatology', 'Pediatrician'];

function DoctorPageContent() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.photoURL} alt={user?.firstName} />
              <AvatarFallback>
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">Good morning!</p>
              <p className="font-bold text-lg">
                {user?.firstName} {user?.lastName}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <Bell className="h-6 w-6" />
          </Button>
        </header>

        <h1 className="text-3xl font-bold tracking-tight">
          How are you feeling
          <br />
          today?
        </h1>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Mic className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search a doctor, medicins, etc..."
            className="w-full h-14 pl-12 pr-12 rounded-full border border-border bg-white"
          />
        </div>

        {/* Upcoming Appointments */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Upcoming Appointments</h2>
            <Link
              href="/appointments"
              className="text-sm font-semibold text-primary"
            >
              View All
            </Link>
          </div>
          <Card className="bg-primary text-primary-foreground p-4">
            <CardContent className="p-0 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-white">
                    <AvatarImage src={upcomingAppointment.doctor.image} />
                    <AvatarFallback>
                      {upcomingAppointment.doctor.name.charAt(4)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold">{upcomingAppointment.doctor.name}</p>
                    <p className="text-sm opacity-80">
                      {upcomingAppointment.doctor.specialty}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/20 rounded-full h-10 w-10 hover:bg-white/30"
                >
                  <Video className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex items-center justify-between text-sm bg-primary-foreground/10 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{upcomingAppointment.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{upcomingAppointment.time}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" className="bg-white/90 text-primary">
                  Re-Schedule
                </Button>
                <Button variant="outline" className="bg-transparent border-white/50 hover:bg-white/20 hover:text-white">
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Doctors */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Popular Doctors</h2>
            <Link href="/doctor" className="text-sm font-semibold text-primary">
              View All
            </Link>
          </div>

          <div className="flex gap-2">
            {specialties.map((s, i) => (
              <Button
                key={s}
                variant={i === 0 ? 'default' : 'secondary'}
                className="rounded-full"
              >
                {s}
              </Button>
            ))}
          </div>

          <div className="space-y-3">
            {popularDoctors.map((doc) => (
              <Card
                key={doc.id}
                className="p-4 bg-white"
                onClick={() => router.push(`/doctor/${doc.id}/book`)}
              >
                <CardContent className="p-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={doc.image} />
                        <AvatarFallback>
                          {doc.name.charAt(4)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-lg">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.specialty}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-bold">{doc.rating}</span>
                          <span className="text-sm text-muted-foreground">
                            ({doc.reviews} Reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Bookmark className="h-5 w-5 text-muted-foreground" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DoctorPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <DoctorPageContent />
    </Suspense>
  );
}
