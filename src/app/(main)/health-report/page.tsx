
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
        const canvas = await html2canvas(reportElement, { scale: 2, backgroundColor: '#0c0a09' }); // Using a dark background color
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        
        let imgHeight = pdfWidth / ratio;
        let heightLeft = imgHeight;

        let position = 10; // Add top margin
        const pageMargin = 10;
        
        pdf.addImage(imgData, 'PNG', pageMargin, position, pdfWidth - (pageMargin * 2), imgHeight);
        heightLeft -= (pdf.internal.pageSize.getHeight() - (position + pageMargin));

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', pageMargin, position, pdfWidth - (pageMargin * 2), imgHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
        }

        pdf.save(`Zepmeds_Health_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
        console.error("Failed to download PDF:", error);
        toast({ variant: 'destructive', title: "Download Failed", description: "Could not create the PDF file."});
    }
  };
  
  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
        case 'high': return 'text-red-400';
        case 'moderate': return 'text-yellow-400';
        case 'low': return 'text-green-400';
        default: return 'text-muted-foreground';
    }
  }

  const sections: Section[] = report ? [
    { title: 'Diet Plan', icon: Utensils, color: 'text-green-400', content: `**Morning:** ${report.dietPlan.morning}\n\n**Lunch:** ${report.dietPlan.lunch}\n\n**Dinner:** ${report.dietPlan.dinner}` },
    { title: 'Exercise Tips', icon: Dumbbell, color: 'text-orange-400', content: report.exerciseTips, isList: true },
    { title: 'Home Remedies', icon: ShieldCheck, color: 'text-blue-400', content: report.homeRemedies, isList: true },
    { title: "Do's", icon: ListChecks, color: 'text-sky-400', content: report.doAndDont.dos, isList: true },
    { title: "Don'ts", icon: ListX, color: 'text-red-400', content: report.doAndDont.donts, isList: true },
  ] : [];

  const languageOptions = ['English', 'Hindi', 'Punjabi', 'Tamil', 'Telugu', 'Kannada'];

  // Helper function to render content with bold tags
  const renderContent = (content: string) => {
    const htmlContent = content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
    return <p className="whitespace-pre-line" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
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
                <div ref={reportRef} className="space-y-8 bg-card text-card-foreground p-2">
                    {/* Report Header */}
                    <div className="space-y-4">
                       <Logo className="h-6" />
                       <div className="text-sm text-muted-foreground">
                            <p><strong className="font-semibold text-foreground">Name:</strong> {user.firstName} {user.lastName}</p>
                            <p><strong className="font-semibold text-foreground">Age:</strong> {user.age}</p>
                            <p><strong className="font-semibold text-foreground">Email:</strong> {user.email}</p>
                       </div>
                    </div>
                    
                    {/* Main Title */}
                    <div className="text-center my-8">
                        <h1 className="text-3xl md:text-4xl font-bold">Your Personalized Health Report</h1>
                        <p className="text-muted-foreground mt-2">Generated on {new Date().toLocaleDateString()}</p>
                    </div>

                    {/* Health Risk Analysis */}
                    <Card className="bg-background/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl text-primary">
                                <HeartPulse className="h-6 w-6" /> Health Risk Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground italic">{report.healthAnalysis.riskSummary}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {report.healthAnalysis.risks.map((risk, i) => (
                                    <div key={i} className="p-4 rounded-lg bg-card border">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-semibold">{risk.condition}</h4>
                                            <span className={cn("font-bold", getRiskColor(risk.level))}>{risk.level}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">{risk.reason}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Other Sections */}
                    {sections.map(({ title, icon: Icon, color, content, isList }) => (
                         <Card key={title} className="bg-background/50">
                            <CardHeader>
                                <CardTitle className={`flex items-center gap-2 text-xl ${color}`}>
                                    <Icon className="h-6 w-6" /> {title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isList && Array.isArray(content) ? (
                                    <ul className="list-disc pl-5 space-y-2">
                                        {content.map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                ) : (
                                    renderContent(content as string)
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
}
