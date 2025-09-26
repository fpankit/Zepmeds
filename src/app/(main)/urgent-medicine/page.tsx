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
  MapPin,
  ChevronRight,
  Store,
  Phone,
  Navigation,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/cart-context';
import { Separator } from '@/components/ui/separator';

const nearbyChemists = [
  { 
      id: 'ch001', 
      name: 'Apollo Pharmacy', 
      address: 'Shop 12, Main Market, Sector 14', 
      distance: '1.2 km', 
      phone: '9876543210', 
      coords: { lat: 28.4744, lng: 77.0169 } 
  },
  { 
      id: 'ch002', 
      name: 'Wellness Forever', 
      address: 'Galleria Market, DLF Phase IV', 
      distance: '2.5 km', 
      phone: '9988776655', 
      coords: { lat: 28.4677, lng: 77.0818 } 
  },
  { 
      id: 'ch003', 
      name: 'MedPlus Pharmacy', 
      address: 'Good Earth City Center, Sector 50', 
      distance: '3.8 km', 
      phone: '9012345678', 
      coords: { lat: 28.4128, lng: 77.0420 } 
  },
];

export default function UrgentMedicinePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [medicines, setMedicines] = useState(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [showChemists, setShowChemists] = useState(false);

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

  const handleFindChemists = () => {
    if (medicines.some((m) => !m.trim())) {
      toast({
        variant: 'destructive',
        title: 'Empty Fields',
        description: 'Please enter at least one medicine name.',
      });
      return;
    }
    setIsLoading(true);
    // Simulate a quick network call
    setTimeout(() => {
        setShowChemists(true);
        setIsLoading(false);
    }, 500);
  };

  const handleOrderFromChemist = (chemistId: string) => {
    // Add all entered valid medicines to cart
    medicines.filter(m => m.trim()).forEach(medName => {
        addToCart({
            id: `urgent-${medName.replace(/\s+/g, '-')}-${chemistId}`, 
            name: medName,
            price: 0, // Price is unknown, to be confirmed by chemist
            quantity: 1,
            isRx: true, // Assume prescription might be needed
        });
    });

    toast({
      title: 'Medicines Added to Cart',
      description: 'The chemist will confirm availability and price. Proceed to checkout to place your urgent request.',
    });

    router.push('/cart');
  };
  
  const handleNavigate = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center p-4 bg-background border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold ml-4">Find Medicines Near You</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {!showChemists ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ambulance className="text-primary" />
                Urgent Medicine Request
              </CardTitle>
              <CardDescription>
                Need a medicine in a hurry? Enter the name and find it at a
                nearby certified chemist.
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
                onClick={handleFindChemists}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="mr-2 h-4 w-4" />
                )}
                {isLoading ? 'Finding...' : 'Find Chemists'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available at these chemists:</CardTitle>
                 <CardDescription>
                    Please call the chemist to confirm stock before visiting.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {nearbyChemists.map((chemist) => (
                  <Card key={chemist.id} className="p-4 space-y-4 bg-card/50">
                      <div className="flex items-start gap-3">
                         <Store className="h-6 w-6 text-primary mt-1" />
                         <div>
                              <p className="font-bold text-lg">{chemist.name}</p>
                              <div className="text-sm text-muted-foreground mt-1 space-y-1">
                                 <div className='flex items-center gap-2'>
                                   <MapPin className="h-4 w-4" />
                                   <p>{chemist.address} ({chemist.distance})</p>
                                 </div>
                                 <div className='flex items-center gap-2'>
                                    <Phone className="h-4 w-4" />
                                    <a href={`tel:${chemist.phone}`} className="text-primary hover:underline">{chemist.phone}</a>
                                 </div>
                              </div>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                           <Button variant="outline" onClick={() => handleNavigate(chemist.coords.lat, chemist.coords.lng)}>
                               <Navigation className="mr-2 h-4 w-4"/>
                               Navigate
                          </Button>
                          <Button onClick={() => handleOrderFromChemist(chemist.id)}>
                              Request Pickup
                          </Button>
                      </div>
                  </Card>
                ))}
              </CardContent>
            </Card>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowChemists(false)}
            >
              Go Back & Edit Search
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
