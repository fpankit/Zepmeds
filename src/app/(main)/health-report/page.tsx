
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

type Section = {
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
    const reportElement = reportRef.current;
    if (!reportElement) return;

    toast({ title: "Preparing Download...", description: "Please wait while we generate your PDF."});

    try {
        const canvas = await html2canvas(reportElement, { 
          scale: 4, // Increased scale for much higher quality rendering
          backgroundColor: null, // Use transparent background
          useCORS: true 
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = imgWidth / imgHeight;
        
        const contentWidth = pdfWidth - 20; // 10mm margin on each side
        let contentHeight = contentWidth / ratio;
        
        let heightLeft = contentHeight;
        let position = 10; // Top margin

        pdf.addImage(imgData, 'PNG', 10, position, contentWidth, contentHeight);
        heightLeft -= (pdfHeight - 20);

        while (heightLeft > 0) {
            position = heightLeft - contentHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, contentWidth, contentHeight);
            heightLeft -= pdfHeight;
        }

        pdf.save(`Zepmeds_Health_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
        console.error("Failed to download PDF:", error);
        toast({ variant: 'destructive', title: "Download Failed", description: "Could not create the PDF file."});
    }
  };
  
  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
        case 'high': return 'text-red-500';
        case 'moderate': return 'text-yellow-500';
        case 'low': return 'text-green-500';
        default: return 'text-gray-400';
    }
  }

  const sections: Section[] = report ? [
    { title: 'Diet Plan', icon: Utensils, color: 'text-green-500', content: `**Morning:** ${report.dietPlan.morning}\n\n**Lunch:** ${report.dietPlan.lunch}\n\n**Dinner:** ${report.dietPlan.dinner}` },
    { title: 'Exercise Tips', icon: Dumbbell, color: 'text-orange-500', content: report.exerciseTips, isList: true },
    { title: 'Home Remedies', icon: ShieldCheck, color: 'text-blue-500', content: report.homeRemedies, isList: true },
    { title: "Do's", icon: ListChecks, color: 'text-sky-500', content: report.doAndDont.dos, isList: true },
    { title: "Don'ts", icon: ListX, color: 'text-red-500', content: report.doAndDont.donts, isList: true },
  ] : [];

  const languageOptions = ['English', 'Hindi', 'Punjabi', 'Tamil', 'Telugu', 'Kannada'];

  const renderContent = (content: string) => {
    const htmlContent = content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
    return <div className="text-[14px] whitespace-pre-line leading-relaxed" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  }

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-6">
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
            <div className="p-4 md:p-8 bg-card rounded-lg border border-border">
                <div ref={reportRef} className="space-y-6 bg-background text-foreground p-6">
                    {/* Report Header for PDF */}
                    <div className="flex items-center justify-between">
                       <h1 className="text-[26px] font-headline font-bold text-primary">Zepmeds</h1>
                       <div className="text-right text-[12px] text-muted-foreground">
                            <p>{user.firstName} {user.lastName}</p>
                            <p>{user.email}</p>
                       </div>
                    </div>
                    <hr className="border-border my-4" />
                    
                    {/* Main Title */}
                    <div className="text-center my-6">
                        <h2 className="text-[17px] font-bold tracking-wider uppercase text-muted-foreground">Your Personalized Health Report</h2>
                        <p className="text-[14px] text-muted-foreground mt-1">Generated on {new Date().toLocaleDateString()}</p>
                    </div>

                    {/* Health Risk Analysis */}
                    <div className="p-4 rounded-lg bg-card border border-border">
                        <h3 className="font-bold flex items-center gap-2 text-[16px] mb-3">
                            <HeartPulse className="h-5 w-5 text-primary" /> Health Risk Analysis
                        </h3>
                        <p className="text-[14px] text-muted-foreground italic mb-4">{report.healthAnalysis.riskSummary}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {report.healthAnalysis.risks.map((risk, i) => (
                                <div key={i} className="p-3 rounded-md bg-background border">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-semibold text-[14px]">{risk.condition}</h4>
                                        <span className={cn("font-bold text-[14px]", getRiskColor(risk.level))}>{risk.level}</span>
                                    </div>
                                    <p className="text-[13px] text-muted-foreground mt-1">{risk.reason}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Other Sections */}
                    {sections.map(({ title, icon: Icon, color, content, isList }) => (
                         <div key={title} className="p-4 rounded-lg bg-card border border-border">
                            <h3 className={`font-bold flex items-center gap-2 text-[16px] mb-3 ${color}`}>
                                <Icon className="h-5 w-5" /> {title}
                            </h3>
                            {isList && Array.isArray(content) ? (
                                <ul className="list-disc pl-5 space-y-2 text-[14px]">
                                    {content.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            ) : (
                                renderContent(content as string)
                            )}
                        </div>
                    ))}

                    <div className="text-center pt-6 text-[10px] text-muted-foreground">
                        <p>Disclaimer: This report is generated by an AI and is for informational purposes only. It is not a substitute for professional medical advice. Always consult with a qualified healthcare provider for any health concerns.</p>
                        <p className="mt-2 font-headline">&copy; {new Date().getFullYear()} Zepmeds</p>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}

    