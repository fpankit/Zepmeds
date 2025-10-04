
import { Footprints, GlassWater, Flame, Heart, Droplets as BloodDrop } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface HealthMetric {
    id: string;
    title: string;
    defaultValue: string;
    icon: LucideIcon;
    color: string;
    bg: string;
}

export const healthMetrics: HealthMetric[] = [
    { id: "dailySteps", title: "Daily Steps", defaultValue: "7,642 steps", icon: Footprints, color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/50" },
    { id: "waterIntake", title: "Water Intake", defaultValue: "8 glasses", icon: GlassWater, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/50" },
    { id: "caloriesBurned", title: "Calories Burned", defaultValue: "420 cals", icon: Flame, color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/50" },
    { id: "bloodPressure", title: "Blood Pressure", defaultValue: "120/80 mmHg", icon: Heart, color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/50" },
    { id: "bloodGlucose", title: "Blood Glucose", defaultValue: "95 mg/dL", icon: BloodDrop, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/50" },
    { id: "heartRate", title: "Heart Rate", defaultValue: "72 bpm", icon: Heart, color: "text-pink-500", bg: "bg-pink-100 dark:bg-pink-900/50" },
];
