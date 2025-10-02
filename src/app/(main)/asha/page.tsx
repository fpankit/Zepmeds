'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Bell, Plus, User, Syringe } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from '@/components/ui/skeleton';

interface Beneficiary {
    id: string;
    name: string;
    relation: string;
    age: string;
    avatar: string;
    dataAiHint: string;
    status?: string;
}

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
        if (!user || user.isGuest) {
            setIsLoading(false);
            return;
        }

        const familyId = user.id; 
        
        const q = query(
            collection(db, 'zep_beneficiaries'), 
            where('familyId', '==', familyId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMembers = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Beneficiary));
            
            fetchedMembers.sort((a, b) => a.name.localeCompare(b.name));
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
                
                <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-muted-foreground">My Family</h2>
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
                    ))) : (
                        <Card>
                            <CardContent className="p-6 text-center text-muted-foreground">
                                <User className="mx-auto h-12 w-12 mb-4" />
                                <h3 className="font-semibold text-lg">No Family Members Found</h3>
                                <p className="text-sm">An ASHA worker can add your family members to view their health records here.</p>
                            </CardContent>
                        </Card>
                    )}
                    <Button variant="outline" className="w-full">
                        <Plus className="h-5 w-5 mr-2" /> Add New Member
                    </Button>
                </div>

            </main>
        </div>
    );
}
