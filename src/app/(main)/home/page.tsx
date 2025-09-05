
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, Pill, Stethoscope, Search, Sparkles, ShoppingBag, Heart, Bone, Bot, Ambulance, Upload } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const featureCards = [
    { title: "Medicine Delivery", description: "Order medicines online", icon: Pill, href: "/order-medicines" },
    { title: "Upload Prescription", description: "Get medicines as prescribed", icon: Upload, href: "/order-medicines" },
    { title: "AI Symptom Checker", description: "Get instant health insights", icon: Bot, href: "/symptom-checker" },
    { title: "Consult a Doctor", description: "Online consultation", icon: Stethoscope, href: "/doctor" },
];

const categories = [
  { name: "Skin Care", icon: Sparkles },
  { name: "Supplements", icon: Pill },
  { name: "Eye & ENT Care", icon: Heart },
  { name: "Maternity Care", icon: ShoppingBag },
  { name: "Sexual Health", icon: Heart },
  { name: "Dental Care", icon: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1,12c0,5,4,9,9,9s9-4,9-9s-4-9-9-9S1,7,1,12z M10,16c-3,0-5-2-5-4s2-4,5-4c2,0,3,1,3,2c0,2-2,2-4,2c-1,0-2-1-2-1 M14,16c3,0,5-2,5-4s-2-4-5-4c-2,0-3,1-3,2c0,2,2,2,4,2c1,0,2-1,2-1"/></svg> },
  { name: "Pain Relief", icon: Bone },
  { name: "Generic Medicines", icon: Pill },
];


export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-8">

      <Card className="overflow-hidden bg-gradient-to-r from-primary to-accent/80 p-6 flex flex-col justify-end min-h-[200px]">
        <div className="text-white">
          <h2 className="text-2xl font-bold">Diabetes Care</h2>
          <p>Free Blood Sugar Monitor</p>
        </div>
      </Card>
      
       {/* Feature Cards */}
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {featureCards.map((card) => (
          <Link href={card.href} key={card.title}>
            <Card className="h-full hover:bg-card/60 transition-colors flex flex-col justify-between p-4 text-center items-center aspect-square">
              <div className="p-3 bg-accent/10 rounded-lg">
                <card.icon className="h-8 w-8 text-accent" />
              </div>
              <div className="mt-2">
                <h3 className="font-semibold text-sm">{card.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </div>
            </Card>
          </Link>
        ))}
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
