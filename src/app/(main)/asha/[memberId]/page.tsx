
'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Bell, Syringe, BarChart3, ClipboardPlus, Calendar, Check, AlertTriangle, FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { vaccinationData, Vaccine } from '@/lib/vaccination-data';
import { growthData } from '@/lib/growth-data';
import { format, isPast } from 'date-fns';

const familyMembers = [
    { id: 'member-1', name: "Sita Shah", relation: "Wife", age: "32 years", avatar: "https://firebasestorage.googleapis.com/v0/b/zepmeds-admin-panel.appspot.com/o/images%2Fstock%2Fhousewife.png?alt=media", dataAiHint: "indian woman" },
    { id: 'member-2', name: "Rohan Shah", relation: "Son", age: "5 years", avatar: "https://firebasestorage.googleapis.com/v0/b/zepmeds-admin-panel.appspot.com/o/images%2Fstock%2Findian-kid.png?alt=media", dataAiHint: "indian child" },
];

const healthReports = [
    { title: "ANC Checkup - Trimester 1", date: "2024-05-15", doctor: "Dr. Priya Mehta" },
    { title: "Hemoglobin Test", date: "2024-05-16", doctor: "Pathology Lab" },
];


export default function FamilyMemberDetailPage() {
    const router = useRouter();
    const params = useParams();
    const memberId = params.memberId;

    const member = familyMembers.find(m => m.id === memberId) || familyMembers[1]; // Default to child for demo

    const getStatus = (vaccine: Vaccine) => {
        const dueDate = new Date(vaccine.dueDate);
        if (vaccine.isDone) {
            return { icon: <Check className="h-4 w-4 text-green-500" />, text: `Done on ${format(dueDate, 'dd MMM yyyy')}`, color: 'text-green-400' };
        }
        if (isPast(dueDate)) {
            return { icon: <AlertTriangle className="h-4 w-4 text-red-500" />, text: 'Missed', color: 'text-red-400' };
        }
        return { icon: <Calendar className="h-4 w-4 text-yellow-500" />, text: `Due on ${format(dueDate, 'dd MMM yyyy')}`, color: 'text-yellow-400' };
    };

    return (
        <div className="bg-background min-h-screen font-sans">
            {/* Header */}
            <header className="sticky top-0 z-10 p-4 bg-background/80 backdrop-blur-lg border-b">
                <div className="flex justify-between items-center">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-6 w-6"/>
                    </Button>
                     <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={member.avatar} alt={member.name} data-ai-hint={member.dataAiHint} />
                            <AvatarFallback>{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-lg font-bold">{member.name}</h1>
                            <p className="text-xs text-muted-foreground">{member.relation} • {member.age}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon">
                        <Bell className="h-6 w-6"/>
                    </Button>
                </div>
            </header>

            <main className="p-4">
                 <Tabs defaultValue="vaccination" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="vaccination"><Syringe className="h-4 w-4 mr-2" />Vaccination</TabsTrigger>
                        <TabsTrigger value="growth"><BarChart3 className="h-4 w-4 mr-2" />Growth</TabsTrigger>
                        <TabsTrigger value="reports"><ClipboardPlus className="h-4 w-4 mr-2" />Reports</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="vaccination" className="mt-4 space-y-3">
                        {vaccinationData.map(vaccine => (
                            <Card key={vaccine.name}>
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold">{vaccine.name}</p>
                                        <p className="text-sm text-muted-foreground">{vaccine.protectsAgainst}</p>
                                    </div>
                                    <div className={`flex items-center gap-2 text-xs font-semibold ${getStatus(vaccine).color}`}>
                                        {getStatus(vaccine).icon}
                                        <span>{getStatus(vaccine).text}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    <TabsContent value="growth" className="mt-4 space-y-6">
                        <Card>
                             <CardContent className="p-4">
                                <h3 className="font-bold mb-1">Weight vs Age</h3>
                                <p className="text-sm text-muted-foreground mb-4">Tracking weight helps ensure healthy development.</p>
                                <div className="h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={growthData.weight} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="age" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                             </CardContent>
                        </Card>
                         <Card>
                             <CardContent className="p-4">
                                <h3 className="font-bold mb-1">Height vs Age</h3>
                                <p className="text-sm text-muted-foreground mb-4">Height is a key indicator of nutritional status.</p>
                                <div className="h-[200px]">
                                     <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={growthData.height} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="age" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="height" stroke="#82ca9d" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                             </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reports" className="mt-4 space-y-3">
                        {healthReports.map(report => (
                             <Card key={report.title}>
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold">{report.title}</p>
                                        <p className="text-sm text-muted-foreground">Dr. {report.doctor} • {format(new Date(report.date), 'dd MMM yyyy')}</p>
                                    </div>
                                    <Button size="icon" variant="outline">
                                        <FileDown className="h-5 w-5" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
