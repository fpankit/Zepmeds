
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, User as AuthUser } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Bell, Plus, User, Syringe, Baby, BarChart3, ClipboardList, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from '@/components/ui/skeleton';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


interface Beneficiary {
    id: string;
    patientName: string;
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

const AddMemberForm = ({ onMemberAdded }: { onMemberAdded: () => void }) => {
    const { user } = useAuth();
    const [patientName, setPatientName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!patientName || !age || !gender || !user) return;
        
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'zep_beneficiaries'), {
                patientName,
                age,
                gender,
                familyId: user.id, // Set the familyId to the ASHA worker's ID
                ashaWorkerId: user.id, // Also set the ashaWorkerId for future queries
                createdAt: serverTimestamp(),
                // Default values for other fields
                avatar: "https://firebasestorage.googleapis.com/v0/b/zepmeds-admin-panel.appspot.com/o/images%2Fstock%2Fplaceholder.png?alt=media",
                dataAiHint: "person",
            });
            onMemberAdded(); // Callback to refresh the list
        } catch (error) {
            console.error("Error adding new member:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                 <Button variant="outline" className="w-full">
                    <Plus className="h-5 w-5 mr-2" /> Add New Member
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Family Member</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="patientName">Full Name</Label>
                        <Input id="patientName" value={patientName} onChange={(e) => setPatientName(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="age">Age</Label>
                        <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} required />
                    </div>
                     <div>
                        <Label htmlFor="gender">Gender</Label>
                        <Input id="gender" value={gender} onChange={(e) => setGender(e.target.value)} required />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="ghost">Cancel</Button></DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Member
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default function MyFamilyDashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [familyMembers, setFamilyMembers] = useState<Beneficiary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchTrigger, setFetchTrigger] = useState(0); // State to trigger re-fetch

    const fetchBeneficiaries = async () => {
        if (!user || user.isGuest) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            // Fetch all documents from the collection without any filter to debug
            const beneficiariesCol = collection(db, 'zep_beneficiaries');
            const q = query(beneficiariesCol);
            
            const querySnapshot = await getDocs(q);
            
            let fetchedMembers: Beneficiary[] = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Beneficiary));

            fetchedMembers.sort((a, b) => a.patientName.localeCompare(b.patientName));

            setFamilyMembers(fetchedMembers);
        } catch (error) {
            console.error("Error fetching family members:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchBeneficiaries();
    }, [user, fetchTrigger]); // Re-fetch when user logs in or when a new member is added.
    
    const handleMemberAdded = () => {
        setFetchTrigger(prev => prev + 1); // Increment to trigger the useEffect
    }
    
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
                                <p className="text-sm">You have no beneficiaries assigned to you. Click below to add one.</p>
                            </CardContent>
                        </Card>
                    )}
                    <AddMemberForm onMemberAdded={handleMemberAdded} />
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
