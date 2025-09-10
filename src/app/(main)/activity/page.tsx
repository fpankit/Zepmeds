
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Bell, Edit, Footprints, GlassWater, Flame, Heart, Droplets as BloodDrop } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";


const healthMetrics = [
    { title: "Daily Steps", value: "7,642", icon: Footprints, color: "text-blue-400", bg: "bg-blue-900/50" },
    { title: "Water Intake", value: "6 glasses", icon: GlassWater, color: "text-cyan-400", bg: "bg-cyan-900/50" },
    { title: "Calories Burned", value: "420 cals", icon: Flame, color: "text-orange-400", bg: "bg-orange-900/50" },
    { title: "Blood Pressure", value: "120/80 mmHg", icon: Heart, color: "text-red-400", bg: "bg-red-900/50" },
    { title: "Blood Glucose", value: "95 mg/dL", icon: BloodDrop, color: "text-sky-400", bg: "bg-sky-900/50" },
    { title: "Heart Rate", value: "72 bpm", icon: Heart, color: "text-rose-400", bg: "bg-rose-900/50" },
];

export default function ActivityPage() {
    const router = useRouter();
    const { cart } = useCart();
    
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
        <h2 className="text-2xl font-bold tracking-tight">Log Health Metrics</h2>
        
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-muted-foreground">Today's Health</h3>
            <p className="text-sm text-muted-foreground">{currentDate}</p>
        </div>

        <div className="space-y-3">
            {healthMetrics.map((metric) => (
                 <Card key={metric.title} className="bg-card/80">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={cn("p-3 rounded-full", metric.bg)}>
                                <metric.icon className={cn("h-6 w-6", metric.color)} />
                            </div>
                            <div>
                                <p className="text-muted-foreground">{metric.title}</p>
                                <p className={cn("text-lg font-bold", metric.color)}>{metric.value}</p>
                            </div>
                        </div>
                         <Button variant="ghost" size="icon">
                            <Edit className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
      </main>
    </div>
  );
}
