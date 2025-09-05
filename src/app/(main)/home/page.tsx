
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pill, Stethoscope, Search, Upload, Bot, Gift, Clock, Truck, CreditCard } from "lucide-react";
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
import Typewriter from 'typewriter-effect';

const featureCards = [
    { title: "Medicine Delivery", description: "Order medicines online", icon: Pill, href: "/order-medicines" },
    { title: "Upload Prescription", description: "Get medicines as prescribed", icon: Upload, href: "/order-medicines" },
    { title: "AI Symptom Checker", description: "Get instant health insights", icon: Bot, href: "/symptom-checker" },
    { title: "Consult a Doctor", description: "Online consultation", icon: Stethoscope, href: "/doctor" },
];

const offerCards = [
  {
    title: "Exclusive Offers",
    description: "Use code ZEPMEDS for 20% off",
    icon: Gift,
    buttonText: "Shop Now",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
  },
  {
    title: "Cashback on Card Payments",
    description: "Get 5% cashback with any card",
    icon: CreditCard,
    buttonText: "Shop Now",
    buttonColor: "bg-green-600 hover:bg-green-700",
  },
  {
    title: "Buy Now, Pay Later",
    description: "Zero interest EMI available",
    icon: Clock,
    buttonText: "Shop Now",
    buttonColor: "bg-orange-500 hover:bg-orange-600",
  },
  {
    title: "Free Express Delivery",
    description: "On orders above ₹500",
    icon: Truck,
    buttonText: "Shop Now",
    buttonColor: "bg-sky-500 hover:bg-sky-600",
  },
];

const sponsorCards = [
  {
    sponsor: "HealthPlus",
    title: "Vitamin Supplements",
    subtitle: "Buy 2 Get 1 Free",
    image: "https://picsum.photos/800/400?random=1",
    dataAiHint: "pills medication",
  },
  {
    sponsor: "Wellness Co",
    title: "Organic Skincare",
    subtitle: "Upto 30% off",
    image: "https://picsum.photos/800/400?random=2",
    dataAiHint: "skincare nature",
  },
    {
    sponsor: "FitLife",
    title: "Protein Shakes",
    subtitle: "Combo offers available",
    image: "https://picsum.photos/800/400?random=3",
    dataAiHint: "fitness gym",
  },
]


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
          {sponsorCards.map((card, index) => (
            <CarouselItem key={index}>
              <Card className="overflow-hidden relative min-h-[200px] flex flex-col justify-between p-6 rounded-2xl">
                <Image src={card.image} alt={card.title} fill className="object-cover z-0" data-ai-hint={card.dataAiHint} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
                <div className="relative z-20 flex flex-col justify-between h-full">
                  <div className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full self-start backdrop-blur-sm">
                    Sponsored by {card.sponsor}
                  </div>
                   <div className="text-white">
                    <h2 className="text-2xl font-bold">{card.title}</h2>
                    <p>{card.subtitle}</p>
                  </div>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2"/>
      </Carousel>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <div className="pl-10 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background flex items-center text-muted-foreground">
          <Typewriter
              options={{
                strings: ['Search for medicines...', 'Doctors...', 'Paracetamol...', 'Sunscreen...', 'and much more!'],
                autoStart: true,
                loop: true,
                delay: 50,
                deleteSpeed: 50,
                wrapperClassName: 'text-sm text-muted-foreground',
                cursorClassName: 'text-sm text-muted-foreground'
              }}
            />
        </div>
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
      
       {/* Trending Products Section */}
       <div>
        <h3 className="font-headline text-2xl font-bold mb-4">Trending Products</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="overflow-hidden group">
              <Image src={`https://picsum.photos/200/200?random=${i+5}`} alt="Essential Product" width={200} height={200} className="w-full h-32 object-cover" data-ai-hint="skincare product" />
              <CardContent className="p-3">
                <h4 className="text-sm font-semibold truncate">Product Name {i+1}</h4>
                <p className="text-xs text-muted-foreground">1 unit</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-sm">₹99.00</span>
                  <Button size="sm" variant="outline">Add</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
       </div>

        {/* Offers Section */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offerCards.map((offer) => (
            <Card key={offer.title} className="p-4 flex items-center justify-between bg-card/80">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-700/50 rounded-lg">
                   <offer.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{offer.title}</h3>
                  <p className="text-sm text-muted-foreground">{offer.description}</p>
                </div>
              </div>
              <Button className={`${offer.buttonColor} text-white`}>{offer.buttonText}</Button>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
}
