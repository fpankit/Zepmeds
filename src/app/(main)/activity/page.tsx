
"use client"

import { useState } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ArrowLeft, Bell, Footprints, Heart, Droplets, Flame, GlassWater, Beef } from "lucide-react"
import Image from "next/image"

const chartData = [
  { day: "Mon", steps: 4800 },
  { day: "Tue", antd: 3200 },
  { day: "Wed", steps: 3800 },
  { day: "Thu", steps: 5800 },
  { day: "Fri", steps: 4600 },
  { day: "Sat", steps: 3000 },
  { day: "Sun", steps: 4900 },
]

const healthMetrics = [
    { label: "Steps", value: "53,425", icon: Footprints, unit: "" },
    { label: "Total Calories", value: "12,850", icon: Flame, unit: "kcal" },
    { label: "Water Intake", value: "14.5", icon: GlassWater, unit: "L" },
]

const metricFilters = [
    { label: "Steps", icon: Footprints },
    { label: "Heart Rate", icon: Heart },
    { label: "Blood Sugar", icon: Droplets },
    { label: "Calories", icon: Flame },
    { label: "Water", icon: GlassWater },
    { label: "Diet", icon: Beef },
]

const logMetrics = [
  { label: "Steps", icon: Footprints },
  { label: "Heart Rate", icon: Heart },
  { label: "Blood Sugar", icon: Droplets },
];

export default function ActivityPage() {
  const [activeTab, setActiveTab] = useState("Week")
  const [activeMetric, setActiveMetric] = useState("Steps")
  const [activeLogMetric, setActiveLogMetric] = useState("Steps");

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background border-b">
        <Button variant="ghost" size="icon">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Activity</h1>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
                <Bell className="h-6 w-6" />
            </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        <Card className="bg-card/80">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Health Statistics</CardTitle>
                <div className="flex items-center gap-1 p-1 rounded-lg bg-muted self-start sm:self-auto">
                    {["Day", "Week", "Month"].map(tab => (
                        <Button 
                            key={tab}
                            size="sm"
                            variant={activeTab === tab ? "default" : "ghost"}
                            className={cn("px-4 rounded-md", activeTab === tab && "bg-primary text-primary-foreground")}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </Button>
                    ))}
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {metricFilters.map(metric => (
                    <Button 
                        key={metric.label}
                        variant={activeMetric === metric.label ? "secondary" : "outline"}
                        className={cn("rounded-full", activeMetric === metric.label && "bg-primary/20 border-primary text-primary")}
                        onClick={() => setActiveMetric(metric.label)}
                    >
                       {metric.label}
                    </Button>
                ))}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {healthMetrics.map(metric => (
                    <Card key={metric.label} className="p-4 bg-muted/50 text-center">
                        <p className="text-sm text-muted-foreground">{metric.label}</p>
                        <p className="text-2xl font-bold">{metric.value}</p>
                        <p className="text-sm text-muted-foreground">{metric.unit}</p>
                    </Card>
                ))}
            </div>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" vertical={false} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <Bar dataKey="steps" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Log Health Metrics</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-around items-center pt-6">
               {logMetrics.map((metric) => (
                  <button
                    key={metric.label}
                    className="flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => setActiveLogMetric(metric.label)}
                  >
                    <metric.icon className={cn("h-10 w-10 transition-colors", activeLogMetric === metric.label ? 'text-primary' : 'text-muted-foreground')} />
                    <span className={cn("text-sm font-semibold transition-colors", activeLogMetric === metric.label ? 'text-primary' : 'text-muted-foreground')}>{metric.label}</span>
                  </button>
                ))}
            </CardContent>
        </Card>
        
        <Card className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gradient-to-r from-green-500 to-teal-500 gap-4">
            <div className="flex items-center gap-3">
                <Image src="/google-fit.svg" alt="Google Fit" width={32} height={32} />
                <div className="text-white">
                    <h3 className="font-bold">Sync with Google Fit</h3>
                    <p className="text-xs">Keep your health data updated.</p>
                </div>
            </div>
            <Button variant="secondary" className="w-full sm:w-auto">Sync Now</Button>
        </Card>

      </main>
    </div>
  )
}
