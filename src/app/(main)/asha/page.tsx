
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { ArrowRight, Bell, ClipboardPlus, ListTodo, Users, BarChart, AreaChart, GitBranch } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const featureCards = [
    { title: "Patient Records", description: "View and manage all beneficiaries.", icon: Users, href: "/asha/records", color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Appointments", description: "Schedule and view upcoming visits.", icon: ListTodo, href: "/asha/appointments", color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Daily Tasks", description: "Check your daily visit list.", icon: ListTodo, href: "/asha/tasks", color: "text-orange-500", bg: "bg-orange-500/10" },
    { title: "Reports & Sync", description: "Generate and sync monthly reports.", icon: BarChart, href: "/asha/reports", color: "text-green-500", bg: "bg-green-500/10" },
];

export default function AshaDashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    
    return (
        <div className="bg-slate-50 min-h-screen font-sans dark:bg-background">
            {/* Header */}
            <header className="sticky top-0 z-10 p-4 bg-slate-50/80 backdrop-blur-lg border-b dark:bg-background/80">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold">ASHA Dashboard</h1>
                        <p className="text-sm text-muted-foreground">Welcome back, {user?.firstName || 'ASHA Worker'}!</p>
                    </div>
                    <Button variant="ghost" size="icon">
                        <Bell className="h-6 w-6"/>
                    </Button>
                </div>
            </header>

            <main className="p-4 space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Pending Tasks</CardTitle>
                            <CardDescription>for today</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">12</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Upcoming</CardTitle>
                            <CardDescription>appointments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">5</p>
                        </CardContent>
                    </Card>
                </div>

                 {/* Quick Actions */}
                 <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="h-auto py-3 flex-col gap-2">
                            <ClipboardPlus className="h-6 w-6 text-primary"/>
                            <span className="text-sm">New Beneficiary</span>
                        </Button>
                         <Button variant="outline" className="h-auto py-3 flex-col gap-2">
                            <GitBranch className="h-6 w-6 text-green-500"/>
                            <span className="text-sm">Sync Reports</span>
                        </Button>
                    </CardContent>
                 </Card>

                {/* Core Features */}
                <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-muted-foreground">All Features</h2>
                    {featureCards.map((card) => (
                        <Link href={card.href} key={card.title}>
                             <Card className="hover:border-primary transition-colors">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-lg ${card.bg}`}>
                                            <card.icon className={`h-6 w-6 ${card.color}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{card.title}</h3>
                                            <p className="text-sm text-muted-foreground">{card.description}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
