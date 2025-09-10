
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Download, FileBarChart, Loader2, Sparkles, Languages, Utensils, Dumbbell, ShieldCheck, ListChecks, ListX, HeartPulse } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { generateDietPlan, GenerateDietPlanOutput } from '@/ai/flows/generate-diet-plan';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Logo } from '@/components/icons/logo';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

type Section = {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  content: string | string[];
  isList?: boolean;
};

const ReportSkeleton = () => (
    <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
             <Card key={i}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-muted animate-pulse"></div>
                        <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="space-y-2">
                        <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                        <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
                     </div>
                </CardContent>
            </Card>
        ))}
    </div>
);


export default function HealthReportPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<GenerateDietPlanOutput | null>(null);
  const [targetLang, setTargetLang] = useState('English');
  const reportRef = useRef<HTMLDivElement>(null);

  const handleGenerateReport = async (language: string) => {
    if (!user || !user.healthData) {
      toast({
        variant: 'destructive',
        title: 'No health data found',
        description: 'Please log some health metrics on the Activity page first.',
      });
      return;
    }

    setIsLoading(true);
    setReport(null);
    try {
      const generatedReport = await generateDietPlan({
        healthMetrics: user.healthData,
        targetLanguage: language,
      });
      setReport(generatedReport);
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Could not generate the health report. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onLanguageChange = (lang: string) => {
    setTargetLang(lang);
    if (report) { // Regenerate report if one already exists
      handleGenerateReport(lang);
    }
  }

  const handleDownload = async () => {
    const reportContainer = reportRef.current;
    if (!reportContainer) return;
  
    toast({ title: "Preparing Download...", description: "Please wait while we generate your PDF." });
  
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pdfWidth - margin * 2;
    let yPos = margin;
  
    // Function to add an element to the PDF, handling page breaks
    const addElementToPdf = async (element: HTMLElement) => {
      // Temporarily remove any "hidden" class to ensure it's rendered for canvas capture
      const wasHidden = element.classList.contains('hidden');
      if (wasHidden) element.classList.remove('hidden');

      const canvas = await html2canvas(element, {
        scale: 3, // Increased scale for better quality
        useCORS: true,
        backgroundColor: '#0c0a09' // Match the app's dark background for consistency
      });

      // Restore hidden class if it was there
      if (wasHidden) element.classList.add('hidden');

      const imgData = canvas.toDataURL('image/png');
      const imgHeight = (canvas.height * contentWidth) / canvas.width;
      
      // Check if the element fits on the current page, if not, add a new page
      if (yPos > margin && yPos + imgHeight > pdfHeight - margin) {
        pdf.addPage();
        yPos = margin; // Reset y position for the new page
      }
      
      pdf.addImage(imgData, 'PNG', margin, yPos, contentWidth, imgHeight);
      yPos += imgHeight + 5; // Add some padding after the element
    };
  
    try {
      const sections = reportContainer.querySelectorAll<HTMLElement>('[data-report-section]');
      
      for (const section of Array.from(sections)) {
        await addElementToPdf(section);
      }
  
      pdf.save(`Zepmeds_Health_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Failed to download PDF:", error);
      toast({ variant: 'destructive', title: "Download Failed", description: "Could not create the PDF file." });
    }
  };
  
  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
        case 'high': return 'text-red-500';
        case 'very high': return 'text-red-700';
        case 'moderate': return 'text-yellow-500';
        case 'low': return 'text-green-500';
        default: return 'text-gray-400';
    }
  }

  const sections: Section[] = report ? [
    { id: 'diet-plan', title: 'Diet Plan', icon: Utensils, color: 'text-green-500', content: `**Morning:** ${report.dietPlan.morning}\n\n**Lunch:** ${report.dietPlan.lunch}\n\n**Dinner:** ${report.dietPlan.dinner}` },
    { id: 'exercise-tips', title: 'Exercise Tips', icon: Dumbbell, color: 'text-orange-500', content: report.exerciseTips, isList: true },
    { id: 'home-remedies', title: 'Home Remedies', icon: ShieldCheck, color: 'text-blue-500', content: report.homeRemedies, isList: true },
    { id: 'dos', title: "Do's", icon: ListChecks, color: 'text-sky-500', content: report.doAndDont.dos, isList: true },
    { id: 'donts', title: "Don'ts", icon: ListX, color: 'text-red-500', content: report.doAndDont.donts, isList: true },
  ] : [];

  const languageOptions = ['English', 'Hindi', 'Punjabi', 'Tamil', 'Telugu', 'Kannada'];

  const renderContent = (content: string) => {
    const htmlContent = content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
    // Using a specific class for PDF text size
    return <div className="pdf-text-sm whitespace-pre-line leading-relaxed" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  }

  const chartData = user?.healthData ? [
      { name: 'Steps', value: parseInt(user.healthData.dailySteps?.replace(/,/g, '') || '0') },
      { name: 'Water (glasses)', value: parseInt(user.healthData.waterIntake?.split(' ')[0] || '0') },
      { name: 'Calories', value: parseInt(user.healthData.caloriesBurned?.replace(/ cals/g, '') || '0') },
  ] : [];

  const pieChartData = report?.healthAnalysis.risks.map(r => ({ name: r.condition, value: r.level === 'Low' ? 1 : (r.level === 'Moderate' ? 2 : 3)}));
  const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];


  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-6">
      <style jsx global>{`
        .pdf-header-logo { font-size: 32px !important; }
        .pdf-header-info { font-size: 24px !important; }
        .pdf-title { font-size: 17px !important; }
        .pdf-section-header { font-size: 14px !important; }
        .pdf-text-sm { font-size: 11px !important; }
      `}</style>
       <Card className="bg-primary/10 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                    <FileBarChart className="h-8 w-8 text-primary" />
                    My Health Report
                </CardTitle>
                <CardDescription>
                   Generate a personalized diet and lifestyle plan based on your logged health metrics. This report is powered by AI and tailored to you.
                </CardDescription>
            </CardHeader>
        </Card>

        <div className="flex flex-col sm:flex-row gap-2">
             <Select onValueChange={onLanguageChange} defaultValue={targetLang}>
                <SelectTrigger>
                    <div className="flex items-center gap-2">
                        <Languages className="h-5 w-5" />
                        <SelectValue placeholder="Select Language" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    {languageOptions.map(lang => (
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Button onClick={() => handleGenerateReport(targetLang)} disabled={isLoading} className="flex-1">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {report ? 'Regenerate Report' : 'Generate My Health Report'}
            </Button>
            {report && (
                <Button onClick={handleDownload} variant="outline" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download as PDF
                </Button>
            )}
        </div>


        {isLoading && <ReportSkeleton />}

        {!isLoading && !report && (
             <Card className="text-center p-10 border-dashed">
                <Bot className="mx-auto h-16 w-16 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold">Your report will appear here</h3>
                <p className="mt-2 text-muted-foreground">Click the button above to generate your personalized health plan.</p>
            </Card>
        )}

        {report && user && (
            <div ref={reportRef} className="bg-card rounded-lg border border-border p-4">
                {/* This wrapper is for on-screen display. The PDF will be built section-by-section. */}
                {/* PDF Header section */}
                <div data-report-section id="pdf-header" className="bg-background text-foreground p-6">
                    <div className="flex items-center justify-between">
                       <Logo className="h-8 w-auto pdf-header-logo" />
                       <div className="text-right text-muted-foreground">
                            <p className="pdf-header-info">{user.firstName} {user.lastName}</p>
                            <p className="pdf-header-info">{user.email}</p>
                       </div>
                    </div>
                    <hr className="border-border my-4" />
                </div>
                
                {/* PDF Title Section */}
                <div data-report-section id="pdf-title" className="text-center my-6 bg-background text-foreground p-6">
                    <h2 className="font-bold tracking-wider uppercase text-muted-foreground pdf-title">Your Personalized Health Report</h2>
                    <p className="text-[14px] text-muted-foreground mt-1">Generated on {new Date().toLocaleDateString()}</p>
                </div>

                {/* PDF Analysis Section */}
                <div data-report-section id="pdf-analysis" className="p-4 rounded-lg bg-card border border-border mb-4">
                    <h3 className="font-bold flex items-center gap-2 pdf-section-header mb-3">
                        <HeartPulse className="h-5 w-5 text-primary" /> Health Risk Analysis
                    </h3>
                    <p className="pdf-text-sm text-muted-foreground italic mb-4">{report.healthAnalysis.riskSummary}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {report.healthAnalysis.risks.map((risk, i) => (
                            <div key={i} className="p-3 rounded-md bg-background border">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold pdf-section-header">{risk.condition}</h4>
                                    <span className={cn("font-bold pdf-section-header", getRiskColor(risk.level))}>{risk.level}</span>
                                </div>
                                <p className="pdf-text-sm text-muted-foreground mt-1">{risk.reason}</p>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* PDF Main Content Sections */}
                {sections.map(({ id, title, icon: Icon, color, content, isList }) => (
                     <div data-report-section id={`pdf-${id}`} key={id} className="p-4 rounded-lg bg-card border border-border mb-4 break-inside-avoid">
                        <h3 className={cn("font-bold flex items-center gap-2 pdf-section-header mb-3", color)}>
                            <Icon className="h-5 w-5" /> {title}
                        </h3>
                        {isList && Array.isArray(content) ? (
                            <ul className="list-disc pl-5 space-y-2 pdf-text-sm">
                                {content.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        ) : (
                            renderContent(content as string)
                        )}
                    </div>
                ))}
                
                {/* PDF Charts Section */}
                <div data-report-section id="pdf-charts" className="p-4 rounded-lg bg-card border border-border mb-4 break-inside-avoid">
                    <h3 className="font-bold flex items-center gap-2 pdf-section-header mb-3">
                        <FileBarChart className="h-5 w-5 text-primary" /> Health Charts
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                       <div>
                           <h4 className="text-center font-semibold text-[12px] mb-2">Daily Activity</h4>
                           <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={chartData}>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false}/>
                                    <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false}/>
                                    <Tooltip wrapperClassName="!bg-background !border-border" cursor={{fill: 'hsla(var(--muted))'}}/>
                                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                           </ResponsiveContainer>
                        </div>
                        <div>
                           <h4 className="text-center font-semibold text-[12px] mb-2">Risk Distribution</h4>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                        {pieChartData?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip wrapperClassName="!bg-background !border-border"/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* PDF Footer section */}
                <div data-report-section id="pdf-footer" className="text-center pt-6 text-[10px] text-muted-foreground bg-background text-foreground p-6">
                    <p>Disclaimer: This report is generated by an AI and is for informational purposes only. It is not a substitute for professional medical advice. Always consult with a qualified healthcare provider for any health concerns.</p>
                    <p className="mt-2 font-headline">&copy; {new Date().getFullYear()} Zepmeds</p>
                </div>
            </div>
        )}
    </div>
  );
}

    