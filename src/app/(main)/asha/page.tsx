
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Bell, Plus, User, Syringe, Baby, BarChart3, ClipboardList, Calendar } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from '@/components/ui/skeleton';

interface Beneficiary {
    id: string;
    patientName: string;
    relation: string;
    age: string;
    avatar: string;
    dataAiHint: string;
    status?: string;
    familyId?: string;
}

const quickActions = [
    { title: 'Child Care', icon: Baby, href: '/asha/member-2', color: 'text-pink-400' },
    { title: 'Vaccination', icon: Syringe, href: '/asha/member-2', color: 'text-blue-400' },
    { title: 'Appointments', icon: Calendar, href: '/appointments', color: 'text-teal-400' },
    { title: 'Growth Report', icon: BarChart3, href: '/asha/member-2', color: 'text-orange-400' },
    { title: 'Health Reports', icon: ClipboardList, href: '/profile/diagnostic-reports', color: 'text-purple-400' },
];

const FamilyMemberSkeleton = () => (
    <div className="space-y-3">
        <Card><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
        <Card><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
    </div>
);

export default function MyFamilyDashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [familyMembers, setFamilyMembers] = useState<Beneficiary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        if (authLoading) return;
        // Check if the user is an ASHA worker. Non-ASHAs shouldn't see this page's data.
        if (!user || user.isGuest || !user.isDoctor) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        
        // ** THE FIX **: The root cause was querying by 'ashaWorkerId'. 
        // Based on the data structure, ASHA workers are linked to beneficiaries via a shared 'familyId'.
        // The query now correctly fetches all beneficiaries where their `familyId` matches the logged-in ASHA worker's `id`.
        const q = query(
            collection(db, 'zep_beneficiaries'), 
            where('familyId', '==', user.id)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMembers: Beneficiary[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Beneficiary));
            
            // Client-side sorting to avoid composite index requirement
            fetchedMembers.sort((a, b) => a.patientName.localeCompare(b.patientName));

            setFamilyMembers(fetchedMembers);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching family members:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading]);
    
    return (
        <div className="bg-background min-h-screen font-sans">
            <main className="p-4 space-y-6">
                
                <Card className="bg-card/80">
                     <CardContent className="p-4 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                            <AvatarImage src={user?.photoURL || undefined} alt={user?.firstName} />
                            <AvatarFallback>
                                {user?.firstName?.[0]}
                                {user?.lastName?.[0]}
                            </AvatarFallback>
                            </Avatar>
                            <div>
                            <p className="text-sm text-muted-foreground">Good morning!</p>
                            <p className="font-bold text-lg">
                                {user?.firstName || 'User'} {user?.lastName || ''}
                            </p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon">
                            <Bell className="h-6 w-6"/>
                        </Button>
                    </CardContent>
                </Card>

                <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-muted-foreground">Family Members</h2>
                    {isLoading ? (
                        <FamilyMemberSkeleton />
                    ) : familyMembers.length > 0 ? (
                        familyMembers.map((member) => (
                         <Link href={`/asha/${member.id}`} key={member.id}>
                            <Card className="hover:border-primary transition-colors">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={member.avatar} alt={member.patientName} data-ai-hint={member.dataAiHint} />
                                                <AvatarFallback>{member.patientName?.[0] || 'U'}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-semibold">{member.patientName}</h3>
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
                    ))) : (
                        <Card>
                            <CardContent className="p-6 text-center text-muted-foreground">
                                <User className="mx-auto h-12 w-12 mb-4" />
                                <h3 className="font-semibold text-lg">No Family Members Found</h3>
                                <p className="text-sm">You have no beneficiaries assigned to you. An admin can add them for you.</p>
                            </CardContent>
                        </Card>
                    )}
                    <Button variant="outline" className="w-full">
                        <Plus className="h-5 w-5 mr-2" /> Add New Member
                    </Button>
                </div>

                <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-muted-foreground">Quick Actions</h2>
                     <div className="grid grid-cols-2 gap-4">
                        {quickActions.map(action => (
                            <Link href={action.href} key={action.title}>
                                <Card className="hover:border-primary transition-colors aspect-square flex flex-col items-center justify-center p-4 text-center">
                                    <action.icon className={`h-8 w-8 mb-2 ${action.color}`} />
                                    <p className="font-semibold text-sm">{action.title}</p>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>

            </main>
        </div>
    );
}
