
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Stethoscope, Phone, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  image: string;
  dataAiHint: string;
}

const mockDoctors: Doctor[] = [
    {
        id: "doc1",
        name: "Dr. Anjali Sharma",
        specialty: "Cardiologist",
        experience: "12+ years of experience",
        image: "https://picsum.photos/200/200?random=41",
        dataAiHint: "doctor woman portrait",
    },
    {
        id: "doc2",
        name: "Dr. Vikram Singh",
        specialty: "Neurologist",
        experience: "10+ years of experience",
        image: "https://picsum.photos/200/200?random=42",
        dataAiHint: "doctor man portrait",
    },
    {
        id: "doc3",
        name: "Dr. Priya Desai",
        specialty: "Pediatrician",
        experience: "8+ years of experience",
        image: "https://picsum.photos/200/200?random=43",
        dataAiHint: "doctor woman smiling",
    },
];


export default function DoctorPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "doctors"));
        const doctorsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
        
        if (doctorsData.length > 0) {
            setDoctors(doctorsData);
        } else {
            // If no doctors in Firestore, use mock data
            setDoctors(mockDoctors);
        }

      } catch (error) {
        console.error("Error fetching doctors, using mock data: ", error);
        // If there's an error, use mock data as a fallback
        setDoctors(mockDoctors);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const createChannelName = (doctorId: string) => {
    const userId = user?.id || 'guest';
    // Sanitize channel name for Agora
    const cleanUserId = userId.replace(/[^a-zA-Z0-9]/g, '');
    const cleanDoctorId = doctorId.replace(/[^a-zA-Z0-9]/g, '');
    return `zepmeds-call-${cleanUserId}-${cleanDoctorId}`;
  }

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-6">
      <div className="flex flex-col items-center text-center space-y-2">
        <Stethoscope className="h-12 w-12 text-primary" />
        <h1 className="text-3xl font-bold">Consult a Doctor</h1>
        <p className="text-muted-foreground">
          Book an appointment or start a video call with our top-rated doctors.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by doctor or specialty" className="pl-10" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : doctors.length > 0 ? (
            doctors.map((doctor) => (
            <Card key={doctor.id} className="overflow-hidden">
                <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                    <AvatarImage src={doctor.image} alt={doctor.name} data-ai-hint={doctor.dataAiHint} />
                    <AvatarFallback>{doctor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                    <h3 className="font-bold text-lg">{doctor.name}</h3>
                    <p className="text-primary font-medium">{doctor.specialty}</p>
                    <p className="text-sm text-muted-foreground">
                        {doctor.experience}
                    </p>
                    </div>
                </div>
                <div className="flex gap-2 mt-4">
                    <Button className="w-full">Book Appointment</Button>
                    <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                        <Link href={`/video-call/${createChannelName(doctor.id)}`}>
                          <Video className="mr-2 h-4 w-4" /> Call Now
                        </Link>
                    </Button>
                </div>
                </CardContent>
            </Card>
            ))
        ) : (
            <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">No doctors available at the moment. Please check back later.</p>
            </div>
        )}
      </div>
    </div>
  );
}
