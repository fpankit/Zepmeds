
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
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { PrescriptionUploader } from '@/components/features/prescription-uploader';

const categories = [
  { name: 'All', icon: Pill, gradient: 'from-blue-500 to-blue-700' },
  { name: 'Popular', icon: Star, gradient: 'from-yellow-500 to-yellow-700' },
  { name: 'Skin Care', icon: Heart, gradient: 'from-pink-500 to-pink-700' },
  {
    name: 'Supplements',
    icon: Pill,
    gradient: 'from-green-500 to-green-700',
  },
  { name: 'Eye Care', icon: Eye, gradient: 'from-cyan-500 to-cyan-700' },
  { name: 'Dental', icon: Stethoscope, gradient: 'from-indigo-500 to-indigo-700' },
  { name: 'Pain Relief', icon: Bone, gradient: 'from-red-500 to-red-700' },
  {
    name: 'Summer Care',
    icon: Sun,
    gradient: 'from-orange-500 to-orange-700',
  },
  { name: 'Pet Care', icon: Dog, gradient: 'from-purple-500 to-purple-700' },
  {
    name: 'Devices',
    icon: Thermometer,
    gradient: 'from-gray-500 to-gray-700',
  },
];

const featuredMedicines = [
  {
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
  const [activeCategory, setActiveCategory] = useState('All');
  const [showUploader, setShowUploader] = useState(false);
  const uploaderRef = useRef<HTMLDivElement>(null);

  const handleUploadClick = () => {
    setShowUploader(true);
    setTimeout(() => {
        uploaderRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
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
            <h3 className="font-semibold">Add prescription and our</h3>
            <p className="text-sm text-muted-foreground">
              pharmacist will assist you!
            </p>
          </div>
        </div>
        <Button onClick={handleUploadClick}>Upload</Button>
      </Card>
      
      {showUploader && <div ref={uploaderRef}><PrescriptionUploader /></div>}

      <div>
        <h2 className="text-xl font-bold mb-4">Categories</h2>
        <div className="flex space-x-3 overflow-x-auto pb-4 -mx-4 px-4">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setActiveCategory(category.name)}
              className={cn(
                'flex flex-col items-center space-y-2 flex-shrink-0 w-20 transition-all',
                activeCategory === category.name ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div
                className={cn(
                  'w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br',
                  category.gradient,
                  activeCategory === category.name ? 'ring-2 ring-primary scale-105' : 'opacity-80'
                )}
              >
                <category.icon className="h-8 w-8 text-white" />
              </div>
              <span className="text-xs font-medium">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Featured Medicines</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {featuredMedicines.map((medicine, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4 flex gap-4">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={medicine.image}
                    alt={medicine.name}
                    width={100}
                    height={100}
                    className="object-cover rounded-md"
                    data-ai-hint={medicine.dataAiHint}
                  />
                  <div className="absolute top-1 left-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    {medicine.discount}
                  </div>
                </div>

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
                    <Button size="icon" className="rounded-full w-10 h-10 bg-primary/20 hover:bg-primary/30 text-primary">
                        <ShoppingCart className="w-5 h-5"/>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
