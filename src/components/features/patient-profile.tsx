
"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User as UserIcon, Calendar, Phone, Mail, FileText, History } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "../ui/separator";

const getInitials = (firstName: string = '', lastName: string = '') => {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
}

export function PatientProfile({ patientId }: { patientId: string | null }) {
  const [patient, setPatient] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!patientId) {
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    const patientDocRef = doc(db, "users", patientId);
    const unsubscribePatient = onSnapshot(patientDocRef, (docSnap) => {
        if (docSnap.exists()) {
            setPatient({ id: docSnap.id, ...docSnap.data() } as User);
        } else {
            console.error("Patient document not found");
            setPatient(null);
        }
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching patient document:", error);
        setIsLoading(false);
    });
    
    return () => unsubscribePatient();

  }, [patientId]);


  if (isLoading) {
    return (
        <Card className="w-full h-full bg-gray-800 rounded-lg text-white">
            <CardHeader><CardTitle>Patient Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full bg-gray-700" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-3/4 bg-gray-700" />
                        <Skeleton className="h-4 w-1/2 bg-gray-700" />
                    </div>
                </div>
                <Skeleton className="h-4 w-full bg-gray-700" />
                <Skeleton className="h-4 w-full bg-gray-700" />
                <Skeleton className="h-4 w-full bg-gray-700" />
            </CardContent>
        </Card>
    )
  }
  
  if (!patient) {
      return (
          <Card className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center text-white">
             <p>Could not load patient details.</p>
          </Card>
    );
  }

  return (
    <Card className="w-full h-full bg-gray-800 text-white rounded-lg overflow-y-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <UserIcon />
            Patient Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-xl bg-gray-700 text-white">
                {getInitials(patient.firstName, patient.lastName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-bold">{patient.firstName} {patient.lastName}</h3>
            <p className="text-sm text-gray-400">Patient ID: {patient.id.substring(0,10)}...</p>
          </div>
        </div>
        <Separator className="bg-gray-700"/>
        <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400"/>
                <span>Age: 28 (Placeholder)</span>
            </div>
            <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400"/>
                <span>{patient.phone}</span>
            </div>
            <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400"/>
                <span>{patient.email}</span>
            </div>
        </div>
        <Separator className="bg-gray-700"/>
         <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2"><History className="h-4 w-4"/> Medical History</h4>
            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                <li>Hypertension (5 years)</li>
                <li>Allergy to Penicillin</li>
            </ul>
        </div>
        <Separator className="bg-gray-700"/>
        <div className="space-y-2">
            <h4 className="font-semibold flex items-center gap-2"><FileText className="h-4 w-4"/> Recent Reports</h4>
             <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                <li>Blood Test (02/05/2024) - Normal</li>
                <li>Chest X-Ray (15/04/2024) - Clear</li>
            </ul>
        </div>
      </CardContent>
    </Card>
  );
}
