
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pill, Stethoscope, Search, Upload, Bot, Gift, Clock, Truck, CreditCard, Star, Heart, Eye, Bone, Sun, Dog, Thermometer } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useRef, useState } from "react";
import Autoplay from "embla-carousel-autoplay"
import Typewriter from 'typewriter-effect';
import { cn } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";

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
    gradient: "from-purple-500 via-pink-500 to-red-500",
  },
  {
    sponsor: "Wellness Co",
    title: "Organic Skincare",
    subtitle: "Upto 30% off",
    gradient: "from-green-400 via-cyan-500 to-blue-500",
  },
    {
    sponsor: "FitLife",
    title: "Protein Shakes",
    subtitle: "Combo offers available",
    gradient: "from-orange-400 via-red-500 to-pink-500",
  },
]

const trendingProducts = [
  { id: 'prod1', name: 'Product Name 1', image: 'https://picsum.photos/200/200?random=5', dataAiHint: "skincare product", price: 99.00 },
  { id: 'prod2', name: 'Product Name 2', image: 'https://picsum.photos/200/200?random=6', dataAiHint: "skincare product", price: 149.00 },
  { id: 'prod3', name: 'Product Name 3', image: 'https://picsum.photos/200/200?random=7', dataAiHint: "skincare product", price: 299.00 },
  { id: 'prod4', name: 'Product Name 4', image: 'https://picsum.photos/200/200?random=8', dataAiHint: "skincare product", price: 49.00 },
  { id: 'prod5', name: 'Product Name 5', image: 'https://picsum.photos/200/200?random=9', dataAiHint: "skincare product", price: 199.00 },
];

const categories = [
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


export default function HomePage() {
  const plugin = useRef(
      Autoplay({ delay: 3000, stopOnInteraction: true })
    )
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();
   const [activeCategory, setActiveCategory] = useState('Popular');

  const handleAddToCart = (product: typeof trendingProducts[0]) => {
    addToCart({ ...product, quantity: 1 });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  }

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
              <Card className={cn("overflow-hidden relative min-h-[200px] flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-br", card.gradient)}>
                <div className="relative z-10 flex flex-col justify-between h-full">
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
        <Input 
          placeholder={isSearchFocused ? '' : 'Search for medicines, doctors, and more...'}
          className={cn("pl-10", isSearchFocused && 'ring-2 ring-primary')}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
        {!isSearchFocused && (
          <div className="absolute left-10 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
            <span className="text-sm text-muted-foreground mr-1">Search for</span>
              <Typewriter
                options={{
                  strings: ['medicines...', 'Doctors...', 'Paracetamol...', 'Sunscreen...', 'and much more!'],
                  autoStart: true,
                  loop: true,
                  delay: 50,
                  deleteSpeed: 50,
                  wrapperClassName: 'text-sm text-muted-foreground',
                  cursorClassName: 'text-sm text-muted-foreground'
                }}
              />
          </div>
        )}
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
      
       {/* Categories Section */}
       <div>
        <h3 className="font-headline text-2xl font-bold mb-4">Shop by Category</h3>
        <div className="flex space-x-3 overflow-x-auto pb-4 -mx-4 px-4">
          {categories.map((category) => (
             <Link href="/order-medicines" key={category.name}>
              <button
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
            </Link>
          ))}
        </div>
      </div>

       {/* Trending Products Section */}
       <div>
        <h3 className="font-headline text-2xl font-bold mb-4">Trending Products</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {trendingProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden group">
              <Image src={product.image} alt={product.name} width={200} height={200} className="w-full h-32 object-cover" data-ai-hint={product.dataAiHint} />
              <CardContent className="p-3">
                <h4 className="text-sm font-semibold truncate">{product.name}</h4>
                <p className="text-xs text-muted-foreground">1 unit</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-sm">₹{product.price.toFixed(2)}</span>
                  <Button size="sm" variant="outline" onClick={() => handleAddToCart(product)}>Add</Button>
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
