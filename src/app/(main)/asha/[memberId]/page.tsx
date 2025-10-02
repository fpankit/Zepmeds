
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Bell, Syringe, BarChart3, ClipboardPlus, Calendar, Check, AlertTriangle, FileDown, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { vaccinationData, Vaccine } from '@/lib/vaccination-data';
import { growthData } from '@/lib/growth-data';
import { format, isPast } from 'date-fns';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Beneficiary {
    id: string;
    patientName: string;
    age: string;
    avatar: string;
    dataAiHint: string;
}

interface Report {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  createdAt: Timestamp; 
  officialDiagnosis: string;
  chiefComplaint: string;
  doctorNotes?: string;
  medications?: { name: string; dosage: string; frequency: string }[];
  recommendedTests?: string;
  followUpAdvice?: string;
}

const MemberDetailSkeleton = () => (
    <div className="p-4 space-y-4">
        <header className="flex justify-between items-center">
             <Skeleton className="h-10 w-10 rounded-full" />
             <div className="flex-1 ml-4 space-y-2">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
             </div>
             <Skeleton className="h-10 w-10 rounded-full" />
        </header>
        <main className="mt-4">
            <Skeleton className="h-10 w-full mb-4" />
            <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        </main>
    </div>
)

export default function FamilyMemberDetailPage() {
    const router = useRouter();
    const params = useParams();
    const memberId = params.memberId as string;

    const [member, setMember] = useState<Beneficiary | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoadingMember, setIsLoadingMember] = useState(true);
    const [isLoadingReports, setIsLoadingReports] = useState(true);

    useEffect(() => {
        if (!memberId) return;

        setIsLoadingMember(true);
        const memberDocRef = doc(db, 'zep_beneficiaries', memberId);
        const unsubscribeMember = onSnapshot(memberDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setMember({ id: docSnap.id, ...docSnap.data() } as Beneficiary);
            } else {
                // Handle case where member is not found
                router.push('/asha');
            }
            setIsLoadingMember(false);
        });

        return () => unsubscribeMember();
    }, [memberId, router]);
    
    useEffect(() => {
        if (!memberId) return;

        setIsLoadingReports(true);
        const q = query(collection(db, "zep_reports"), where("patientId", "==", memberId));
        const unsubscribeReports = onSnapshot(q, (querySnapshot) => {
            const fetchedReports = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
            setReports(fetchedReports);
            setIsLoadingReports(false);
        });
        
        return () => unsubscribeReports();
    }, [memberId]);
    
    const handleDownloadPdf = (report: Report) => {
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
        let lastY = 0;

        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('Diagnostic Report', 15, 28);
        doc.setLineWidth(0.5);
        doc.line(15, 35, pageWidth - 15, 35);
        lastY = 35;
        
        (doc as any).autoTable({
            startY: lastY + 8,
            body: [
                [{ content: 'Patient:', styles: { fontStyle: 'bold' } }, report.patientName, { content: 'Doctor:', styles: { fontStyle: 'bold' } }, report.doctorName],
                [{ content: 'Date:', styles: { fontStyle: 'bold' } }, format(report.createdAt.toDate(), 'PPP'), { content: 'Specialty:', styles: { fontStyle: 'bold' } }, report.doctorSpecialty || 'N/A'],
            ],
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 2 },
        });
        lastY = (doc as any).lastAutoTable.finalY;

        const addSection = (title: string, content: string | undefined, y: number) => {
            if (!content) return y;
            if (y > pageHeight - 40) { doc.addPage(); y = 20; }
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(title, 15, y + 10);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            const text = doc.splitTextToSize(content || 'N/A', pageWidth - 30);
            doc.text(text, 15, y + 18);
            return y + 18 + (text.length * 5);
        };

        lastY = addSection('Chief Complaint', report.chiefComplaint, lastY);
        lastY = addSection('Official Diagnosis', report.officialDiagnosis, lastY);
        if (report.medications && report.medications.length > 0) {
            if(lastY > pageHeight - 60) { doc.addPage(); lastY = 20; }
            doc.setFontSize(14);
            doc.text('Prescribed Medication', 15, lastY + 10);
            (doc as any).autoTable({
                startY: lastY + 15,
                head: [['Medication', 'Dosage', 'Frequency']],
                body: report.medications.map(m => [m.name, m.dosage, m.frequency]),
                theme: 'striped',
                headStyles: { fillColor: [30, 30, 30] },
                margin: { left: 15, right: 15 },
            });
            lastY = (doc as any).lastAutoTable.finalY;
        }
        lastY = addSection('Recommended Tests', report.recommendedTests, lastY);
        lastY = addSection('Follow-up Advice', report.followUpAdvice, lastY);
        
        doc.save(`Report_${report.patientName}_${format(report.createdAt.toDate(), 'yyyy-MM-dd')}.pdf`);
    };

    const getStatus = (vaccine: Vaccine) => {
        const dueDate = new Date(vaccine.dueDate);
        if (vaccine.isDone) {
            return { icon: <Check className="h-4 w-4 text-green-500" />, text: `Done on ${format(dueDate, 'dd MMM yyyy')}`, color: 'text-green-400' };
        }
        if (isPast(dueDate)) {
            return { icon: <AlertTriangle className="h-4 w-4 text-red-500" />, text: 'Missed', color: 'text-red-400' };
        }
        return { icon: <Calendar className="h-4 w-4 text-yellow-500" />, text: `Due on ${format(dueDate, 'dd MMM yyyy')}`, color: 'text-yellow-400' };
    };

    if (isLoadingMember || !member) {
        return <MemberDetailSkeleton />;
    }

    return (
        <div className="bg-background min-h-screen font-sans">
            <header className="sticky top-0 z-10 p-4 bg-background/80 backdrop-blur-lg border-b">
                <div className="flex justify-between items-center">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-6 w-6"/>
                    </Button>
                     <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={member.avatar} alt={member.patientName} data-ai-hint={member.dataAiHint} />
                            <AvatarFallback>{member.patientName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-lg font-bold">{member.patientName}</h1>
                            <p className="text-xs text-muted-foreground">{member.age} years</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon">
                        <Bell className="h-6 w-6"/>
                    </Button>
                </div>
            </header>

            <main className="p-4">
                 <Tabs defaultValue="vaccination" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="vaccination"><Syringe className="h-4 w-4 mr-2" />Vaccination</TabsTrigger>
                        <TabsTrigger value="growth"><BarChart3 className="h-4 w-4 mr-2" />Growth</TabsTrigger>
                        <TabsTrigger value="reports"><ClipboardPlus className="h-4 w-4 mr-2" />Reports</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="vaccination" className="mt-4 space-y-3">
                        {vaccinationData.map(vaccine => (
                            <Card key={vaccine.name}>
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold">{vaccine.name}</p>
                                        <p className="text-sm text-muted-foreground">{vaccine.protectsAgainst}</p>
                                    </div>
                                    <div className={`flex items-center gap-2 text-xs font-semibold ${getStatus(vaccine).color}`}>
                                        {getStatus(vaccine).icon}
                                        <span>{getStatus(vaccine).text}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    <TabsContent value="growth" className="mt-4 space-y-6">
                        <Card>
                             <CardContent className="p-4">
                                <h3 className="font-bold mb-1">Weight vs Age</h3>
                                <p className="text-sm text-muted-foreground mb-4">Tracking weight helps ensure healthy development.</p>
                                <div className="h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={growthData.weight} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="age" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                             </CardContent>
                        </Card>
                         <Card>
                             <CardContent className="p-4">
                                <h3 className="font-bold mb-1">Height vs Age</h3>
                                <p className="text-sm text-muted-foreground mb-4">Height is a key indicator of nutritional status.</p>
                                <div className="h-[200px]">
                                     <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={growthData.height} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="age" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="height" stroke="#82ca9d" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                             </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reports" className="mt-4 space-y-3">
                        {isLoadingReports ? (
                            <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                        ) : reports.length === 0 ? (
                            <Card className="text-center p-10 text-muted-foreground">
                                <ClipboardPlus className="mx-auto h-12 w-12" />
                                <h3 className="mt-4 font-semibold">No Reports Found</h3>
                                <p className="text-sm">There are no diagnostic reports for {member.patientName}.</p>
                            </Card>
                        ) : (
                            reports.map(report => (
                                 <Card key={report.id}>
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div>
                                            <p className="font-bold">{report.officialDiagnosis}</p>
                                            <p className="text-sm text-muted-foreground">Dr. {report.doctorName} • {format(report.createdAt.toDate(), 'dd MMM yyyy')}</p>
                                        </div>
                                        <Button size="icon" variant="outline" onClick={() => handleDownloadPdf(report)}>
                                            <FileDown className="h-5 w-5" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
