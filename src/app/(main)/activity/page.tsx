
"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarDays,
  Bell,
  ChevronLeft,
  ChevronRight,
  Flame,
  Plus,
  Footprints,
  Droplets,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import Image from "next/image";
import { cn } from "@/lib/utils";

const weekDays = ["S", "M", "T", "W", "T", "F", "S"];
const dates = ["07", "08", "09", "10", "11", "12", "13"];

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
]

export default function ActivityProgressPage() {
  const { user } = useAuth();
  const [activeDate, setActiveDate] = useState(3); // 'W' is active

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return "U";
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

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
                            strokeDashoffset={283 - (283 * (6/7))} 
                            strokeLinecap="round" 
                            transform="rotate(-90 50 50)" 
                        />
                    </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-xl font-bold">6</p>
                        <p className="text-xs">days</p>
                    </div>
                </div>
            </CardContent>
        </Card>

         {/* Steps and Water Cards */}
         <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 rounded-2xl bg-card/80">
                <CardContent className="p-0">
                    <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm">Step to walk</p>
                        <div className="p-2 bg-orange-100 rounded-lg dark:bg-orange-900/50">
                            <Footprints className="h-5 w-5 text-orange-500"/>
                        </div>
                    </div>
                    <p className="text-2xl font-bold mt-2">5,500 <span className="text-sm font-normal text-muted-foreground">steps</span></p>
                </CardContent>
            </Card>
            <Card className="p-4 rounded-2xl bg-card/80">
                <CardContent className="p-0">
                     <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm">Drink Water</p>
                         <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/50">
                            <Droplets className="h-5 w-5 text-blue-500"/>
                        </div>
                    </div>
                    <p className="text-2xl font-bold mt-2">12 <span className="text-sm font-normal text-muted-foreground">glass</span></p>
                </CardContent>
            </Card>
        </div>

        {/* Date Picker */}
        <Card className="p-4 rounded-2xl bg-card/80">
            <CardContent className="p-0">
                <div className="flex justify-between items-center mb-4">
                    <p className="font-bold">August 2025</p>
                    <div className="flex gap-2">
                        <Button size="icon" variant="outline" className="h-8 w-8 rounded-full"><ChevronLeft className="h-4 w-4"/></Button>
                        <Button size="icon" variant="outline" className="h-8 w-8 rounded-full"><ChevronRight className="h-4 w-4"/></Button>
                    </div>
                </div>
                <div className="flex justify-between">
                    {weekDays.map((day, index) => (
                        <div key={index} 
                            onClick={() => setActiveDate(index)}
                            className={cn(
                                "flex flex-col items-center gap-2 p-2 rounded-lg cursor-pointer w-12",
                                activeDate === index ? "bg-green-400 text-white" : ""
                            )}>
                            <p className="text-xs text-muted-foreground">{day}</p>
                            <p className="font-bold text-lg">{dates[index]}</p>
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
    </div>
  );
}
