
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, Pill, Stethoscope, Search, Sparkles, Upload, Bot } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useRef } from "react";
import Autoplay from "embla-carousel-autoplay"

const featureCards = [
    { title: "Medicine Delivery", description: "Order medicines online", icon: Pill, href: "/order-medicines" },
    { title: "Upload Prescription", description: "Get medicines as prescribed", icon: Upload, href: "/order-medicines" },
    { title: "AI Symptom Checker", description: "Get instant health insights", icon: Bot, href: "/symptom-checker" },
    { title: "Consult a Doctor", description: "Online consultation", icon: Stethoscope, href: "/doctor" },
];


export default function HomePage() {
  const plugin = useRef(
      Autoplay({ delay: 3000, stopOnInteraction: true })
    )
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-8">

      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {Array.from({ length: 3 }).map((_, index) => (
            <CarouselItem key={index}>
              <Card className="overflow-hidden bg-gradient-to-r from-primary to-accent/80 p-6 flex flex-col justify-end min-h-[200px]">
                <div className="text-white">
                  <h2 className="text-2xl font-bold">Sponsor {index + 1}</h2>
                  <p>Check out our amazing sponsor!</p>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search for medicines, doctors, etc." className="pl-10" />
      </div>

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
