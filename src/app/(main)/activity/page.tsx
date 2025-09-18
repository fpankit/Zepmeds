
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Bell, Edit, BarChart, GitMerge, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useState, useEffect, useCallback, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/auth-context";
import { healthMetrics, HealthMetric } from "@/lib/health-data";
import { EditMetricDialog } from "@/components/features/edit-metric-dialog";
import { useToast } from "@/hooks/use-toast";


const weeklyStepsData = [
  { day: 'Mon', steps: 7500 },
  { day: 'Tue', steps: 8200 },
  { day: 'Wed', steps: 6800 },
  { day: 'Thu', steps: 9500 },
  { day: 'Fri', steps: 7100 },
  { day: 'Sat', steps: 10500 },
  { day: 'Sun', steps: 6200 },
];

// We wrap the component that uses `useSearchParams` in a Suspense boundary
function ActivityPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { cart } = useCart();
    const { user, updateUser } = useAuth();
    const { toast } = useToast();
    
    const [editingMetric, setEditingMetric] = useState<HealthMetric | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSaveMetric = async (metricId: string, newValue: string) => {
        if (user) {
            const newHealthData = {
                ...user.healthData,
                [metricId]: newValue,
            };
            await updateUser({ healthData: newHealthData });
        }
        setEditingMetric(null);
        toast({ title: 'Metric Updated', description: `Your ${editingMetric?.title} has been saved.` });
    };

    const handleGoogleFitSync = () => {
        // **THE FIX**: Using an absolute path forces a full browser redirect,
        // bypassing Next.js App Router's fetch interception which causes the issue.
        window.location.href = '/api/google-fit/auth';
    }

    const fetchGoogleFitData = useCallback(async () => {
        // A real app would get the access token securely. For this demo, we can't.
        // This function simulates fetching and updating data.
        setIsSyncing(true);
        toast({ title: "Syncing with Google Fit..." });
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simulate receiving new data from Google Fit
        const googleFitData = {
            dailySteps: `${Math.floor(Math.random() * 5000) + 5000}`,
            heartRate: `${Math.floor(Math.random() * 20) + 65} bpm`,
            caloriesBurned: `${Math.floor(Math.random() * 500) + 300} cals`,
            bloodPressure: `12${Math.floor(Math.random() * 3)}/8${Math.floor(Math.random() * 2)} mmHg`,
        };

        if (user) {
            const newHealthData = {
                ...user.healthData,
                ...googleFitData
            };
            await updateUser({ healthData: newHealthData });
        }

        toast({ title: "Sync Complete!", description: "Your health data has been updated." });
        setIsSyncing(false);
        // Clean the URL by replacing it, which won't trigger a full navigation.
        router.replace('/activity', { scroll: false });
    }, [user, updateUser, toast, router]);


    useEffect(() => {
        const syncSuccess = searchParams.get('success');
        const syncError = searchParams.get('error');

        if(syncSuccess === 'google_fit_synced') {
            fetchGoogleFitData();
        }
        if (syncError) {
             toast({
                variant: 'destructive',
                title: 'Google Fit Sync Failed',
                description: 'Could not connect to your Google Fit account. Please try again.',
            });
            // Clean the URL
            router.replace('/activity', { scroll: false });
        }
    }, [searchParams, fetchGoogleFitData, toast, router]);

    // Get current date in MM/DD/YYYY format
    const currentDate = new Date().toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
    });

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background border-b border-border/80">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Activity</h1>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
                <Bell className="h-6 w-6" />
            </Button>
            <Link href="/cart" className="relative">
                 <Button variant="ghost" size="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.16"/></svg>
                </Button>
                {cart.length > 0 && (
                     <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">{cart.length}</Badge>
                 )}
            </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6">

        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-6 w-6" />
                    Health Statistics
                </CardTitle>
                <Button onClick={handleGoogleFitSync} disabled={isSyncing}>
                    {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GitMerge className="mr-2 h-4 w-4" />}
                    {isSyncing ? 'Syncing...' : 'Sync with Google Fit'}
                </Button>
            </CardHeader>
            <CardContent>
                 <Tabs defaultValue="week" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="day">Day</TabsTrigger>
                        <TabsTrigger value="week">Week</TabsTrigger>
                        <TabsTrigger value="month">Month</TabsTrigger>
                    </TabsList>
                    <TabsContent value="week">
                         <div className="h-[200px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsBarChart data={weeklyStepsData}>
                                <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        borderColor: 'hsl(var(--border))',
                                    }}
                                />
                                <Bar dataKey="steps" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </div>
                         <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                            <Card className="p-3 bg-card/50">
                                <p className="text-sm text-muted-foreground">Total Steps</p>
                                <p className="text-lg font-bold">55.8k</p>
                            </Card>
                             <Card className="p-3 bg-card/50">
                                <p className="text-sm text-muted-foreground">Calories</p>
                                <p className="text-lg font-bold">2.1k</p>
                            </Card>
                             <Card className="p-3 bg-card/50">
                                <p className="text-sm text-muted-foreground">Water</p>
                                <p className="text-lg font-bold">42L</p>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
        
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-muted-foreground">Today's Health</h3>
            <p className="text-sm text-muted-foreground">{currentDate}</p>
        </div>

        <div className="space-y-3">
            {healthMetrics.map((metric) => {
                const userValue = user?.healthData?.[metric.id];
                const displayValue = userValue || metric.defaultValue;
                return (
                    <Card key={metric.id} className="bg-card/80">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={cn("p-3 rounded-full", metric.bg)}>
                                    <metric.icon className={cn("h-6 w-6", metric.color)} />
                                </div>
                                <div>
                                    <p className="text-muted-foreground">{metric.title}</p>
                                    <p className={cn("text-lg font-bold", metric.color)}>{displayValue}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setEditingMetric(metric)}>
                                <Edit className="h-5 w-5 text-muted-foreground" />
                            </Button>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
      </main>
      
      {editingMetric && (
        <EditMetricDialog
            isOpen={!!editingMetric}
            onClose={() => setEditingMetric(null)}
            metric={editingMetric}
            currentValue={user?.healthData?.[editingMetric.id] || editingMetric.defaultValue}
            onSave={handleSaveMetric}
        />
      )}
    </div>
  );
}

export default function ActivityPage() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <ActivityPageContent />
        </Suspense>
    )
}

    