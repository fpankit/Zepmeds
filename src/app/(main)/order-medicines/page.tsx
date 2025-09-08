
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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const categories = [
  { name: 'All', icon: Pill, gradient: 'from-blue-500 to-cyan-400' },
  { name: 'General Health', icon: Heart, gradient: 'from-green-500 to-teal-400' },
  { name: 'Pain Relief', icon: Bone, gradient: 'from-red-500 to-orange-400' },
  { name: 'Skin Care', icon: Sun, gradient: 'from-yellow-500 to-amber-400' },
  { name: 'Eye Care', icon: Eye, gradient: 'from-indigo-500 to-purple-400' },
  { name: 'Pet Care', icon: Dog, gradient: 'from-pink-500 to-rose-400' },
  { name: 'Devices', icon: Thermometer, gradient: 'from-gray-500 to-slate-400' },
];

const medicineCategories = [
  {
    name: "General Health",
    medicines: [
      {
        id: 'med1',
        name: 'Vitamin C Tablets',
        description: 'Immunity Booster',
        price: 280,
        oldPrice: 350,
        discount: '20% OFF',
        rating: 4.5,
        image: "https://picsum.photos/200/200?random=11",
        dataAiHint: "medicine pills"
      },
      {
        id: 'med2',
        name: 'Multivitamin Capsules',
        description: 'Daily Nutrition',
        price: 410,
        oldPrice: 450,
        discount: '9% OFF',
        rating: 4.7,
        image: "https://picsum.photos/200/200?random=12",
        dataAiHint: "medicine pills"
      },
      {
        id: 'gh3',
        name: 'Omega-3 Fish Oil',
        description: 'Heart and Brain Health',
        price: 650,
        oldPrice: 720,
        discount: '10% OFF',
        rating: 4.8,
        image: "https://picsum.photos/200/200?random=13",
        dataAiHint: "medicine pills"
      },
      {
        id: 'gh4',
        name: 'Iron & Folic Acid',
        description: 'For Healthy Blood',
        price: 180,
        oldPrice: 200,
        discount: '10% OFF',
        rating: 4.6,
        image: "https://picsum.photos/200/200?random=14",
        dataAiHint: "pine cones"
      },
      {
        id: 'gh5',
        name: 'Probiotic Capsules',
        description: 'Digestive Health',
        price: 550,
        oldPrice: 600,
        discount: '8% OFF',
        rating: 4.7,
        image: "https://picsum.photos/200/200?random=15",
        dataAiHint: "snowy mountain"
      },
      {
        id: 'gh6',
        name: 'Calcium + Vitamin D3',
        description: 'For Strong Bones',
        price: 320,
        oldPrice: 380,
        discount: '16% OFF',
        rating: 4.5,
        image: "https://picsum.photos/200/200?random=16",
        dataAiHint: "medicine pills"
      },
      {
        id: 'gh7',
        name: 'Green Tea Extract',
        description: 'Antioxidant Support',
        price: 450,
        oldPrice: 500,
        discount: '10% OFF',
        rating: 4.4,
        image: "https://picsum.photos/200/200?random=17",
        dataAiHint: "tea product"
      },
    ]
  },
  {
    name: "Pain Relief",
    medicines: [
      {
        id: 'med3',
        name: 'Pain Relief Gel',
        description: 'Fast Relief',
        price: 220,
        oldPrice: 250,
        discount: '12% OFF',
        rating: 4.0,
        image: "https://picsum.photos/200/200?random=18",
        dataAiHint: "medicine product"
      },
      {
        id: 'pr2',
        name: 'Ibuprofen 400mg',
        description: 'Pain and Inflammation',
        price: 90,
        oldPrice: 100,
        discount: '10% OFF',
        rating: 4.8,
        image: "https://picsum.photos/200/200?random=19",
        dataAiHint: "medicine pills"
      },
      {
        id: 'pr3',
        name: 'Paracetamol 650mg',
        description: 'Fever and Pain',
        price: 45,
        oldPrice: 50,
        discount: '10% OFF',
        rating: 4.9,
        image: "https://picsum.photos/200/200?random=20",
        dataAiHint: "medicine pills"
      },
      {
        id: 'pr4',
        name: 'Headache Relief Balm',
        description: 'Quick Action',
        price: 70,
        oldPrice: 85,
        discount: '18% OFF',
        rating: 4.5,
        image: "https://picsum.photos/200/200?random=21",
        dataAiHint: "medicine product"
      },
      {
        id: 'pr5',
        name: 'Hot & Cold Pack',
        description: 'Reusable',
        price: 250,
        oldPrice: 300,
        discount: '17% OFF',
        rating: 4.6,
        image: "https://picsum.photos/200/200?random=22",
        dataAiHint: "medical product"
      },
      {
        id: 'pr6',
        name: 'Knee Support Brace',
        description: 'For Joint Pain',
        price: 400,
        oldPrice: 500,
        discount: '20% OFF',
        rating: 4.4,
        image: "https://picsum.photos/200/200?random=23",
        dataAiHint: "medical product"
      },
      {
        id: 'pr7',
        name: 'Diclofenac Spray',
        description: 'Instant Relief',
        price: 180,
        oldPrice: 210,
        discount: '14% OFF',
        rating: 4.7,
        image: "https://picsum.photos/200/200?random=24",
        dataAiHint: "medicine bottle"
      },
    ]
  },
  {
    name: "Skin Care",
    medicines: [
       {
        id: 'med4',
        name: 'Sunscreen SPF 50',
        description: 'Broad spectrum',
        price: 499,
        oldPrice: 600,
        discount: '17% OFF',
        rating: 4.8,
        image: "https://picsum.photos/200/200?random=25",
        dataAiHint: "skincare product"
      },
      {
        id: 'sc2',
        name: 'Cetaphil Cleanser',
        description: 'Gentle on skin',
        price: 450,
        oldPrice: 520,
        discount: '13% OFF',
        rating: 4.9,
        image: "https://picsum.photos/200/200?random=26",
        dataAiHint: "skincare product"
      },
      {
        id: 'sc3',
        name: 'Hyaluronic Acid Serum',
        description: 'For hydration',
        price: 899,
        oldPrice: 1100,
        discount: '18% OFF',
        rating: 4.7,
        image: "https://picsum.photos/200/200?random=27",
        dataAiHint: "skincare product"
      },
      {
        id: 'sc4',
        name: 'Acne Pimple Patch',
        description: 'Overnight treatment',
        price: 350,
        oldPrice: 400,
        discount: '12% OFF',
        rating: 4.6,
        image: "https://picsum.photos/200/200?random=28",
        dataAiHint: "skincare product"
      },
      {
        id: 'sc5',
        name: 'Vitamin C Face Serum',
        description: 'For glowing skin',
        price: 750,
        oldPrice: 900,
        discount: '17% OFF',
        rating: 4.8,
        image: "https://picsum.photos/200/200?random=29",
        dataAiHint: "skincare product"
      },
      {
        id: 'sc6',
        name: 'Moisturizing Lotion',
        description: 'For dry skin',
        price: 380,
        oldPrice: 420,
        discount: '10% OFF',
        rating: 4.5,
        image: "https://picsum.photos/200/200?random=30",
        dataAiHint: "skincare product"
      },
      {
        id: 'sc7',
        name: 'Anti-Fungal Cream',
        description: 'For skin infections',
        price: 120,
        oldPrice: 140,
        discount: '14% OFF',
        rating: 4.7,
        image: "https://picsum.photos/200/200?random=31",
        dataAiHint: "medicine product"
      },
    ]
  },
  {
    name: "Devices",
    medicines: [
        {
            id: 'dev1',
            name: 'Digital Thermometer',
            description: 'Accurate Reading',
            price: 399,
            oldPrice: 500,
            discount: '20% OFF',
            rating: 4.2,
            image: "https://picsum.photos/200/200?random=32",
            dataAiHint: "thermometer device"
        }
    ]
  }
];

const DynamicPrescriptionUploader = dynamic(
  () => import('@/components/features/prescription-uploader').then(mod => mod.PrescriptionUploader),
  {
    ssr: false,
    loading: () => <Skeleton className="h-48 w-full" />
  }
)

export default function OrderMedicinesPage() {
  const [showUploader, setShowUploader] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const uploaderRef = useRef<HTMLDivElement>(null);
  const { cart, addToCart, updateQuantity } = useCart();
  const { toast } = useToast();

  const handleUploadClick = () => {
    setShowUploader(true);
    setTimeout(() => {
        uploaderRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  const handleAddToCart = (medicine: (typeof medicineCategories)[0]['medicines'][0]) => {
    addToCart({ ...medicine, quantity: 1, name: medicine.name, price: medicine.price, image: medicine.image, dataAiHint: medicine.dataAiHint });
    toast({
      title: "Added to cart",
      description: `${medicine.name} has been added to your cart.`,
    });
  }

  const filteredCategories =
    selectedCategory === 'All'
      ? medicineCategories
      : medicineCategories.filter((cat) => cat.name === selectedCategory);

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
      
      {showUploader && <div ref={uploaderRef}><DynamicPrescriptionUploader /></div>}

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Categories</h2>
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
          <div className="flex w-max space-x-4">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={cn(
                  'flex flex-col items-center justify-center space-y-2 w-20 h-20 rounded-2xl text-center p-2 transition-all duration-200 transform hover:scale-105',
                   'bg-gradient-to-br text-white shadow-lg',
                   category.gradient,
                  selectedCategory === category.name
                    ? 'ring-2 ring-offset-2 ring-offset-background ring-white'
                    : 'opacity-80 hover:opacity-100'
                )}
              >
                <category.icon className="h-7 w-7" />
                <span className="text-xs font-bold">{category.name}</span>
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <div className="space-y-8">
        {filteredCategories.map((category) => (
            <div key={category.name}>
                <h2 className="text-xl font-bold mb-4">{category.name}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {category.medicines.map((medicine) => {
                    const cartItem = cart.find(item => item.id === medicine.id);
                    return (
                    <Card key={medicine.id} className="overflow-hidden">
                        <CardContent className="p-4 flex gap-4">
                             <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-muted/30 rounded-md">
                                <Image
                                    src={medicine.image}
                                    alt={medicine.name}
                                    fill
                                    className="object-cover rounded-md"
                                    data-ai-hint={medicine.dataAiHint}
                                />
                             </div>
                             <div className="flex flex-col flex-grow">
                                <h3 className="font-semibold text-base leading-tight">{medicine.name}</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {medicine.description}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                     <Badge variant="secondary" className="bg-background/70 backdrop-blur-sm">
                                        <Star className="w-3 h-3 mr-1 text-yellow-400 fill-yellow-400" />
                                        {medicine.rating}
                                    </Badge>
                                    <Badge variant="destructive" className="bg-gradient-to-r from-pink-500 to-red-500 text-white border-0">{medicine.discount}</Badge>
                                </div>
                                <div className="flex items-end justify-between mt-auto pt-2">
                                  <div className="flex items-baseline gap-2">
                                      <p className="font-bold text-lg">₹{medicine.price}</p>
                                      <p className="text-sm text-muted-foreground line-through">₹{medicine.oldPrice}</p>
                                  </div>
                                  {cartItem ? (
                                    <div className="flex items-center">
                                      <Button size="icon" variant="outline" className="h-8 w-8 rounded-r-none" onClick={() => updateQuantity(medicine.id, cartItem.quantity - 1)}>
                                        <Minus className="h-4 w-4" />
                                      </Button>
                                      <span className="w-8 text-center font-bold text-sm bg-background border-y border-input h-8 flex items-center justify-center">{cartItem.quantity}</span>
                                      <Button size="icon" variant="outline" className="h-8 w-8 rounded-l-none" onClick={() => updateQuantity(medicine.id, cartItem.quantity + 1)}>
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button size="sm" onClick={() => handleAddToCart(medicine)}>
                                        Add
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
        ))}
      </div>
    </div>
  );
}
