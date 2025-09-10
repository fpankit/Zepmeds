
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
    { id: "dailySteps", title: "Daily Steps", defaultValue: "7,642", icon: Footprints, color: "text-blue-400", bg: "bg-blue-900/50" },
    { id: "waterIntake", title: "Water Intake", defaultValue: "6 glasses", icon: GlassWater, color: "text-cyan-400", bg: "bg-cyan-900/50" },
    { id: "caloriesBurned", title: "Calories Burned", defaultValue: "420 cals", icon: Flame, color: "text-orange-400", bg: "bg-orange-900/50" },
    { id: "bloodPressure", title: "Blood Pressure", defaultValue: "120/80 mmHg", icon: Heart, color: "text-red-400", bg: "bg-red-900/50" },
    { id: "bloodGlucose", title: "Blood Glucose", defaultValue: "95 mg/dL", icon: BloodDrop, color: "text-sky-400", bg: "bg-sky-900/50" },
    { id: "heartRate", title: "Heart Rate", defaultValue: "72 bpm", icon: Heart, color: "text-rose-400", bg: "bg-rose-900/50" },
];
