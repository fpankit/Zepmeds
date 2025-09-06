
'use client';

import { useState, useRef } from 'react';
import {
  Search,
  Pill,
  Star,
  Heart,
  Eye,
  Stethoscope,
  Bone,
  Sun,
  Dog,
  Thermometer,
  ShoppingCart,
  FileText,
  Minus,
  Plus,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { PrescriptionUploader } from '@/components/features/prescription-uploader';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';

const featuredMedicines = [
  {
    id: 'med1',
    name: 'Vitamin C Tablets',
    description: 'Immunity Booster',
    price: 280,
    oldPrice: 350,
    discount: '20% OFF',
    rating: 4.5,
    image: 'https://picsum.photos/200/200?random=10',
    dataAiHint: 'medicine bottle',
  },
  {
    id: 'med2',
    name: 'Multivitamin Capsules',
    description: 'Daily Nutrition',
    price: 410,
    oldPrice: 450,
    discount: '9% OFF',
    rating: 4.7,
    image: 'https://picsum.photos/200/200?random=11',
    dataAiHint: 'medicine bottle',
  },
  {
    id: 'med3',
    name: 'Pain Relief Gel',
    description: 'For muscle pain',
    price: 150,
    oldPrice: 175,
    discount: '14% OFF',
    rating: 4.6,
    image: 'https://picsum.photos/200/200?random=12',
    dataAiHint: 'medicine tube',
  },
  {
    id: 'med4',
    name: 'Sunscreen SPF 50',
    description: 'Broad spectrum',
    price: 499,
    oldPrice: 600,
    discount: '17% OFF',
    rating: 4.8,
    image: 'https://picsum.photos/200/200?random=13',
    dataAiHint: 'sunscreen bottle',
  },
];

export default function OrderMedicinesPage() {
  const [showUploader, setShowUploader] = useState(false);
  const uploaderRef = useRef<HTMLDivElement>(null);
  const { cart, addToCart, updateQuantity } = useCart();
  const { toast } = useToast();

  const handleUploadClick = () => {
    setShowUploader(true);
    setTimeout(() => {
        uploaderRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  const handleAddToCart = (medicine: typeof featuredMedicines[0]) => {
    addToCart({ ...medicine, quantity: 1, name: medicine.name, price: medicine.price });
    toast({
      title: "Added to cart",
      description: `${medicine.name} has been added to your cart.`,
    });
  }

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search for medicines..." className="pl-10" />
      </div>

      <Card className="bg-card/80 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h3 className="font-semibold">Have a prescription?</h3>
            <p className="text-sm text-muted-foreground">
              Upload it and we'll handle the rest!
            </p>
          </div>
        </div>
        <Button onClick={handleUploadClick}>Upload</Button>
      </Card>
      
      {showUploader && <div ref={uploaderRef}><PrescriptionUploader /></div>}

      <div>
        <h2 className="text-xl font-bold mb-4">Featured Medicines</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {featuredMedicines.map((medicine, index) => {
            const cartItem = cart.find(item => item.id === medicine.id);
            return (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-4 flex gap-4">
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold">{medicine.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {medicine.description}
                      </p>
                       <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold">{medicine.rating}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-end mt-2">
                      <div>
                        <p className="font-bold text-lg">₹{medicine.price}</p>
                        <p className="text-sm text-muted-foreground line-through">
                          ₹{medicine.oldPrice}
                        </p>
                      </div>
                      {cartItem ? (
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(medicine.id, cartItem.quantity - 1)}>
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-bold">{cartItem.quantity}</span>
                          <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(medicine.id, cartItem.quantity + 1)}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="icon" className="rounded-full w-10 h-10 bg-primary/20 hover:bg-primary/30 text-primary" onClick={() => handleAddToCart(medicine)}>
                            <ShoppingCart className="w-5 h-5"/>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  );
}

    
