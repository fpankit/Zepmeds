
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowLeft, ClipboardList, FileDown, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Report {
  id: string;
  patientName: string;
  doctorName: string;
  doctorSpecialty: string;
  reportDate: Timestamp;
  chiefComplaint: string;
  diagnosis: string;
  notes: string;
  medications: { name: string; dosage: string; frequency: string }[];
  tests: { name: string; notes: string }[];
  followUp: string;
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

    const q = query(
      collection(db, "diagnostic_reports"),
      where("patientId", "==", user.id),
      orderBy("reportDate", "desc")
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

    // Header
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Diagnostic Report', 105, 20, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${format(report.reportDate.toDate(), 'PPP')}`, 195, 30, { align: 'right' });

    // Patient and Doctor Details
    doc.setLineWidth(0.5);
    doc.line(15, 35, 195, 35);
    (doc as any).autoTable({
        startY: 40,
        body: [
            [{ content: 'Patient Name:', styles: { fontStyle: 'bold' } }, report.patientName],
            [{ content: 'Doctor Name:', styles: { fontStyle: 'bold' } }, `${report.doctorName} (${report.doctorSpecialty})`],
        ],
        theme: 'plain',
        styles: { cellPadding: 2 },
        columnStyles: { 0: { cellWidth: 40 } },
    });
    let lastY = (doc as any).lastAutoTable.finalY;

    // Report Content
    const addSection = (title: string, content: string, y: number) => {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 15, y);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const text = doc.splitTextToSize(content, 180);
        doc.text(text, 15, y + 7);
        return y + 7 + (text.length * 5);
    };

    lastY = addSection('Chief Complaint', report.chiefComplaint, lastY + 10);
    lastY = addSection('Diagnosis', report.diagnosis, lastY + 5);
    lastY = addSection('Doctor\'s Notes', report.notes, lastY + 5);

    // Medications
    if (report.medications && report.medications.length > 0) {
        if(lastY > 240) { doc.addPage(); lastY = 15; }
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Prescribed Medication', 15, lastY + 10);
        (doc as any).autoTable({
            startY: lastY + 15,
            head: [['Medication', 'Dosage', 'Frequency']],
            body: report.medications.map(m => [m.name, m.dosage, m.frequency]),
            theme: 'striped',
            headStyles: { fillColor: [63, 81, 181] },
        });
        lastY = (doc as any).lastAutoTable.finalY;
    }
    
    // Tests
     if (report.tests && report.tests.length > 0) {
        if(lastY > 240) { doc.addPage(); lastY = 15; }
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Recommended Tests', 15, lastY + 10);
        (doc as any).autoTable({
            startY: lastY + 15,
            head: [['Test Name', 'Notes']],
            body: report.tests.map(t => [t.name, t.notes]),
            theme: 'grid',
        });
        lastY = (doc as any).lastAutoTable.finalY;
    }

    // Follow up
    if (lastY > 260) { doc.addPage(); lastY = 20; }
    lastY = addSection('Follow-up Advice', report.followUp, lastY + 10);
    
    doc.save(`Diagnostic_Report_${report.patientName}_${format(report.reportDate.toDate(), 'yyyy-MM-dd')}.pdf`);
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
            <p className="text-muted-foreground">Your doctor has not uploaded any reports yet.</p>
          </Card>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-3">
            {reports.map(report => (
              <AccordionItem value={report.id} key={report.id} className="border-b-0">
                  <Card className="bg-card/80">
                    <AccordionTrigger className="p-4 text-left hover:no-underline">
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <p className="font-bold text-base">Diagnosis: {report.diagnosis}</p>
                                <Badge variant="secondary">{format(report.reportDate.toDate(), 'PPP')}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">Dr. {report.doctorName} - {report.doctorSpecialty}</p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                        <div className="space-y-4 border-t pt-4">
                            <div>
                                <h4 className="font-semibold text-sm text-muted-foreground">Chief Complaint</h4>
                                <p>{report.chiefComplaint}</p>
                            </div>
                             <div>
                                <h4 className="font-semibold text-sm text-muted-foreground">Doctor's Notes</h4>
                                <p>{report.notes}</p>
                            </div>

                            {report.medications && report.medications.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground">Medications</h4>
                                    <ul className="list-disc pl-5 mt-1 space-y-1">
                                        {report.medications.map((med, i) => <li key={i}>{med.name} ({med.dosage} - {med.frequency})</li>)}
                                    </ul>
                                </div>
                            )}

                             {report.tests && report.tests.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground">Recommended Tests</h4>
                                    <ul className="list-disc pl-5 mt-1 space-y-1">
                                        {report.tests.map((test, i) => <li key={i}>{test.name} ({test.notes})</li>)}
                                    </ul>
                                </div>
                            )}

                             <div>
                                <h4 className="font-semibold text-sm text-muted-foreground">Follow-up</h4>
                                <p>{report.followUp}</p>
                            </div>

                            <Button size="sm" variant="outline" onClick={() => handleDownloadPdf(report)}>
                                <FileDown className="mr-2 h-4 w-4" /> Download as PDF
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
