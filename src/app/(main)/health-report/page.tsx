
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Download, FileBarChart, Loader2, Sparkles, Languages, Utensils, Dumbbell, ShieldCheck, ListChecks, ListX, HeartPulse } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { generateDietPlan, GenerateDietPlanOutput } from '@/ai/flows/generate-diet-plan';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import { Logo } from '@/components/icons/logo';


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
    } catch (error: any) {
      console.error('Failed to generate report:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: error.message || 'Could not generate the health report. The AI service may be busy. Please try again.',
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
    if (!report || !user) {
        toast({
            variant: "destructive",
            title: "Cannot Download",
            description: "Please generate a report first.",
        });
        return;
    }

    const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 40;
    let yPos = margin;

    const addPageAndHeader = () => {
        if (yPos > margin) { // only add page if it's not the first one
            pdf.addPage();
        }
        yPos = margin;
        // Dark background
        pdf.setFillColor(22, 28, 44); // dark blue-gray
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');

        // Header
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor('#FBBF24'); // Primary Yellow
        pdf.text("Zepmeds", margin, yPos);
        yPos += 30;

        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor('#FFFFFF'); // White
        pdf.text("Your Personalized Health Report", margin, yPos);
        yPos += 20;

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor('#E5E7EB'); // Light Gray
        pdf.text(`For: ${user.firstName} ${user.lastName}`, margin, yPos);
        yPos += 15;
        pdf.text(`Email: ${user.email}`, margin, yPos);
        yPos += 25;
    };

    const addPageIfNeeded = (neededHeight: number) => {
        if (yPos + neededHeight > pageHeight - margin) {
            addPageAndHeader();
        }
    };
    
    // --- Fonts and Colors ---
    const primaryColor = '#FBBF24'; // Primary Yellow
    const whiteColor = '#FFFFFF';
    const lightGrayColor = '#D1D5DB';
    const mutedColor = '#9CA3AF';
    const riskColors = {
        low: '#4ADE80', // Green
        moderate: '#FBBF24', // Yellow
        high: '#F87171', // Red
        'very high': '#DC2626' // Dark Red
    }

    addPageAndHeader(); // Start the first page

    // 2. Health Risk Analysis
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(primaryColor);
    pdf.text("Health Risk Analysis", margin, yPos);
    yPos += 20;
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(lightGrayColor);
    const summaryLines = pdf.splitTextToSize(report.healthAnalysis.riskSummary, pageWidth - (margin * 2));
    pdf.text(summaryLines, margin, yPos);
    yPos += (summaryLines.length * 10) + 10;
    

    report.healthAnalysis.risks.forEach((risk) => {
        const riskCardHeight = 40; // Approximate height
        addPageIfNeeded(riskCardHeight);

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(whiteColor);
        pdf.text(`${risk.condition}: `, margin, yPos);
        
        const conditionWidth = pdf.getStringUnitWidth(risk.condition) * 11;
        const riskLevelKey = risk.level.toLowerCase() as keyof typeof riskColors;
        pdf.setTextColor(riskColors[riskLevelKey] || whiteColor);
        pdf.text(risk.level, margin + conditionWidth + 5, yPos);
        pdf.setTextColor(whiteColor); // Reset color
        yPos += 15;
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(lightGrayColor);
        const reasonLines = pdf.splitTextToSize(risk.reason, pageWidth - (margin * 2));
        pdf.text(reasonLines, margin, yPos);
        yPos += (reasonLines.length * 10) + 10;
    });

    const addListSection = (title: string, items: string[]) => {
        addPageIfNeeded(items.length * 15 + 40);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(primaryColor);
        pdf.text(title, margin, yPos);
        yPos += 20;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(lightGrayColor);
        items.forEach(item => {
            const itemLines = pdf.splitTextToSize(`• ${item}`, pageWidth - (margin * 2) - 10);
             addPageIfNeeded(itemLines.length * 12 + 5);
            pdf.text(itemLines, margin + 5, yPos);
            yPos += (itemLines.length * 10);
        });
        yPos += 15;
    };
    
    // Diet Plan
    addPageIfNeeded(120);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(primaryColor);
    pdf.text("Diet Plan", margin, yPos);
    yPos += 20;
    
    const addDietSection = (title: string, content: string) => {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(whiteColor);
        pdf.text(title, margin, yPos);
        yPos += 15;
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(lightGrayColor);
        let dietLines = pdf.splitTextToSize(content, pageWidth - (margin * 2));
        addPageIfNeeded(dietLines.length * 12 + 10);
        pdf.text(dietLines, margin, yPos);
        yPos += (dietLines.length * 10) + 10;
    }

    addDietSection("Morning:", report.dietPlan.morning);
    addDietSection("Lunch:", report.dietPlan.lunch);
    addDietSection("Dinner:", report.dietPlan.dinner);


    // Other Sections
    addListSection("Exercise Tips", report.exerciseTips);
    addListSection("Home Remedies", report.homeRemedies);
    addListSection("Do's", report.doAndDont.dos);
    addListSection("Don'ts", report.doAndDont.donts);


    // Add Disclaimer Footer to all pages
    const pageCount = pdf.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(mutedColor);
        const disclaimer = 'Disclaimer: This report is generated by an AI and is for informational purposes only. It is not a substitute for professional medical advice.';
        const disclaimerLines = pdf.splitTextToSize(disclaimer, pageWidth - (margin * 2));
        pdf.text(disclaimerLines, margin, pageHeight - 25);
    }

    pdf.save(`Zepmeds_Health_Report_${user.firstName}.pdf`);
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
    <>
    <style jsx global>{`
        @media print {
            body * {
                visibility: hidden;
            }
            #print-area, #print-area * {
                visibility: visible;
            }
            #print-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
            }
        }
    `}</style>
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-6 print:space-y-0">
       <Card className="bg-primary/10 border-primary/20 print:hidden">
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

        <div className="flex flex-col sm:flex-row gap-2 print:hidden">
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
             <Card className="text-center p-10 border-dashed print:hidden">
                <Bot className="mx-auto h-16 w-16 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold">Your report will appear here</h3>
                <p className="mt-2 text-muted-foreground">Click the button above to generate your personalized health plan.</p>
            </Card>
        )}

        {report && user && (
            <div id="print-area" ref={reportRef} className="bg-background rounded-lg print:p-8">
                <div className="space-y-4 print:space-y-6">
                    <div className="p-4 rounded-lg bg-card border border-border mb-4 break-inside-avoid print:p-0 print:border-none">
                        {/* Report Header */}
                         <div className="flex items-center gap-4 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50" className="h-8 w-auto">
                              <path d="M10 25 C 15 10, 25 10, 30 25 S 40 40, 45 25" stroke="hsl(var(--primary))" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"></path>
                              <text x="55" y="35" fontFamily="Space Grotesk, sans-serif" fontSize="32" fontWeight="bold" fill="hsl(var(--foreground))">Zepmeds</text>
                            </svg>
                        </div>
                        <div className="mb-4">
                            <h2 className="text-2xl font-bold">{`${user.firstName} ${user.lastName}`}</h2>
                            <p className="text-muted-foreground">{user.email}</p>
                        </div>
                        <h1 className="text-xl font-bold mb-6">Your Personalized Health Report</h1>
                         <hr className="mb-6"/>

                        <h3 className="font-bold flex items-center gap-2 text-lg mb-3 print:text-base">
                            <HeartPulse className="h-5 w-5 text-primary" /> Health Risk Analysis
                        </h3>
                        <p className="text-sm text-muted-foreground italic mb-4 print:text-xs">{report.healthAnalysis.riskSummary}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:grid-cols-2">
                            {report.healthAnalysis.risks.map((risk, i) => (
                                <div key={i} data-risk-card className="p-3 rounded-md bg-background border break-inside-avoid print:p-0 print:border-none">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-semibold text-md print:text-sm">{risk.condition}</h4>
                                        <span className={cn("font-bold text-md print:text-sm", getRiskColor(risk.level))}>{risk.level}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1 print:text-xs">{risk.reason}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {sections.map(({ id, title, icon: Icon, color, content, isList }) => (
                         <div data-report-section id={`pdf-${id}`} key={id} className="p-4 rounded-lg bg-card border border-border mb-4 break-inside-avoid print:p-0 print:border-none">
                            <h3 className={cn("font-bold flex items-center gap-2 text-lg mb-3 print:text-base", color)}>
                                <Icon className="h-5 w-5" /> {title}
                            </h3>
                            {isList && Array.isArray(content) ? (
                                <ul className="list-disc pl-5 space-y-2 text-sm print:text-xs">
                                    {content.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            ) : (
                                renderContent(content as string)
                            )}
                        </div>
                    ))}
                    
                    <div data-report-section id="pdf-charts" className="p-4 rounded-lg bg-card border border-border mb-4 break-inside-avoid print:p-0 print:border-none">
                        <h3 className="font-bold flex items-center gap-2 text-lg mb-3 print:text-base">
                            <FileBarChart className="h-5 w-5 text-primary" /> Health Charts
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 print:grid-cols-2">
                           <div>
                               <h4 className="text-center font-semibold text-sm mb-2 print:text-xs">Daily Activity</h4>
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
                               <h4 className="text-center font-semibold text-sm mb-2 print:text-xs">Risk Distribution</h4>
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
                     <div className="text-xs text-muted-foreground text-center pt-4 border-t border-dashed mt-4 break-before-page">
                        Disclaimer: This report is generated by an AI and is for informational purposes only. It is not a substitute for professional medical advice.
                    </div>
                </div>
            </div>
        )}
    </div>
    </>
  );
}

    