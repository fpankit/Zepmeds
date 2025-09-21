'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Loader2,
  PlusCircle,
  Trash2,
  Ambulance,
  Sparkles,
  MapPin,
  Check,
  ChevronRight,
  BadgeCent,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import {
  validateUrgentMedicine,
  UrgentMedicineInput,
  UrgentMedicineOutput,
  ValidatedMedicine,
} from '@/ai/flows/urgent-medicine-flow';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/cart-context';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const nearbyChemists = [
  { id: 'ch001', name: 'Apollo Pharmacy', distance: '1.2 km' },
  { id: 'ch002', name: 'Wellness Forever', distance: '2.5 km' },
  { id: 'ch003', name: 'MedPlus Pharmacy', distance: '3.8 km' },
];

export default function UrgentMedicinePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [medicines, setMedicines] = useState(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<UrgentMedicineOutput | null>(null);
  const [selectedChemist, setSelectedChemist] = useState<string | null>(null);

  const handleMedicineChange = (index: number, value: string) => {
    const newMedicines = [...medicines];
    newMedicines[index] = value;
    setMedicines(newMedicines);
  };

  const addMedicineInput = () => {
    if (medicines.length < 4) {
      setMedicines([...medicines, '']);
    }
  };

  const removeMedicineInput = (index: number) => {
    if (medicines.length > 1) {
      const newMedicines = medicines.filter((_, i) => i !== index);
      setMedicines(newMedicines);
    }
  };

  const handleAnalyze = async () => {
    if (medicines.some((m) => !m.trim())) {
      toast({
        variant: 'destructive',
        title: 'Empty Fields',
        description: 'Please fill out all medicine names before analyzing.',
      });
      return;
    }
    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const result = await validateUrgentMedicine({
        medicineNames: medicines.filter((m) => m.trim()),
      });
      setAnalysisResult(result);
    } catch (error) {
      console.error('Failed to validate medicines:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description:
          'Could not validate medicines. Please check your connection and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderFromChemist = () => {
    if (!analysisResult || !selectedChemist) return;

    // Add all valid, non-prescription medicines to cart
    analysisResult.validatedMedicines.forEach((med: ValidatedMedicine) => {
      if (med.isValid) {
        addToCart({
          id: `urgent-${med.name.replace(/\s+/g, '-')}`, // Create a temporary ID
          name: med.name,
          price: med.estimatedPrice,
          quantity: 1,
          isRx: med.requiresPrescription,
        });
      }
    });

    toast({
      title: 'Medicines Added to Cart',
      description: 'Proceed to checkout to complete your urgent order.',
    });

    router.push('/checkout');
  };

  const allMedicinesValid =
    analysisResult?.validatedMedicines.every((m) => m.isValid) ?? false;
  const atLeastOneValid =
    analysisResult?.validatedMedicines.some((m) => m.isValid) ?? false;

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center p-4 bg-background border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold ml-4">Find Medicines Near You</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {!analysisResult ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ambulance className="text-primary" />
                Urgent Medicine Request
              </CardTitle>
              <CardDescription>
                Need a medicine in a hurry? Enter the names and find it at a
                nearby certified chemist. We'll arrange delivery within 1 hour.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {medicines.map((medicine, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Label
                      htmlFor={`med-${index}`}
                      className="text-sm font-semibold"
                    >
                      {index + 1}.
                    </Label>
                    <Input
                      id={`med-${index}`}
                      placeholder="e.g., Crocin Pain Relief 500mg"
                      value={medicine}
                      onChange={(e) => handleMedicineChange(index, e.target.value)}
                    />
                    {medicines.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMedicineInput(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {medicines.length < 4 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addMedicineInput}
                  className="w-full"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Another Medicine
                </Button>
              )}
              <Separator />
              <Button
                className="w-full"
                onClick={handleAnalyze}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {isLoading ? 'Analyzing...' : 'Analyze & Find Chemists'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Analysis Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysisResult.validatedMedicines.map((med, index) => (
                  <Card
                    key={index}
                    className={cn(
                      'p-3',
                      !med.isValid
                        ? 'bg-destructive/10 border-destructive'
                        : 'bg-green-500/10 border-green-500'
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold">{med.name}</p>
                        <p
                          className={cn(
                            'text-sm',
                            !med.isValid
                              ? 'text-destructive'
                              : 'text-green-700 dark:text-green-400'
                          )}
                        >
                          {med.reason}
                        </p>
                      </div>
                      {med.isValid ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <Ambulance className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                    {med.requiresPrescription && (
                      <Badge variant="destructive" className="mt-2">
                        Rx Required
                      </Badge>
                    )}
                     {med.estimatedPrice > 0 && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <BadgeCent className="h-3 w-3"/>
                            <span>Est. Price: ₹{med.estimatedPrice}</span>
                        </div>
                    )}
                  </Card>
                ))}
              </CardContent>
            </Card>

            {atLeastOneValid && (
              <Card>
                <CardHeader>
                  <CardTitle>Nearby Certified Chemists (5km)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {nearbyChemists.map((chemist) => (
                    <Card
                      key={chemist.id}
                      className={cn(
                        'p-4 cursor-pointer transition-all hover:bg-card/80',
                        selectedChemist === chemist.id &&
                          'ring-2 ring-primary bg-primary/10'
                      )}
                      onClick={() => setSelectedChemist(chemist.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-bold">{chemist.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {chemist.distance}
                            </p>
                          </div>
                        </div>
                        {selectedChemist === chemist.id ? (
                          <Check className="h-6 w-6 text-primary" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={handleOrderFromChemist}
                disabled={!selectedChemist}
              >
                Add to Cart & Proceed
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setAnalysisResult(null)}
              >
                Go Back & Edit
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
