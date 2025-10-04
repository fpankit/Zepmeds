
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarDays,
  Bell,
  ChevronLeft,
  ChevronRight,
  Flame,
  Plus,
  Footprints,
  Droplets,
  Zap,
  Heart,
  Bike,
  Music,
  Waves,
  Dumbbell,
  Activity,
  Feather,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, getDay, isSameDay } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { healthMetrics, HealthMetric } from "@/lib/health-data";
import { EditMetricDialog } from "@/components/features/edit-metric-dialog";

const meals = [
    { 
        title: "Breakfast", 
        calories: "456-512 kcal",
        images: [
            { src: "https://firebasestorage.googleapis.com/v0/b/zepmeds-admin-panel.appspot.com/o/images%2Fstock%2Ffood-1.png?alt=media", hint: "healthy salad" },
            { src: "https://firebasestorage.googleapis.com/v0/b/zepmeds-admin-panel.appspot.com/o/images%2Fstock%2Ffood-2.png?alt=media", hint: "mixed fruits" },
        ]
    },
    { 
        title: "Lunch time", 
        calories: "456-512 kcal",
        images: [
            { src: "https://firebasestorage.googleapis.com/v0/b/zepmeds-admin-panel.appspot.com/o/images%2Fstock%2Ffood-3.png?alt=media", hint: "grilled chicken" },
            { src: "https://firebasestorage.googleapis.com/v0/b/zepmeds-admin-panel.appspot.com/o/images%2Fstock%2Ffood-4.png?alt=media", hint: "vegetable stir-fry" },
        ]
    },
    { 
        title: "Dinner", 
        calories: "300-450 kcal",
        images: [
            { src: "https://firebasestorage.googleapis.com/v0/b/zepmeds-admin-panel.appspot.com/o/images%2Fstock%2Ffood-5.png?alt=media", hint: "lentil soup" },
            { src: "https://firebasestorage.googleapis.com/v0/b/zepmeds-admin-panel.appspot.com/o/images%2Fstock%2Ffood-6.png?alt=media", hint: "quinoa salad" },
        ]
    }
];

const exerciseModes = [
    { name: "Cycling", icon: Bike },
    { name: "Walking", icon: Footprints },
    { name: "Zumba", icon: Music },
    { name: "Skating", icon: Activity },
    { name: "Swimming", icon: Waves },
    { name: "Hockey", icon: Activity },
    { name: "Cricket", icon: Activity },
    { name: "Badminton", icon: Feather },
    { name: "Gym", icon: Dumbbell },
];


export default function ActivityProgressPage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  
  const [editingMetric, setEditingMetric] = useState<HealthMetric | null>(null);

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday
    const end = endOfWeek(currentDate, { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const trackedDays = useMemo(() => {
    return weekDays.filter(day => getDay(day) <= getDay(new Date())).length;
  }, [weekDays]);

  const handleNextWeek = () => {
    setCurrentDate(prev => addDays(prev, 7));
  };

  const handlePrevWeek = () => {
    setCurrentDate(prev => addDays(prev, -7));
  };
  
  const handleGoogleFitSync = () => {
    router.push('/api/google-fit/auth');
  };

  const handleLogActivity = () => {
    if (!selectedExercise) {
      toast({
        variant: "destructive",
        title: "No Exercise Selected",
        description: "Please select an exercise mode to log.",
      });
      return;
    }
    toast({
      title: "Activity Logged!",
      description: `You've logged a ${selectedExercise} session. Keep it up!`,
    });
    setSelectedExercise(null);
  };
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if(params.get('success') === 'google_fit_synced') {
        toast({
            title: "Google Fit Synced!",
            description: "Your health data has been successfully imported.",
        });
        router.replace('/activity');
    } else if (params.get('error') === 'google_fit_failed') {
         toast({
            variant: "destructive",
            title: "Sync Failed",
            description: "Could not sync with Google Fit. Please try again.",
        });
        router.replace('/activity');
    }
  }, [router, toast]);
  
  const handleSaveMetric = async (metricId: string, newValue: string) => {
      if (!user) return;
      
      const newHealthData = {
          ...user.healthData,
          [metricId]: newValue,
      };

      await updateUser({ healthData: newHealthData });
      setEditingMetric(null); // Close the dialog
      toast({
        title: "Data Updated!",
        description: `Your ${editingMetric?.title} has been updated.`,
      });
  };


  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return "U";
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };
  
   const userHealthData = useMemo(() => {
    if (!user) return {};
    const data: { [key: string]: string } = {};
    healthMetrics.forEach(metric => {
      data[metric.id] = user.healthData?.[metric.id] || metric.defaultValue;
    });
    return data;
  }, [user]);

  return (
    <div className="bg-background font-sans">
      <main className="p-4 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.photoURL || undefined} alt={user?.firstName} />
              <AvatarFallback>
                {getInitials(user?.firstName, user?.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">Good morning!</p>
              <p className="font-bold text-lg">
                {user?.firstName || "Sajibur"} {user?.lastName || "Rahman"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-full">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-6 w-6" />
              <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500"></span>
            </Button>
          </div>
        </header>

        {/* Weekly Progress Card */}
        <Card className="bg-gradient-to-br from-green-300 via-green-400 to-emerald-400 p-5 rounded-2xl text-green-900 shadow-lg">
            <CardContent className="p-0 flex justify-between items-center">
                <div>
                    <p className="font-semibold text-sm">Daily intake</p>
                    <h3 className="font-bold text-xl mt-1">Your Weekly <br/> Progress</h3>
                </div>
                <div className="relative h-20 w-20">
                    <svg className="h-full w-full" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" stroke="#FFF" strokeWidth="8" fill="none" strokeOpacity="0.3" />
                        <circle 
                            cx="50" 
                            cy="50" 
                            r="45" 
                            stroke="#FFF" 
                            strokeWidth="8" 
                            fill="none" 
                            strokeDasharray="283" 
                            strokeDashoffset={283 - (283 * (trackedDays/7))} 
                            strokeLinecap="round" 
                            transform="rotate(-90 50 50)" 
                        />
                    </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-xl font-bold">{trackedDays}</p>
                        <p className="text-xs">days</p>
                    </div>
                </div>
            </CardContent>
        </Card>
        
        {/* Google Fit Sync */}
        <Button variant="outline" className="w-full" onClick={handleGoogleFitSync}>
            <Zap className="h-5 w-5 mr-2 text-yellow-500"/> Sync with Google Fit
        </Button>

         {/* Health Data Cards */}
         <div className="grid grid-cols-2 gap-4">
            {healthMetrics.map((metric) => (
                 <Card key={metric.id} className="p-4 rounded-2xl bg-card/80 cursor-pointer" onClick={() => setEditingMetric(metric)}>
                    <CardContent className="p-0">
                        <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm">{metric.title}</p>
                            <div className={cn("p-2 rounded-lg", metric.bg)}>
                                <metric.icon className={cn("h-5 w-5", metric.color)}/>
                            </div>
                        </div>
                        <p className="text-2xl font-bold mt-2">{userHealthData[metric.id]?.split(' ')[0] || ''} <span className="text-sm font-normal text-muted-foreground">{userHealthData[metric.id]?.split(' ').slice(1).join(' ')}</span></p>
                    </CardContent>
                </Card>
            ))}
        </div>
        
        {/* Exercise Logging */}
        <Card>
            <CardHeader>
                <CardTitle>Log Your Exercise</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-4">
                    {exerciseModes.map((mode) => (
                        <button key={mode.name} onClick={() => setSelectedExercise(mode.name)} className={cn(
                            "flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors",
                            selectedExercise === mode.name ? "border-primary bg-primary/10" : "border-transparent bg-muted/50 hover:bg-muted"
                        )}>
                            <mode.icon className={cn("h-7 w-7", selectedExercise === mode.name ? "text-primary" : "text-muted-foreground")} />
                            <p className="text-xs font-semibold">{mode.name}</p>
                        </button>
                    ))}
                </div>
                <Button className="w-full mt-6" onClick={handleLogActivity}>Log Activity</Button>
            </CardContent>
        </Card>

        {/* Date Picker */}
        <Card className="p-4 rounded-2xl bg-card/80">
            <CardContent className="p-0">
                <div className="flex justify-between items-center mb-4">
                    <p className="font-bold">{format(currentDate, 'MMMM yyyy')}</p>
                    <div className="flex gap-2">
                        <Button size="icon" variant="outline" className="h-8 w-8 rounded-full" onClick={handlePrevWeek}><ChevronLeft className="h-4 w-4"/></Button>
                        <Button size="icon" variant="outline" className="h-8 w-8 rounded-full" onClick={handleNextWeek}><ChevronRight className="h-4 w-4"/></Button>
                    </div>
                </div>
                <div className="flex justify-between">
                    {weekDays.map((day) => (
                        <div key={day.toString()} 
                            onClick={() => setSelectedDate(day)}
                            className={cn(
                                "flex flex-col items-center gap-2 p-2 rounded-lg cursor-pointer w-12 transition-colors",
                                isSameDay(day, selectedDate) ? "bg-green-400 text-white" : "hover:bg-accent"
                            )}>
                            <p className="text-xs text-muted-foreground">{format(day, 'E')[0]}</p>
                            <p className="font-bold text-lg">{format(day, 'dd')}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

        {/* Meal Cards */}
        <div className="space-y-4">
            {meals.map((meal) => (
                <Card key={meal.title} className="p-4 rounded-2xl bg-card/80">
                    <CardContent className="p-0">
                         <div className="flex justify-between items-center">
                            <div>
                                <p className="font-bold text-lg">{meal.title}</p>
                                <p className="text-sm text-orange-500 flex items-center gap-1"><Flame className="h-4 w-4"/> {meal.calories}</p>
                            </div>
                            <div className="flex items-center">
                                <div className="flex -space-x-4">
                                    {meal.images.map((img, i) => (
                                         <Image 
                                            key={i} 
                                            src={img.src} 
                                            alt={meal.title} 
                                            width={40} 
                                            height={40} 
                                            className="rounded-full border-2 border-background"
                                            data-ai-hint={img.hint}
                                        />
                                    ))}
                                </div>
                                <Button size="icon" variant="ghost" className="rounded-full bg-primary/20 text-primary ml-2"><Plus className="h-5 w-5"/></Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      </main>

       {editingMetric && (
        <EditMetricDialog
            isOpen={!!editingMetric}
            onClose={() => setEditingMetric(null)}
            metric={editingMetric}
            currentValue={userHealthData[editingMetric.id] || ''}
            onSave={handleSaveMetric}
        />
      )}
    </div>
  );
}
