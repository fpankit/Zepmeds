'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth, User } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft, Loader2, PlusCircle, Trash2, UserSearch, FilePlus2, CheckCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const reportSchema = z.object({
  patient: z.object({
    id: z.string().min(1, 'Patient selection is required.'),
    name: z.string(),
  }),
  chiefComplaint: z.string().min(10, 'Please provide a brief chief complaint.'),
  diagnosis: z.string().min(3, 'Diagnosis is required.'),
  notes: z.string().optional(),
  medications: z.array(z.object({
    name: z.string().min(1, 'Medicine name is required.'),
    dosage: z.string().min(1, 'Dosage is required.'),
    frequency: z.string().min(1, 'Frequency is required.'),
  })).optional(),
  tests: z.array(z.object({
    name: z.string().min(1, 'Test name is required.'),
    notes: z.string().optional(),
  })).optional(),
  followUp: z.string().optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

function CreateReportPageContent() {
  const { user: doctorUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [patients, setPatients] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      patient: { id: '', name: '' },
      chiefComplaint: '',
      diagnosis: '',
      notes: '',
      medications: [],
      tests: [],
      followUp: '',
    },
  });

  const { fields: medFields, append: appendMed, remove: removeMed } = useFieldArray({
    control: form.control,
    name: 'medications',
  });

  const { fields: testFields, append: appendTest, remove: removeTest } = useFieldArray({
    control: form.control,
    name: 'tests',
  });
  
  useEffect(() => {
    if (!authLoading && (!doctorUser || !doctorUser.isDoctor)) {
      toast({ variant: 'destructive', title: 'Access Denied', description: 'You must be a doctor to access this page.' });
      router.push('/home');
    }
  }, [doctorUser, authLoading, router, toast]);

  useEffect(() => {
    const fetchPatients = async () => {
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, where('isDoctor', '==', false));
      const querySnapshot = await getDocs(q);
      const patientList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setPatients(patientList);

      const patientIdFromUrl = searchParams.get('patientId');
      const patientNameFromUrl = searchParams.get('patientName');
      if (patientIdFromUrl && patientNameFromUrl) {
        form.setValue('patient.id', patientIdFromUrl);
        form.setValue('patient.name', patientNameFromUrl);
      }
    };

    fetchPatients();
  }, [searchParams, form]);

  const onSubmit = async (data: ReportFormValues) => {
    if (!doctorUser) return;
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'reports'), {
        patientId: data.patient.id, // THE FIX: This was missing
        patientName: data.patient.name,
        doctorId: doctorUser.id,
        doctorName: `${doctorUser.firstName} ${doctorUser.lastName}`,
        doctorSpecialty: doctorUser.specialty || 'General Physician',
        createdAt: serverTimestamp(),
        chiefComplaint: data.chiefComplaint,
        diagnosis: data.diagnosis,
        notes: data.notes,
        medications: data.medications,
        tests: data.tests,
        followUp: data.followUp,
      });

      toast({
        title: 'Report Created Successfully',
        description: `The report for ${data.patient.name} has been saved.`,
      });
      router.push('/profile/diagnostic-reports');
    } catch (error) {
      console.error('Failed to create report:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'Could not save the report. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || !doctorUser?.isDoctor) {
    return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Create Diagnostic Report</h1>
        <div className="w-8"></div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto">
            
            <Card>
              <CardHeader>
                <CardTitle>Patient and Diagnosis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <FormField
                  control={form.control}
                  name="patient.id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Select Patient</FormLabel>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                'w-full justify-between',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {form.getValues('patient.name') || 'Select patient...'}
                              <UserSearch className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                           <Command>
                            <CommandInput placeholder="Search patient..." />
                             <CommandList>
                                <ScrollArea className="h-72">
                                <CommandEmpty>No patient found.</CommandEmpty>
                                <CommandGroup>
                                {patients.map((patient) => (
                                    <CommandItem
                                    value={`${patient.firstName} ${patient.lastName}`}
                                    key={patient.id}
                                    onSelect={() => {
                                        form.setValue('patient.id', patient.id);
                                        form.setValue('patient.name', `${patient.firstName} ${patient.lastName}`);
                                        setOpen(false);
                                    }}
                                    >
                                    <CheckCircle
                                        className={cn(
                                        'mr-2 h-4 w-4',
                                        patient.id === field.value
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                        )}
                                    />
                                    {patient.firstName} {patient.lastName} ({patient.phone})
                                    </CommandItem>
                                ))}
                                </CommandGroup>
                                </ScrollArea>
                             </CommandList>
                           </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="chiefComplaint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chief Complaint</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., Patient reports chest pain and shortness of breath..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="diagnosis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Official Diagnosis</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Acute Myocardial Infarction" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Prescribed Medications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     {medFields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                               <FormField
                                control={form.control}
                                name={`medications.${index}.name`}
                                render={({ field }) => (
                                    <FormItem><FormLabel>Medicine Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )}
                                />
                                <FormField
                                control={form.control}
                                name={`medications.${index}.dosage`}
                                render={({ field }) => (
                                    <FormItem><FormLabel>Dosage</FormLabel><FormControl><Input placeholder="e.g., 500mg" {...field} /></FormControl><FormMessage /></FormItem>
                                )}
                                />
                                <FormField
                                control={form.control}
                                name={`medications.${index}.frequency`}
                                render={({ field }) => (
                                    <FormItem><FormLabel>Frequency</FormLabel><FormControl><Input placeholder="e.g., 1-0-1" {...field} /></FormControl><FormMessage /></FormItem>
                                )}
                                />
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeMed(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                     ))}
                     <Button type="button" variant="outline" onClick={() => appendMed({ name: '', dosage: '', frequency: '' })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Medication
                     </Button>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Recommended Tests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     {testFields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <FormField
                                control={form.control}
                                name={`tests.${index}.name`}
                                render={({ field }) => (
                                    <FormItem><FormLabel>Test Name</FormLabel><FormControl><Input placeholder="e.g., Complete Blood Count (CBC)" {...field} /></FormControl><FormMessage /></FormItem>
                                )}
                                />
                               <FormField
                                control={form.control}
                                name={`tests.${index}.notes`}
                                render={({ field }) => (
                                    <FormItem><FormLabel>Notes (Optional)</FormLabel><FormControl><Input placeholder="e.g., Fasting required" {...field} /></FormControl><FormMessage /></FormItem>
                                )}
                                />
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeTest(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                     ))}
                     <Button type="button" variant="outline" onClick={() => appendTest({ name: '', notes: '' })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Test
                     </Button>
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notes & Follow-up</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor's Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional observations..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="followUp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Follow-up Advice (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Follow up in 2 weeks" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FilePlus2 className="mr-2 h-4 w-4" />}
              {isSubmitting ? 'Submitting Report...' : 'Submit Report'}
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
}

export default function CreateReportPage() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <CreateReportPageContent />
        </Suspense>
    )
}
