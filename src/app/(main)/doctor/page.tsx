
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Stethoscope } from "lucide-react";

const doctors = [
  {
    name: "Dr. Emily Carter",
    specialty: "Cardiologist",
    experience: "15 years of experience",
    image: "https://picsum.photos/200/200?random=1",
    dataAiHint: "doctor portrait",
  },
  {
    name: "Dr. Ben Adams",
    specialty: "Dermatologist",
    experience: "10 years of experience",
    image: "https://picsum.photos/200/200?random=2",
    dataAiHint: "doctor portrait",
  },
  {
    name: "Dr. Sarah Lee",
    specialty: "Pediatrician",
    experience: "12 years of experience",
    image: "https://picsum.photos/200/200?random=3",
    dataAiHint: "doctor portrait",
  },
  {
    name: "Dr. James Wilson",
    specialty: "Neurologist",
    experience: "20 years of experience",
    image: "https://picsum.photos/200/200?random=4",
    dataAiHint: "doctor portrait",
  },
];

export default function DoctorPage() {
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-6">
      <div className="flex flex-col items-center text-center space-y-2">
        <Stethoscope className="h-12 w-12 text-primary" />
        <h1 className="text-3xl font-bold">Consult a Doctor</h1>
        <p className="text-muted-foreground">
          Book an appointment with our top-rated doctors.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by doctor or specialty" className="pl-10" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <Card key={doctor.name} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={doctor.image} alt={doctor.name} data-ai-hint={doctor.dataAiHint} />
                  <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">{doctor.name}</h3>
                  <p className="text-primary font-medium">{doctor.specialty}</p>
                  <p className="text-sm text-muted-foreground">
                    {doctor.experience}
                  </p>
                </div>
              </div>
              <Button className="w-full mt-4">Book Appointment</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
