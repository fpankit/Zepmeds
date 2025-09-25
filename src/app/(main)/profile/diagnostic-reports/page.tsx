'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowLeft, ClipboardList, FileDown, AlertTriangle, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

const ReportSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
    </div>
);


export default function DiagnosticReportsPage() {
  const { user, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.isGuest) {
      setIsLoading(false);
      return;
    }

    const queryField = user.isDoctor ? "doctorId" : "patientId";

    const q = query(
      collection(db, "reports"), 
      where(queryField, "==", user.id),
      orderBy("createdAt", "desc") 
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedReports = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Report));
      setReports(fetchedReports);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching diagnostic reports: ", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  const handleDownloadPdf = (report: Report) => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    let lastY = 0;

    // Header with Zepmeds text logo
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(36, 63, 158);
    doc.text('Zepmeds', 15, 28);
    
    doc.setFontSize(22);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('Diagnostic Report', 15, 42);

    doc.setLineWidth(0.5);
    doc.line(15, 50, pageWidth - 15, 50);
    lastY = 50;
    
    (doc as any).autoTable({
        startY: lastY + 8,
        body: [
            [
                { content: 'Patient:', styles: { fontStyle: 'bold' } },
                `${report.patientName} (ID: ${report.patientId.substring(0,8)})`,
                { content: 'Doctor:', styles: { fontStyle: 'bold' } },
                `${report.doctorName}`,
            ],
            [
                { content: 'Date:', styles: { fontStyle: 'bold' } },
                format(report.createdAt.toDate(), 'PPP'),
                { content: 'Specialty:', styles: { fontStyle: 'bold' } },
                report.doctorSpecialty || 'N/A',
            ],
        ],
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 2 },
    });
    lastY = (doc as any).lastAutoTable.finalY;


    const addSection = (title: string, content: string | undefined, y: number) => {
        if (!content) return y;
        if (y > pageHeight - 40) {
            doc.addPage();
            y = 20;
        }
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(title, 15, y + 10);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const text = doc.splitTextToSize(content || 'N/A', pageWidth - 30);
        doc.text(text, 15, y + 18);
        return y + 18 + (text.length * 5);
    };

    lastY = addSection('Chief Complaint', report.chiefComplaint, lastY);
    lastY = addSection('Diagnosis', report.officialDiagnosis, lastY);
    lastY = addSection("Doctor's Notes", report.doctorNotes, lastY);

    if (report.medications && report.medications.length > 0) {
        if(lastY > pageHeight - 60) { doc.addPage(); lastY = 20; }
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
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
    
    doc.save(`Diagnostic_Report_${report.patientName}_${format(report.createdAt.toDate(), 'yyyy-MM-dd')}.pdf`);
  };
  
  if (authLoading) {
      return <div className="flex h-screen w-full items-center justify-center"><Skeleton className="h-20 w-full" /></div>;
  }

  if (!user || user.isGuest) {
      return (
         <div className="flex flex-col h-screen bg-background">
            <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-6 w-6" /></Button>
                <h1 className="text-xl font-bold">Diagnostic Reports</h1>
                <div className="w-8" />
            </header>
            <main className="flex-1 flex items-center justify-center p-4">
                <Card className="text-center p-10">
                    <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
                    <h3 className="text-xl font-semibold mt-4">Login Required</h3>
                    <p className="text-muted-foreground">Please log in to view your diagnostic reports.</p>
                    <Button asChild className="mt-4"><a href="/login">Login</a></Button>
                </Card>
            </main>
        </div>
      )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Diagnostic Reports</h1>
        <div className="w-8" />
      </header>
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <ReportSkeleton />
        ) : reports.length === 0 ? (
          <Card className="text-center p-10 mt-6">
            <ClipboardList className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">No Reports Found</h3>
            <p className="text-muted-foreground">{user.isDoctor ? "You have not created any reports yet." : "Your doctor has not uploaded any reports yet."}</p>
          </Card>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-3">
            {reports.map(report => (
              <AccordionItem value={report.id} key={report.id} className="border-b-0">
                  <Card className="bg-card/80">
                    <AccordionTrigger className="p-4 text-left hover:no-underline">
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <p className="font-bold text-base">Diagnosis: {report.officialDiagnosis}</p>
                                <Badge variant="secondary">{format(report.createdAt.toDate(), 'PPP')}</Badge>
                            </div>
                            {user.isDoctor ? (
                                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2"><User className="h-3 w-3" />Patient: {report.patientName}</p>
                            ): (
                                <p className="text-sm text-muted-foreground mt-1">Dr. {report.doctorName} - {report.doctorSpecialty || 'Physician'}</p>
                            )}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                        <div className="space-y-4 border-t pt-4">
                            <div>
                                <h4 className="font-semibold text-sm text-muted-foreground">Chief Complaint</h4>
                                <p>{report.chiefComplaint}</p>
                            </div>
                             {report.doctorNotes && (
                                <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground">Doctor's Notes</h4>
                                    <p>{report.doctorNotes}</p>
                                </div>
                             )}

                            {report.medications && report.medications.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground">Medications</h4>
                                    <ul className="list-disc pl-5 mt-1 space-y-1">
                                        {report.medications.map((med, i) => <li key={i}>{med.name} ({med.dosage} - {med.frequency})</li>)}
                                    </ul>
                                </div>
                            )}

                             {report.recommendedTests && (
                                 <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground">Recommended Tests</h4>
                                    <p>{report.recommendedTests}</p>
                                 </div>
                             )}

                             {report.followUpAdvice && (
                                 <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground">Follow-up</h4>
                                    <p>{report.followUpAdvice}</p>
                                </div>
                             )}

                            <Button size="sm" variant="outline" onClick={() => handleDownloadPdf(report)}>
                                <FileDown className="mr-2 h-4 w-4" /> View / Download PDF
                            </Button>
                        </div>
                    </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </main>
    </div>
  );
}
