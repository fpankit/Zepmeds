
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, Pill, Stethoscope, Search, Sparkles, ShoppingBag, Heart, Bone, Eye, Bot, Ambulance } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

const featureCards = [
    { title: "Order Medicines", description: "Quick & easy delivery", icon: Pill, href: "/order-medicines", cta: "Order Now" },
    { title: "AI Symptom Checker", description: "Get instant advice", icon: Bot, href: "/symptom-checker", cta: "Start Chat" },
    { title: "Consult a Doctor", description: "24/7 online consultation", icon: Stethoscope, href: "/doctor", cta: "Consult Now" },
    { title: "Emergency Service", description: "Fastest help available", icon: Ambulance, href: "#", cta: "Call Now" },
];

const categories = [
  { name: "Skin Care", icon: Sparkles },
  { name: "Supplements", icon: Pill },
  { name: "Eye & ENT Care", icon: Eye },
  { name: "Maternity Care", icon: ShoppingBag },
  { name: "Sexual Health", icon: Heart },
  { name: "Dental Care", icon: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1,12c0,5,4,9,9,9s9-4,9-9s-4-9-9-9S1,7,1,12z M10,16c-3,0-5-2-5-4s2-4,5-4c2,0,3,1,3,2c0,2-2,2-4,2c-1,0-2-1-2-1 M14,16c3,0,5-2,5-4s-2-4-5-4c-2,0-3,1-3,2c0,2,2,2,4,2c1,0,2-1,2-1"/></svg> },
  { name: "Pain Relief", icon: Bone },
  { name: "Generic Medicines", icon: Pill },
];


export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-8">
      
       {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search for medicines and wellness products" className="w-full rounded-full bg-muted pl-10 h-12" />
      </div>

       {/* Sponsors Carousel */}
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <Card className="overflow-hidden">
                  <Image
                    src={`https://picsum.photos/400/200?random=${index}`}
                    width={400}
                    height={200}
                    alt={`Sponsor ${index + 1}`}
                    className="w-full h-auto object-cover"
                    data-ai-hint="advertisement banner"
                  />
                </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Feature Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {featureCards.map((card) => (
          <Link href={card.href} key={card.title}>
            <Card className="h-full hover:bg-card/60 transition-colors flex flex-col justify-between p-4 text-center items-center">
              <card.icon className="h-10 w-10 text-accent mb-2" />
              <h3 className="font-semibold text-sm">{card.title}</h3>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Categories Section */}
      <div>
        <h3 className="font-headline text-2xl font-bold mb-4">Categories</h3>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {categories.map((category) => (
            <div key={category.name} className="flex flex-col items-center gap-2 text-center cursor-pointer group">
              <div className="p-4 bg-card rounded-full group-hover:bg-accent/20 transition-colors">
                <category.icon className="h-6 w-6 text-accent"/>
              </div>
              <span className="text-xs font-medium">{category.name}</span>
            </div>
          ))}
        </div>
      </div>
      
       {/* Essentials Section */}
       <div>
        <h3 className="font-headline text-2xl font-bold mb-4">Daily Essentials</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="overflow-hidden group">
              <Image src={`https://picsum.photos/200/200?random=${i}`} alt="Essential Product" width={200} height={200} className="w-full h-32 object-cover" data-ai-hint="skincare product" />
              <CardContent className="p-3">
                <h4 className="text-sm font-semibold truncate">Product Name {i+1}</h4>
                <p className="text-xs text-muted-foreground">1 unit</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-sm">$9.99</span>
                  <Button size="sm" variant="outline">Add</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
       </div>

    </div>
  );
}
