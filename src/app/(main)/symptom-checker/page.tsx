
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, Suspense } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, Plus, X, ChevronRight, ArrowLeft } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const symptomSchema = z.object({
  symptoms: z.array(z.string()).min(1, 'Please enter at least one symptom.'),
  additionalInfo: z.string().optional(),
});

type SymptomFormValues = z.infer<typeof symptomSchema>;

function SymptomCheckerForm() {
  const router = useRouter();
  const [symptomInput, setSymptomInput] = useState('');

  const form = useForm<SymptomFormValues>({
    resolver: zodResolver(symptomSchema),
    defaultValues: {
      symptoms: [],
      additionalInfo: '',
    },
  });

  const { control, handleSubmit, setValue, getValues } = form;

  const addSymptom = () => {
    if (symptomInput.trim() !== '') {
      const currentSymptoms = getValues('symptoms');
      setValue('symptoms', [...currentSymptoms, symptomInput.trim()]);
      setSymptomInput('');
    }
  };

  const removeSymptom = (indexToRemove: number) => {
    const currentSymptoms = getValues('symptoms');
    setValue(
      'symptoms',
      currentSymptoms.filter((_, index) => index !== indexToRemove)
    );
  };

  const onSubmit = (data: SymptomFormValues) => {
    const combinedSymptoms = [
      ...data.symptoms,
      data.additionalInfo,
    ].join(', ');
    router.push(`/symptom-checker/results?symptoms=${encodeURIComponent(combinedSymptoms)}`);
  };

  return (
    <div className="flex flex-col h-full">
       <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">AI Symptom Checker</h1>
        <div className="w-8" />
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 bg-primary/20 rounded-full">
            <Stethoscope className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">AI Symptom Checker</h1>
          <p className="text-muted-foreground">
            Enter your symptoms to receive an AI-powered assessment.
          </p>
          <p className="text-sm text-red-500">
            Not a substitute for professional medical advice.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enter your symptoms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Enter a symptom"
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            addSymptom();
                        }
                    }}
                  />
                  <Button
                    type="button"
                    size="icon"
                    className="bg-primary flex-shrink-0"
                    onClick={addSymptom}
                  >
                    <Plus className="h-6 w-6" />
                  </Button>
                </div>

                <Controller
                  control={control}
                  name="symptoms"
                  render={({ field, fieldState }) => (
                    <div>
                      {field.value.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Your symptoms:</label>
                             <div className="flex flex-wrap gap-2">
                                {field.value.map((symptom, index) => (
                                <Badge key={index} variant="secondary" className="pl-3 pr-1 py-1 text-base">
                                    {symptom}
                                    <button
                                    type="button"
                                    onClick={() => removeSymptom(index)}
                                    className="ml-2 rounded-full hover:bg-muted/50 p-0.5"
                                    >
                                    <X className="h-4 w-4" />
                                    </button>
                                </Badge>
                                ))}
                            </div>
                        </div>
                      )}
                      {fieldState.error && (
                        <p className="text-sm text-destructive mt-2">{fieldState.error.message}</p>
                      )}
                    </div>
                  )}
                />


                <div className="space-y-2">
                  <label htmlFor="additionalInfo" className="text-sm font-medium">
                    Additional information (optional):
                  </label>
                  <Controller
                    name="additionalInfo"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        id="additionalInfo"
                        placeholder="Age, gender, existing conditions, when symptoms started, etc."
                        rows={4}
                        {...field}
                      />
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Button type="submit" className="w-full" size="lg">
              Analyze Symptoms
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
}


export default function SymptomCheckerPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SymptomCheckerForm />
        </Suspense>
    )
}
