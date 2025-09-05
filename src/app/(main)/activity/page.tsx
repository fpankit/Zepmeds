
"use client"
import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks, Flame, Droplet, Footprints, HeartPulse } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { day: "Mon", steps: 8000, water: 6, bp: 120, sugar: 90 },
  { day: "Tue", steps: 10000, water: 8, bp: 118, sugar: 95 },
  { day: "Wed", steps: 7500, water: 7, bp: 122, sugar: 88 },
  { day: "Thu", steps: 12000, water: 9, bp: 115, sugar: 92 },
  { day: "Fri", steps: 9000, water: 8, bp: 120, sugar: 98 },
  { day: "Sat", steps: 15000, water: 10, bp: 117, sugar: 93 },
  { day: "Sun", steps: 6000, water: 5, bp: 125, sugar: 102 },
];

const chartConfig = {
  steps: {
    label: "Steps",
    color: "hsl(var(--chart-1))",
  },
  water: {
    label: "Water (glasses)",
    color: "hsl(var(--chart-2))",
  },
  bp: {
    label: "Blood Pressure (Systolic)",
    color: "hsl(var(--chart-3))",
  },
   sugar: {
    label: "Blood Sugar (mg/dL)",
    color: "hsl(var(--chart-4))",
  },
};


export default function ActivityPage() {
  const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("steps");

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-6 w-6" />
            Your Health Activity
          </CardTitle>
          <CardDescription>
            A summary of your weekly health stats. Click on a metric to see the chart.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className={`p-4 cursor-pointer transition-all ${activeChart === 'steps' ? 'ring-2 ring-primary' : ''}`} onClick={() => setActiveChart('steps')}>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Footprints className="text-blue-500"/> Steps
              </CardTitle>
              <p className="text-2xl font-bold">72,500</p>
              <p className="text-sm text-muted-foreground">This week</p>
            </Card>
             <Card className={`p-4 cursor-pointer transition-all ${activeChart === 'water' ? 'ring-2 ring-primary' : ''}`} onClick={() => setActiveChart('water')}>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Droplet className="text-sky-400"/> Water Intake
              </CardTitle>
              <p className="text-2xl font-bold">43</p>
              <p className="text-sm text-muted-foreground">Glasses this week</p>
            </Card>
             <Card className={`p-4 cursor-pointer transition-all ${activeChart === 'bp' ? 'ring-2 ring-primary' : ''}`} onClick={() => setActiveChart('bp')}>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HeartPulse className="text-red-500"/> Blood Pressure
              </CardTitle>
              <p className="text-2xl font-bold">120/80</p>
              <p className="text-sm text-muted-foreground">Latest reading</p>
            </Card>
             <Card className={`p-4 cursor-pointer transition-all ${activeChart === 'sugar' ? 'ring-2 ring-primary' : ''}`} onClick={() => setActiveChart('sugar')}>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Flame className="text-orange-400"/> Blood Sugar
              </CardTitle>
              <p className="text-2xl font-bold">94 mg/dL</p>
              <p className="text-sm text-muted-foreground">Latest reading</p>
            </Card>
          </div>
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
               <YAxis
                dataKey={activeChart}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
