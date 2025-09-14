
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { generateHealthReport, HealthReportOutput } from '@/ai/flows/health-report-flow';
import { healthMetrics } from '@/lib/health-data';
import { Loader2, FileText, Download, Shield, Heart, Utensils, Dumbbell, ListChecks, History, Eye, List } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { format } from 'date-fns';

interface PastReport {
    id: string;
    reportData: HealthReportOutput;
    createdAt: Timestamp;
}

function HealthReportSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-3/4"></div>
        <div className="h-24 bg-muted rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-muted rounded"></div>
            <div className="h-48 bg-muted rounded"></div>
            <div className="h-48 bg-muted rounded"></div>
            <div className="h-48 bg-muted rounded"></div>
        </div>
    </div>
  );
}

export default function HealthReportPage() {
  const [report, setReport] = useState<HealthReportOutput | null>(null);
  const [pastReports, setPastReports] = useState<PastReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const userHealthData = useMemo(() => {
    if (!user) return {};
    const data: { [key: string]: string } = {};
    healthMetrics.forEach(metric => {
      data[metric.id] = user.healthData?.[metric.id] || metric.defaultValue;
    });
    return data;
  }, [user]);

  useEffect(() => {
    if (!user || user.isGuest) {
      setIsHistoryLoading(false);
      return;
    }

    const fetchPastReports = async () => {
        try {
            const q = query(
                collection(db, "health_reports"),
                where("userId", "==", user.id),
                orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(q);
            const reports = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PastReport));
            setPastReports(reports);
        } catch (error) {
            console.error("Error fetching past reports:", error);
            toast({ variant: 'destructive', title: 'Could not load past reports.' });
        } finally {
            setIsHistoryLoading(false);
        }
    };

    fetchPastReports();
  }, [user, toast]);

  const handleGenerateReport = async () => {
    if (!user || user.isGuest) {
      toast({ variant: 'destructive', title: 'Please log in to generate a report.' });
      router.push('/login');
      return;
    }
    setIsLoading(true);
    setReport(null);

    try {
      const input = {
        dailySteps: userHealthData.dailySteps || '0',
        waterIntake: userHealthData.waterIntake || '0',
        caloriesBurned: userHealthData.caloriesBurned || '0',
        bloodPressure: userHealthData.bloodPressure || 'N/A',
        bloodGlucose: userHealthData.bloodGlucose || 'N/A',
        heartRate: userHealthData.heartRate || 'N/A',
      };
      const result = await generateHealthReport(input);
      setReport(result);
      
      // Save report to Firestore
      const newReportRef = await addDoc(collection(db, "health_reports"), {
          userId: user.id,
          reportData: result,
          createdAt: serverTimestamp()
      });
      // Add to local state to avoid re-fetch
      setPastReports(prev => [{ id: newReportRef.id, reportData: result, createdAt: new Timestamp(Date.now()/1000, 0) }, ...prev]);

    } catch (error) {
      console.error('Failed to generate health report:', error);
      toast({ variant: 'destructive', title: 'Generation Failed', description: 'Could not generate the health report. Please try again later.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = (reportToDownload: HealthReportOutput | null) => {
    if (!reportToDownload || !user) return;

    const doc = new jsPDF();
    const today = new Date().toLocaleDateString();

    // Title
    doc.setFontSize(22);
    doc.text('AI Health Report', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`For: ${user.firstName} ${user.lastName}`, 105, 28, { align: 'center' });
    doc.text(`Date: ${today}`, 105, 34, { align: 'center' });

    // Disclaimer
    doc.setFontSize(10);
    doc.setTextColor(100);
    const disclaimerText = doc.splitTextToSize(reportToDownload.disclaimer, 180);
    doc.text(disclaimerText, 15, 45);

    // Risk Analysis
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('Risk Analysis', 15, 65);
    (doc as any).autoTable({
        startY: 70,
        head: [['Condition', 'Risk Level', 'Explanation']],
        body: reportToDownload.riskAnalysis.map(r => [r.condition, r.riskLevel, r.explanation]),
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] },
    });

    // Diet Plan
    const lastY = (doc as any).lastAutoTable.finalY || 70;
    doc.text('Diet Plan (Indian Cuisine)', 15, lastY + 15);
    (doc as any).autoTable({
        startY: lastY + 20,
        theme: 'grid',
        head: [['Meal', 'Recommendation']],
        body: [
            ['Breakfast', reportToDownload.dietPlan.breakfast],
            ['Lunch', reportToDownload.dietPlan.lunch],
            ['Dinner', reportToDownload.dietPlan.dinner],
        ],
    });

    // Exercise, Remedies, Do's/Don'ts
    let finalY = (doc as any).lastAutoTable.finalY;
    const addSection = (title: string, items: string[]) => {
      if (finalY > 250) { doc.addPage(); finalY = 20; }
      doc.setFontSize(14);
      doc.text(title, 15, finalY + 15);
      doc.setFontSize(10);
      items.forEach((item, index) => {
        doc.text(`• ${item}`, 20, finalY + 22 + (index * 6));
      });
      finalY += 22 + (items.length * 6);
    }
    
    addSection('Exercise Plan', reportToDownload.exercisePlan);
    addSection('Home Remedies', reportToDownload.homeRemedies);
    addSection("Do's", reportToDownload.dosAndDonts.dos);
    addSection("Don'ts", reportToDownload.dosAndDonts.donts);
    
    doc.save(`Health_Report_${user.firstName}_${today}.pdf`);
  };

  const ReportDisplay = ({ reportToDisplay }: { reportToDisplay: HealthReportOutput }) => (
     <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Your AI-Generated Report</CardTitle>
                    <CardDescription>Generated on {new Date().toLocaleString()}</CardDescription>
                </div>
                <Button onClick={() => handleDownloadPdf(reportToDisplay)}>
                    <Download className="mr-2 h-4 w-4" /> Download PDF
                </Button>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
                    <h3 className="font-bold flex items-center gap-2"><Shield className="text-yellow-500" /> Disclaimer</h3>
                    <p className="text-sm text-yellow-400/80">{reportToDisplay.disclaimer}</p>
                </div>

                <div>
                    <h3 className="font-bold text-xl mb-4 flex items-center gap-2"><Heart /> Risk Analysis</h3>
                    <div className="space-y-4">
                        {reportToDisplay.riskAnalysis.map((risk, i) => (
                             <div key={i} className="p-4 border rounded-lg bg-card/50">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold">{risk.condition}</p>
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${risk.riskLevel === 'High' ? 'bg-red-500/80' : risk.riskLevel === 'Moderate' ? 'bg-yellow-500/80' : 'bg-green-500/80'}`}>
                                        {risk.riskLevel}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{risk.explanation}</p>
                             </div>
                        ))}
                    </div>
                </div>

                 <div>
                    <h3 className="font-bold text-xl mb-4 flex items-center gap-2"><Utensils /> Diet Plan (Indian Cuisine)</h3>
                    <div className="space-y-3">
                        <p><strong>Breakfast:</strong> {reportToDisplay.dietPlan.breakfast}</p>
                        <p><strong>Lunch:</strong> {reportToDisplay.dietPlan.lunch}</p>
                        <p><strong>Dinner:</strong> {reportToDisplay.dietPlan.dinner}</p>
                    </div>
                </div>
                
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-bold text-xl mb-4 flex items-center gap-2"><Dumbbell /> Exercise Plan</h3>
                        <ul className="list-disc list-inside space-y-1">
                            {reportToDisplay.exercisePlan.map((ex, i) => <li key={i}>{ex}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-xl mb-4 flex items-center gap-2"><ListChecks /> Do's & Don'ts</h3>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold mb-2 text-green-400">Do's</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    {reportToDisplay.dosAndDonts.dos.map((d, i) => <li key={i}>{d}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2 text-red-400">Don'ts</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    {reportToDisplay.dosAndDonts.donts.map((d, i) => <li key={i}>{d}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                 </div>

                 <div>
                    <h3 className="font-bold text-xl mb-4">Home Remedies</h3>
                    <ul className="list-disc list-inside space-y-1">
                        {reportToDisplay.homeRemedies.map((remedy, i) => <li key={i}>{remedy}</li>)}
                    </ul>
                </div>
            </CardContent>
        </Card>
  );

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-3xl">
            <FileText />
            My Health Report
          </CardTitle>
          <CardDescription>
            Generate an AI-powered analysis of your logged health data. This is not a substitute for professional medical advice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerateReport} disabled={isLoading} size="lg">
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {isLoading ? 'Generating Report...' : 'Generate New AI Health Report'}
          </Button>
        </CardContent>
      </Card>
      
      {isLoading && (
          <Card className="mt-6 p-6">
              <HealthReportSkeleton />
          </Card>
      )}

      {report && <ReportDisplay reportToDisplay={report} />}

      <Card className="mt-6">
        <CardHeader>
            <CardTitle className="flex items-center gap-3">
                <History /> Past Reports
            </CardTitle>
            <CardDescription>View or re-download your previously generated reports.</CardDescription>
        </CardHeader>
        <CardContent>
            {isHistoryLoading ? (
                 <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                 </div>
            ) : pastReports.length > 0 ? (
                <div className="space-y-4">
                    {pastReports.map(pastReport => (
                        <Card key={pastReport.id} className="p-4 flex items-center justify-between">
                            <div>
                                <p className="font-semibold">Health Report</p>
                                <p className="text-sm text-muted-foreground">
                                    {format(pastReport.createdAt.toDate(), 'PPP, p')}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setReport(pastReport.reportData)}>
                                    <Eye className="mr-2 h-4 w-4" /> View
                                </Button>
                                <Button variant="secondary" size="sm" onClick={() => handleDownloadPdf(pastReport.reportData)}>
                                    <Download className="mr-2 h-4 w-4" /> Download
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center p-8 text-muted-foreground">
                    <List className="mx-auto h-12 w-12" />
                    <p className="mt-4">You have no past reports.</p>
                    <p>Generate one to see it here.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
