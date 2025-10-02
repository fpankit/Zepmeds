
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, User } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Users, UserPlus, Search, ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const BeneficiarySkeleton = () => (
    <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>
            </Card>
        ))}
    </div>
);

export default function BeneficiaryRecordsPage() {
    const { user, loading: authLoading } = useAuth();
    const [beneficiaries, setBeneficiaries] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/login');
            return;
        }

        const fetchBeneficiaries = async () => {
            try {
                const q = query(
                    collection(db, 'users'),
                    where('isDoctor', '==', false)
                );
                const querySnapshot = await getDocs(q);
                const userList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
                setBeneficiaries(userList);
            } catch (error) {
                console.error("Error fetching beneficiaries:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBeneficiaries();
    }, [user, authLoading, router]);

    const filteredBeneficiaries = beneficiaries.filter(b =>
        `${b.firstName} ${b.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-background">
            <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-slate-50/80 backdrop-blur-lg border-b dark:bg-background/80">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold">Patient Records</h1>
                <Button variant="ghost" size="icon">
                    <UserPlus className="h-6 w-6" />
                </Button>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or Health ID..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {isLoading ? (
                    <BeneficiarySkeleton />
                ) : filteredBeneficiaries.length === 0 ? (
                    <Card className="text-center p-10">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No Beneficiaries Found</h3>
                        <p className="text-sm text-muted-foreground">Add a new beneficiary to get started.</p>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {filteredBeneficiaries.map(beneficiary => (
                            <Link href={`/asha/records/${beneficiary.id}`} key={beneficiary.id}>
                                <Card className="hover:border-primary transition-colors">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={beneficiary.photoURL} />
                                                <AvatarFallback>
                                                    {beneficiary.firstName?.[0]}{beneficiary.lastName?.[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-bold">{beneficiary.firstName} {beneficiary.lastName}</p>
                                                <p className="text-sm text-muted-foreground">ID: {beneficiary.id.substring(0, 8)}...</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-muted-foreground"/>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
