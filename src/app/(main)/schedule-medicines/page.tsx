
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { CalendarIcon, PlusCircle, Bell, Loader2, Package, Clock, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { predictMedicineEndDate } from '@/ai/flows/predict-medicine-end-date';
import { Skeleton } from '@/components/ui/skeleton';

const scheduleSchema = z
  .object({
    medicineName: z.string().min(1, 'Medicine name is required'),
    dosage: z.string().min(1, 'Dosage is required'),
    quantity: z.coerce.number().min(1, 'Quantity is required'),
    frequency: z.string().min(1, 'Frequency is required'),
    startDate: z.date({ required_error: 'Start date is required' }),
    endDate: z.date().optional(),
    autoOrder: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.endDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      message: 'End date must be after the start date',
      path: ['endDate'],
    }
  );

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

interface ScheduledMedicine extends ScheduleFormValues {
  id: string;
  predictedEndDate?: Date | null;
  autoOrderStatus?: string;
}

const MedicineCardSkeleton = () => (
  <Card>
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </CardContent>
  </Card>
);

export default function ScheduleMedicinesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [medicines, setMedicines] = useState<ScheduledMedicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      medicineName: '',
      dosage: '',
      quantity: 0,
      frequency: '',
      autoOrder: false,
    },
  });

  useEffect(() => {
    if (!user || user.isGuest) {
        setIsLoading(false);
        return;
    };

    const q = query(
      collection(db, 'scheduled_medicines'),
      where('patient_id', '==', user.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMedicines = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startDate: data.start_date?.toDate(),
          endDate: data.end_date?.toDate(),
          predictedEndDate: data.predicted_end_date?.toDate(),
        } as ScheduledMedicine;
      });
      setMedicines(fetchedMedicines);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const onSubmit = async (data: ScheduleFormValues) => {
    if (!user || user.isGuest) {
      toast({
        variant: 'destructive',
        title: 'Please log in to schedule medicines.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // AI Prediction
      const tabletsPerDose = parseInt(data.dosage.split(' ')[0]) || 1;
      const { predictedDate } = await predictMedicineEndDate({
        startDate: data.startDate.toISOString(),
        tabletsPerDose,
        timesPerDay: parseInt(data.frequency) || 1,
        totalTablets: data.quantity,
      });

      await addDoc(collection(db, 'scheduled_medicines'), {
        patient_id: user.id,
        medicine_name: data.medicineName,
        dosage: data.dosage,
        quantity: data.quantity,
        frequency: data.frequency,
        start_date: data.startDate,
        end_date: data.endDate || null,
        predicted_end_date: predictedDate ? new Date(predictedDate) : null,
        auto_order_status: data.autoOrder ? 'Pending' : 'Off',
        last_updated: serverTimestamp(),
      });

      toast({
        title: 'Medicine Scheduled',
        description: `${data.medicineName} has been added to your schedule.`,
      });
      form.reset();
      setShowForm(false);
    } catch (error) {
      console.error('Failed to schedule medicine:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to schedule',
        description:
          'There was a problem scheduling your medicine. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <CalendarIcon className="h-6 w-6 text-primary" />
            My Medicines
          </CardTitle>
          <CardDescription>
            Manage your medicine schedules and auto-orders.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="my-medicines">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-medicines">
            <Package className="mr-2 h-4 w-4" /> My Medicines
          </TabsTrigger>
          <TabsTrigger value="auto-orders">
            <Clock className="mr-2 h-4 w-4" /> Auto-Orders
          </TabsTrigger>
        </TabsList>
        <TabsContent value="my-medicines" className="mt-6">
          {!showForm && (
            <Button className="w-full" onClick={() => setShowForm(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Medicine
            </Button>
          )}

          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add a New Medicine</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="medicineName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medicine Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Paracetamol 500mg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="dosage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dosage</FormLabel>
                             <FormControl>
                                <Input placeholder="e.g., 1 tablet" {...field} />
                             </FormControl>
                             <FormDescription>
                                Tablets to take at one time.
                             </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Quantity</FormLabel>
                            <FormControl>
                               <Input type="number" placeholder="e.g., 30" {...field} />
                            </FormControl>
                             <FormDescription>
                                Total tablets you have.
                             </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                     <FormField
                        control={form.control}
                        name="frequency"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Frequency</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select how often" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="1">Once a day</SelectItem>
                                    <SelectItem value="2">Twice a day</SelectItem>
                                    <SelectItem value="3">Three times a day</SelectItem>
                                    <SelectItem value="4">Four times a day</SelectItem>
                                    </SelectContent>
                                </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                    <div className="grid grid-cols-2 gap-4">
                       <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Start Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={'outline'}
                                        className={cn(
                                            'w-full pl-3 text-left font-normal',
                                            !field.value && 'text-muted-foreground'
                                        )}
                                        >
                                        {field.value ? (
                                            format(field.value, 'PPP')
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => date < new Date('1900-01-01')}
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>End Date (Optional)</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={'outline'}
                                        className={cn(
                                            'w-full pl-3 text-left font-normal',
                                            !field.value && 'text-muted-foreground'
                                        )}
                                        >
                                        {field.value ? (
                                            format(field.value, 'PPP')
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => date < new Date('1900-01-01')}
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <FormField
                        control={form.control}
                        name="autoOrder"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Enable Auto-Order</FormLabel>
                                <FormDescription>
                                Automatically re-order when stock is low.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            </FormItem>
                        )}
                        />
                    
                    <div className="flex justify-end gap-2">
                         <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                         {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                         Schedule
                        </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          <div className="mt-6 space-y-4">
             {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => <MedicineCardSkeleton key={i} />)
            ) : medicines.length === 0 && !showForm ? (
              <Card className="text-center p-8 border-dashed">
                  <h3 className="text-lg font-semibold">No Medicines Scheduled</h3>
                  <p className="text-muted-foreground">Add a medicine to get started.</p>
              </Card>
            ) : (
                medicines.map(med => (
                    <Card key={med.id}>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg">{med.medicineName}</h3>
                                    <p className="text-sm text-muted-foreground">{med.dosage}, {med.frequency} times a day</p>
                                </div>
                                 <div className={cn("text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1", med.autoOrder ? "bg-green-500/20 text-green-400" : "bg-muted")}>
                                    <Clock className="h-3 w-3" />
                                    Auto-Order {med.autoOrder ? 'On' : 'Off'}
                                 </div>
                            </div>
                            <div className="mt-4 text-sm space-y-1">
                                <p><strong>Starts:</strong> {format(med.startDate, 'PPP')}</p>
                                {med.endDate && <p><strong>Ends:</strong> {format(med.endDate, 'PPP')}</p>}
                                {med.predictedEndDate && (
                                    <p className="flex items-center gap-2 text-blue-400">
                                        <Bot className="h-4 w-4" />
                                        <strong>Predicted to finish on:</strong> {format(med.predictedEndDate, 'PPP')}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="auto-orders" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Auto-Order History</CardTitle>
                    <CardDescription>
                        View the status of your automatic orders.
                    </CardDescription>
                </CardHeader>
                 <CardContent className="text-center p-8 border-dashed border-t">
                    <h3 className="text-lg font-semibold">No Auto-Orders Yet</h3>
                    <p className="text-muted-foreground">Enable auto-ordering for a medicine to see its history here.</p>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    
    