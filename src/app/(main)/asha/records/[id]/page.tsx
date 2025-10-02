
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth, User } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Edit, Download, Cake, User as UserIcon, BarChart3, Syringe, HeartHandshake, Baby } from 'lucide-react';
import { format, differenceInYears } from 'date-fns';

const BeneficiaryProfileSkeleton = () => (
    <div className="p-4 space-y-6">
        <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-28" />
            </div>
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-48 w-full" />
    </div>
);

export default function BeneficiaryDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { id: beneficiaryId } = params;
    const [beneficiary, setBeneficiary] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!beneficiaryId) return;

        const fetchBeneficiary = async () => {
            try {
                const userDocRef = doc(db, 'users', beneficiaryId as string);
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    setBeneficiary({ id: docSnap.id, ...docSnap.data() } as User);
                } else {
                    router.push('/asha/records');
                }
            } catch (error) {
                console.error("Error fetching beneficiary:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBeneficiary();
    }, [beneficiaryId, router]);

    if (isLoading) {
        return <BeneficiaryProfileSkeleton />;
    }

    if (!beneficiary) {
        return <div className="p-4">Beneficiary not found.</div>;
    }

    const age = beneficiary.age || 0;

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-background">
            <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-slate-50/80 backdrop-blur-lg border-b dark:bg-background/80">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold truncate">{beneficiary.firstName} {beneficiary.lastName}</h1>
                <Button variant="ghost" size="icon">
                    <Download className="h-6 w-6" />
                </Button>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-6">
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={beneficiary.photoURL} alt={`${beneficiary.firstName}`} />
                            <AvatarFallback className="text-2xl">
                                {beneficiary.firstName?.[0]}{beneficiary.lastName?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-xl font-bold">{beneficiary.firstName} {beneficiary.lastName}</h2>
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                <UserIcon className="h-4 w-4" /> ID: {beneficiary.id.substring(0, 8)}...
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Cake className="h-4 w-4" /> Age: {age} years
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Tabs defaultValue="vaccination" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="anc_pnc"><HeartHandshake className="h-4 w-4 sm:mr-2"/> <span className="hidden sm:inline">ANC/PNC</span></TabsTrigger>
                        <TabsTrigger value="vaccination"><Syringe className="h-4 w-4 sm:mr-2"/> <span className="hidden sm:inline">Vaccination</span></TabsTrigger>
                        <TabsTrigger value="growth"><AreaChart className="h-4 w-4 sm:mr-2"/> <span className="hidden sm:inline">Growth</span></TabsTrigger>
                        <TabsTrigger value="reports"><Baby className="h-4 w-4 sm:mr-2"/> <span className="hidden sm:inline">Milestones</span></TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="anc_pnc">
                        <Card>
                            <CardHeader><CardTitle>Antenatal & Postnatal Care</CardTitle></CardHeader>
                            <CardContent><p className="text-muted-foreground">ANC/PNC visit details will be shown here.</p></CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="vaccination">
                        <Card>
                            <CardHeader><CardTitle>Vaccination Timeline (0-5 Years)</CardTitle></CardHeader>
                            <CardContent><p className="text-muted-foreground">Vaccination records and timeline will be shown here.</p></CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="growth">
                        <Card>
                            <CardHeader><CardTitle>Growth Chart</CardTitle></CardHeader>
                            <CardContent><p className="text-muted-foreground">Height, weight, and BMI graphs will be shown here.</p></CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="reports">
                        <Card>
                            <CardHeader><CardTitle>Developmental Milestones</CardTitle></CardHeader>
                            <CardContent><p className="text-muted-foreground">Milestone checklist (crawling, walking, etc.) will be shown here.</p></CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
