
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Bell, ClipboardList, History, Plus, Users, Syringe } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const quickLinks = [
    { title: "My Appointments", description: "View upcoming & past bookings", icon: History, href: "/appointments" },
    { title: "My Order History", description: "Track your past medicine orders", icon: ClipboardList, href: "/orders" },
    { title: "Diagnostic Reports", description: "Access all your medical reports", icon: ClipboardList, href: "/profile/diagnostic-reports" },
];

const familyMembers = [
    { id: 'member-1', name: "Sita Shah", relation: "Wife", age: "32 years", avatar: "https://firebasestorage.googleapis.com/v0/b/zepmeds-admin-panel.appspot.com/o/images%2Fstock%2Fhousewife.png?alt=media", dataAiHint: "indian woman", status: "ANC Checkup Due" },
    { id: 'member-2', name: "Rohan Shah", relation: "Son", age: "5 years", avatar: "https://firebasestorage.googleapis.com/v0/b/zepmeds-admin-panel.appspot.com/o/images%2Fstock%2Findian-kid.png?alt=media", dataAiHint: "indian child", status: "Polio Vaccine Due" },
];


export default function MyFamilyDashboardPage() {
    const router = useRouter();
    
    return (
        <div className="bg-background min-h-screen font-sans">
            {/* Header */}
            <header className="sticky top-0 z-10 p-4 bg-background/80 backdrop-blur-lg border-b">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold">My Family</h1>
                        <p className="text-sm text-muted-foreground">Manage your family's health records.</p>
                    </div>
                    <Button variant="ghost" size="icon">
                        <Bell className="h-6 w-6"/>
                    </Button>
                </div>
            </header>

            <main className="p-4 space-y-6">
                
                 {/* Family Members */}
                <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-muted-foreground">My Family</h2>
                    {familyMembers.map((member) => (
                         <Link href={`/asha/${member.id}`} key={member.name}>
                            <Card className="hover:border-primary transition-colors">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={member.avatar} alt={member.name} data-ai-hint={member.dataAiHint} />
                                                <AvatarFallback>{member.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-semibold">{member.name}</h3>
                                                <p className="text-sm text-muted-foreground">{member.relation} • {member.age}</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    {member.status && (
                                        <div className="mt-3 pt-3 border-t border-dashed">
                                            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">
                                                <Syringe className="h-3 w-3 mr-1.5"/>
                                                {member.status}
                                            </Badge>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                    <Button variant="outline" className="w-full h-16">
                        <Plus className="h-5 w-5 mr-2" /> Add New Member
                    </Button>
                </div>


                {/* Quick Links */}
                <div className="space-y-3">
                     <h2 className="text-lg font-semibold text-muted-foreground">Quick Links</h2>
                    {quickLinks.map((card) => (
                        <Link href={card.href} key={card.title}>
                             <Card className="hover:border-primary transition-colors">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-lg bg-primary/10`}>
                                            <card.icon className={`h-6 w-6 text-primary`} />
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
