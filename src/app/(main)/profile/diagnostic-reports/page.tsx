'use client';

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
  createdAt: Timestamp; // Changed from reportDate
  chiefComplaint: string;
  officialDiagnosis: string; // Changed from diagnosis
  doctorNotes: string; // Changed from notes
  medications: { name: string; dosage: string; frequency: string }[];
  recommendedTests: string; // Changed from array to string
  followUpAdvice: string; // Changed from followUp
}

const ReportSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
    </div>
);

// Base64 encoded SVG of the Zepmeds logo - CANNOT BE USED DIRECTLY
const zepmedsLogoBase64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgNTAiIHdpZHRoPSIyMDAiIGhlaWdodD0iNTAiPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZDEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZmVkYzI4OyIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmZWExNTI7IiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxwYXRoIGQ9Ik0xMCAyNSBDIDE1IDEwLCAyNSAxMCwgMzAgMjUgUyA0MCA0MCwgNDUgMjUiIHN0cm9rZT0idXJsKCNncmFkMSkiIHN0cm9rZS13aWR0aD0iNCIgZmlsbD0ibm9uZSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHRleHQgeD0iNTUiIHk9IjM1IiBmb250LWZhbWlseT0iJ0FyaWFsIFJvdW5kZWQgTVQgQm9sZCcsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMzIiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjM0EzQjNCIj5aZXBtZWRzPC90ZXh0Pjwvc3ZnPg==";

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
      collection(db, "reports"), 
      where("patientId", "==", user.id),
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

    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 139); // Dark Navy Blue
    doc.text('Zepmeds', pageWidth - 15, 15, { align: 'right' });

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0); // Black for main title
    doc.text('Diagnostic Report', pageWidth / 2, 28, { align: 'center' });
    
    doc.setLineWidth(0.5);
    doc.line(15, 35, pageWidth - 15, 35);
    lastY = 35;
    
    // Patient and Doctor Details
    (doc as any).autoTable({
        startY: lastY + 5,
        body: [
            [{ content: 'Patient Name:', styles: { fontStyle: 'bold', cellWidth: 35 } }, report.patientName],
            [{ content: 'Doctor Name:', styles: { fontStyle: 'bold', cellWidth: 35 } }, `${report.doctorName} (${report.doctorSpecialty || 'Physician'})`],
            [{ content: 'Date Issued:', styles: { fontStyle: 'bold', cellWidth: 35 } }, format(report.createdAt.toDate(), 'PPP')],
        ],
        theme: 'plain',
        styles: { fontSize: 11, cellPadding: 1.5 },
    });
    lastY = (doc as any).lastAutoTable.finalY;

    // Report Content
    const addSection = (title: string, content: string, y: number) => {
        if (y > pageHeight - 40) { // check for page break
            doc.addPage();
            y = 20;
        }
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
    lastY = addSection('Diagnosis', report.officialDiagnosis, lastY);
    lastY = addSection('Doctor\'s Notes', report.doctorNotes, lastY);

    // Medications
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
            headStyles: { fillColor: [30, 30, 30] }, // Dark header
            margin: { left: 15, right: 15 },
        });
        lastY = (doc as any).lastAutoTable.finalY;
    }
    
    // Tests
     if (report.recommendedTests) {
        lastY = addSection('Recommended Tests', report.recommendedTests, lastY);
    }

    // Follow up
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
                                <p className="font-bold text-base">Diagnosis: {report.officialDiagnosis}</p>
                                <Badge variant="secondary">{format(report.createdAt.toDate(), 'PPP')}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">Dr. {report.doctorName} - {report.doctorSpecialty || 'Physician'}</p>
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
                                <p>{report.doctorNotes}</p>
                            </div>

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

                             <div>
                                <h4 className="font-semibold text-sm text-muted-foreground">Follow-up</h4>
                                <p>{report.followUpAdvice}</p>
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
