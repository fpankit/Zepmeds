
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

 const handleDownload = () => {
    if (!report || !user) {
        toast({ variant: "destructive", title: "Cannot Download", description: "Please generate a report first." });
        return;
    }
    
    toast({ title: "Preparing Download...", description: "Please wait while we generate your PDF." });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let yPos = margin;

    // --- Helper function for page breaks ---
    const checkPageBreak = (requiredHeight: number) => {
        if (yPos + requiredHeight > pageHeight - margin) {
            pdf.addPage();
            yPos = margin;
        }
    };
    
    // --- Fonts and Colors ---
    const primaryColor = '#FACC15'; // Approximation of primary color
    pdf.addFont('/fonts/Inter-Regular.ttf', 'Inter', 'normal');
    pdf.addFont('/fonts/Inter-Bold.ttf', 'Inter', 'bold');
    pdf.addFont('/fonts/SpaceGrotesk-Bold.ttf', 'SpaceGrotesk', 'bold');

    const textColor = '#333333';
    const mutedColor = '#666666';

    const addWrappedText = (text: string | string[], options: any, isList: boolean = false) => {
        const textArray = Array.isArray(text) ? text : [text];
        const lines = pdf.splitTextToSize(textArray.join('\n'), contentWidth - (options.x || margin));
        const textHeight = (pdf.getLineHeight() / pdf.getPointScale_()) * lines.length;
        
        checkPageBreak(textHeight + 5);

        if (isList) {
             const listLines = text.join('\n').split('\n');
             listLines.forEach(line => {
                const singleLineHeight = (pdf.getLineHeight() / pdf.getPointScale_()) * pdf.splitTextToSize(line, contentWidth - 5).length;
                checkPageBreak(singleLineHeight + 2);
                pdf.text(`• ${line}`, options.x || margin + 5, yPos);
                yPos += singleLineHeight + 2;
             });
        } else {
            pdf.text(lines, options.x || margin, yPos);
            yPos += textHeight + (options.lineSpacing || 0);
        }
    };

    // --- PDF Content Generation ---
    // Page 1: Header and User Info
    pdf.setFont('SpaceGrotesk', 'bold');
    pdf.setFontSize(32);
    pdf.setTextColor(primaryColor);
    addWrappedText("Zepmeds", { lineSpacing: 15 });
    
    pdf.setFont('Inter', 'bold');
    pdf.setFontSize(24);
    pdf.setTextColor(textColor);
    addWrappedText(`${user.firstName} ${user.lastName}`, { lineSpacing: 2 });

    pdf.setFont('Inter', 'normal');
    pdf.setFontSize(14);
    pdf.setTextColor(mutedColor);
    addWrappedText(user.email, { lineSpacing: 2 });
    yPos += 5;
    
    pdf.setDrawColor(mutedColor);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;
    
    pdf.setFont('Inter', 'bold');
    pdf.setFontSize(17);
    pdf.setTextColor(textColor);
    addWrappedText("Your Personalized Health Report", { lineSpacing: 4 });
    
    pdf.setFont('Inter', 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor(mutedColor);
    addWrappedText(`Generated on ${new Date().toLocaleDateString()}`, { lineSpacing: 10 });
    pdf.setTextColor(textColor);


    // Health Risk Analysis
    pdf.setFontSize(14);
    pdf.setFont('Inter', 'bold');
    pdf.setTextColor(primaryColor);
    addWrappedText("Health Risk Analysis", { lineSpacing: 5 });

    pdf.setFont('Inter', 'normal');
    pdf.setFontSize(11);
    addWrappedText(report.healthAnalysis.riskSummary, { lineSpacing: 8 });

    report.healthAnalysis.risks.forEach((risk) => {
        const riskText = `${risk.condition} (${risk.level}): ${risk.reason}`;
        const riskLines = pdf.splitTextToSize(riskText, contentWidth - 5);
        const riskHeight = (pdf.getLineHeight() / pdf.getPointScale_()) * riskLines.length + 4;
        checkPageBreak(riskHeight);

        pdf.setFont('Inter', 'bold');
        pdf.text(`• ${risk.condition} (${risk.level})`, margin, yPos);
        yPos += 5;

        pdf.setFont('Inter', 'normal');
        const reasonLines = pdf.splitTextToSize(risk.reason, contentWidth - 5);
        pdf.text(reasonLines, margin + 5, yPos);
        yPos += (pdf.getLineHeight() / pdf.getPointScale_()) * reasonLines.length + 4;
    });

    // Other Sections
    pdf.addPage();
    yPos = margin;

    const reportSections = [
        { title: 'Diet Plan', content: `**Morning:** ${report.dietPlan.morning}\n\n**Lunch:** ${report.dietPlan.lunch}\n\n**Dinner:** ${report.dietPlan.dinner}` },
        { title: 'Exercise Tips', content: report.exerciseTips, isList: true },
        { title: 'Home Remedies', content: report.homeRemedies, isList: true },
        { title: "Do's", content: report.doAndDont.dos, isList: true },
        { title: "Don'ts", content: report.doAndDont.donts, isList: true },
    ];
    
    reportSections.forEach(section => {
        const titleHeight = 10;
        checkPageBreak(titleHeight);

        pdf.setFont('Inter', 'bold');
        pdf.setFontSize(14);
        pdf.setTextColor(primaryColor);
        addWrappedText(section.title, { lineSpacing: 5 });
        
        pdf.setFont('Inter', 'normal');
        pdf.setFontSize(11);
        pdf.setTextColor(textColor);

        if (section.isList && Array.isArray(section.content)) {
            addWrappedText(section.content, {}, true);
        } else {
            const formattedContent = (section.content as string).replace(/\*\*/g, ""); // Remove markdown
            addWrappedText(formattedContent, { lineSpacing: 4 });
        }
        yPos += 10; // Spacing between sections
    });

    // --- Footer ---
    const pageCount = pdf.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        const footerText = "Disclaimer: This report is generated by an AI and is for informational purposes only. It is not a substitute for professional medical advice.";
        pdf.setFontSize(8);
        pdf.setTextColor(mutedColor);
        pdf.text(footerText, margin, pageHeight - 10, { align: 'center', maxWidth: contentWidth });
    }

    pdf.save(`Zepmeds_Health_Report_${new Date().toISOString().split('T')[0]}.pdf`);
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
    return <div className="text-sm whitespace-pre-line leading-relaxed" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
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
            <div ref={reportRef} className="bg-background rounded-lg p-4">
                <div id="pdf-content-wrapper" className="space-y-4">
                    <div className="p-4 rounded-lg bg-card border border-border mb-4 break-inside-avoid">
                        <h3 className="font-bold flex items-center gap-2 text-lg mb-3">
                            <HeartPulse className="h-5 w-5 text-primary" /> Health Risk Analysis
                        </h3>
                        <p className="text-sm text-muted-foreground italic mb-4">{report.healthAnalysis.riskSummary}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {report.healthAnalysis.risks.map((risk, i) => (
                                <div key={i} data-risk-card className="p-3 rounded-md bg-background border break-inside-avoid">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-semibold text-md">{risk.condition}</h4>
                                        <span className={cn("font-bold text-md", getRiskColor(risk.level))}>{risk.level}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">{risk.reason}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {sections.map(({ id, title, icon: Icon, color, content, isList }) => (
                         <div data-report-section id={`pdf-${id}`} key={id} className="p-4 rounded-lg bg-card border border-border mb-4 break-inside-avoid">
                            <h3 className={cn("font-bold flex items-center gap-2 text-lg mb-3", color)}>
                                <Icon className="h-5 w-5" /> {title}
                            </h3>
                            {isList && Array.isArray(content) ? (
                                <ul className="list-disc pl-5 space-y-2 text-sm">
                                    {content.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            ) : (
                                renderContent(content as string)
                            )}
                        </div>
                    ))}
                    
                    <div data-report-section id="pdf-charts" className="p-4 rounded-lg bg-card border border-border mb-4 break-inside-avoid">
                        <h3 className="font-bold flex items-center gap-2 text-lg mb-3">
                            <FileBarChart className="h-5 w-5 text-primary" /> Health Charts
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                           <div>
                               <h4 className="text-center font-semibold text-sm mb-2">Daily Activity</h4>
                               <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={chartData}>
                                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                                        <Tooltip wrapperClassName="!bg-background !border-border" cursor={{fill: 'hsla(var(--muted))'}}/>
                                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                               </ResponsiveContainer>
                            </div>
                            <div>
                               <h4 className="text-center font-semibold text-sm mb-2">Risk Distribution</h4>
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
                </div>
            </div>
        )}
    </div>
  );
}


    