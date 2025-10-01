
'use client';

import { Baby, Bell, BellRing, ChevronRight, FileText, HeartHandshake, LineChart, Users, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

const actionCards = [
    { title: "Add Beneficiary", icon: UserPlus, href: "#", color: "text-blue-400" },
    { title: "Add Report", icon: FileText, href: "#", color: "text-green-400" },
    { title: "Reminders", icon: BellRing, href: "#", color: "text-yellow-400" }
];

const serviceCards = [
    { title: "Maternal Care", description: "ANC/PNC Check-ups", icon: HeartHandshake, href: "#" },
    { title: "Child Health", description: "Growth Monitoring", icon: Baby, href: "#" },
    { title: "Family Planning", description: "Counseling & Info", icon: Users, href: "#" },
    { title: "Records", description: "View/Manage Data", icon: FileText, href: "#" },
];


export default function AshaDashboardPage() {
    const { user } = useAuth();
    const router = useRouter();

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background/80 backdrop-blur-sm border-b">
                <h1 className="text-xl font-bold">ASHA Dashboard</h1>
                <Button variant="ghost" size="icon">
                    <Bell className="h-6 w-6" />
                </Button>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-6">
                <Card className="bg-card/50">
                    <CardContent className="p-4 flex items-center gap-4">
                         <Avatar className="h-14 w-14 border-2 border-primary">
                            <AvatarImage src={user?.photoURL} alt={user?.displayName || "ASHA Worker"}/>
                            <AvatarFallback>{user?.displayName?.charAt(0) || 'A'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-muted-foreground">Hello!</p>
                            <p className="text-lg font-bold">{user?.displayName || "ASHA Worker"}</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-3 gap-3">
                    {actionCards.map(card => (
                        <Card key={card.title} className="bg-card/80 text-center p-3 flex flex-col items-center justify-center gap-2 hover:bg-card/60 transition-colors">
                            <card.icon className={`h-7 w-7 ${card.color}`} />
                            <p className="text-xs font-semibold">{card.title}</p>
                        </Card>
                    ))}
                </div>

                <div>
                    <h2 className="text-lg font-semibold mb-3">Services</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {serviceCards.map(card => (
                            <Card key={card.title} className="bg-card/80 p-4 flex flex-col justify-between hover:bg-card/60 transition-colors">
                                <div className="space-y-1">
                                    <card.icon className="h-7 w-7 text-primary mb-2"/>
                                    <h3 className="font-bold">{card.title}</h3>
                                    <p className="text-xs text-muted-foreground">{card.description}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                <Card className="bg-card/50">
                     <CardHeader>
                        <CardTitle>Child Growth & Vaccination</CardTitle>
                        <CardDescription>Track child's vaccination schedule and growth milestones.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Link href="#">
                            <div className="p-4 rounded-lg bg-background flex items-center justify-between hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Baby className="h-6 w-6 text-primary"/>
                                    <p className="font-semibold">Child Profiles</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </Link>
                         <Link href="#">
                            <div className="p-4 rounded-lg bg-background flex items-center justify-between hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M12 17a5 5 0 0 0 0-10V2a10 10 0 0 0 0 20v-5Z"/></svg>
                                    <p className="font-semibold">Vaccination Tracker</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </Link>
                         <Link href="#">
                            <div className="p-4 rounded-lg bg-background flex items-center justify-between hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <LineChart className="h-6 w-6 text-primary"/>
                                    <p className="font-semibold">Growth Charts</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </Link>
                    </CardContent>
                </Card>

            </main>
        </div>
    );
}

