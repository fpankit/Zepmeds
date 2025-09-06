
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pill, Stethoscope, Search, Upload, Bot, Gift, Clock, Truck, CreditCard, Star, Heart, Eye, Bone, Sun, Dog, Thermometer, Siren, PackageSearch, Minus, Plus, Sparkles, HeartPulse, Shield, Baby, Wind, MessageSquare } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useEffect, useRef, useState } from "react";
import Autoplay from "embla-carousel-autoplay"
import { cn } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";

const featureCards = [
    { title: "Medicine Delivery", description: "Order medicines online", icon: Pill, href: "/order-medicines", color: "bg-blue-500" },
    { title: "AI Symptom Checker", description: "Get instant health insights", icon: Bot, href: "/symptom-checker", color: "bg-sky-500" },
    { title: "Echo Doc AI", description: "Talk to a medical AI", icon: MessageSquare, href: "/echo-doc", color: "bg-orange-500" },
    { title: "Consult a Doctor", description: "Online consultation", icon: Stethoscope, href: "/doctor", color: "bg-green-500" },
    { title: "Emergency Services", description: "24/7 critical support", icon: Siren, href: "/emergency", color: "bg-red-500" },
    { title: "Track Order", description: "Check your delivery status", icon: PackageSearch, href: "/order-status", color: "bg-teal-500" },
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

const allProducts = [
  // Popular
  { id: 'prod1', name: 'Paracetamol 500mg', image: 'https://picsum.photos/200/200?random=5', dataAiHint: "medicine pills", price: 25.00, category: 'Popular' },
  { id: 'prod2', name: 'Antiseptic Liquid', image: 'https://picsum.photos/200/200?random=6', dataAiHint: "medicine bottle", price: 80.00, category: 'Popular' },
  { id: 'prod3', name: 'Digital Thermometer', image: 'https://picsum.photos/200/200?random=7', dataAiHint: "thermometer device", price: 250.00, category: ['Popular', 'Devices'] },
  // Skin Care
  { id: 'prod4', name: 'Moisturizing Cream', image: 'https://picsum.photos/200/200?random=8', dataAiHint: "skincare product", price: 350.00, category: 'Skin Care' },
  { id: 'prod5', name: 'Acne Treatment Gel', image: 'https://picsum.photos/200/200?random=9', dataAiHint: "skincare product", price: 220.00, category: 'Skin Care' },
  { id: 'prod6', name: 'Vitamin C Serum', image: 'https://picsum.photos/200/200?random=10', dataAiHint: "skincare product", price: 550.00, category: 'Skin Care' },
  // Supplements
  { id: 'prod7', name: 'Multivitamin Tablets', image: 'https://picsum.photos/200/200?random=11', dataAiHint: "medicine bottle", price: 400.00, category: 'Supplements' },
  { id: 'prod8', name: 'Omega-3 Capsules', image: 'https://picsum.photos/200/200?random=12', dataAiHint: "medicine pills", price: 600.00, category: 'Supplements' },
  { id: 'prod9', name: 'Calcium + Vit D', image: 'https://picsum.photos/200/200?random=13', dataAiHint: "medicine bottle", price: 300.00, category: 'Supplements' },
  // Eye Care
  { id: 'prod10', name: 'Lubricating Eye Drops', image: 'https://picsum.photos/200/200?random=14', dataAiHint: "eye drops", price: 150.00, category: 'Eye Care' },
  { id: 'prod11', name: 'Contact Lens Solution', image: 'https://picsum.photos/200/200?random=15', dataAiHint: "medicine bottle", price: 280.00, category: 'Eye Care' },
  // Dental
  { id: 'prod12', name: 'Sensitive Toothpaste', image: 'https://picsum.photos/200/200?random=16', dataAiHint: "toothpaste tube", price: 120.00, category: 'Dental' },
  { id: 'prod13', name: 'Mouthwash 500ml', image: 'https://picsum.photos/200/200?random=17', dataAiHint: "medicine bottle", price: 180.00, category: 'Dental' },
  // Pain Relief
  { id: 'prod14', name: 'Pain Relief Spray', image: 'https://picsum.photos/200/200?random=18', dataAiHint: "spray can", price: 190.00, category: 'Pain Relief' },
  { id: 'prod15', name: 'Ibuprofen 400mg', image: 'https://picsum.photos/200/200?random=19', dataAiHint: "medicine pills", price: 40.00, category: 'Pain Relief' },
  { id: 'prod16', name: 'Hot/Cold Gel Pack', image: 'https://picsum.photos/200/200?random=20', dataAiHint: "gel pack", price: 250.00, category: 'Pain Relief' },
  // Summer Care
  { id: 'prod17', name: 'Sunscreen SPF 50', image: 'https://picsum.photos/200/200?random=21', dataAiHint: "sunscreen bottle", price: 499.00, category: 'Summer Care' },
  { id: 'prod18', name: 'Aloe Vera Gel', image: 'https://picsum.photos/200/200?random=22', dataAiHint: "skincare product", price: 180.00, category: 'Summer Care' },
  { id: 'prod19', name: 'Oral Rehydration Salts', image: 'https://picsum.photos/200/200?random=23', dataAiHint: "medicine sachet", price: 15.00, category: 'Summer Care' },
  // Pet Care
  { id: 'prod20', name: 'Flea & Tick Shampoo', image: 'https://picsum.photos/200/200?random=24', dataAiHint: "pet shampoo", price: 350.00, category: 'Pet Care' },
  { id: 'prod21', name: 'Dog Deworming Tablets', image: 'https://picsum.photos/200/200?random=25', dataAiHint: "medicine pills", price: 200.00, category: 'Pet Care' },
  // Devices
  { id: 'prod22', name: 'Blood Pressure Monitor', image: 'https://picsum.photos/200/200?random=26', dataAiHint: "medical device", price: 1500.00, category: 'Devices' },
  { id: 'prod23', name: 'Glucometer', image: 'https://picsum.photos/200/200?random=27', dataAiHint: "medical device", price: 800.00, category: 'Devices' },
  // More products to reach 26
  { id: 'prod24', name: 'Hand Sanitizer', image: 'https://picsum.photos/200/200?random=28', dataAiHint: "sanitizer bottle", price: 50.00, category: 'Popular' },
  { id: 'prod25', name: 'Band-Aid Strips (100s)', image: 'https://picsum.photos/200/200?random=29', dataAiHint: "bandages box", price: 120.00, category: 'Popular' },
  { id: 'prod26', name: 'Medicated Soap', image: 'https://picsum.photos/200/200?random=30', dataAiHint: "soap bar", price: 70.00, category: 'Skin Care' },
];

const categories = [
  { name: 'All', icon: Pill, href: '/order-medicines', gradient: 'from-blue-500 to-blue-700' },
  { name: 'Popular', icon: Star, href: '/order-medicines', gradient: 'from-yellow-400 to-orange-500' },
  { name: 'Skin Care', icon: Sparkles, href: '/order-medicines', gradient: 'from-pink-500 to-rose-500' },
  { name: 'Supplements', icon: HeartPulse, href: '/order-medicines', gradient: 'from-green-500 to-teal-500' },
  { name: 'Eye Care', icon: Eye, href: '/order-medicines', gradient: 'from-cyan-500 to-sky-500' },
  { name: 'Dental', icon: Shield, href: '/order-medicines', gradient: 'from-indigo-500 to-purple-600' },
  { name: 'Pain Relief', icon: Wind, href: '/order-medicines', gradient: 'from-red-500 to-orange-600' },
  { name: 'Summer Care', icon: Sun, href: '/order-medicines', gradient: 'from-orange-400 to-amber-500' },
  { name: 'Pet Care', icon: Dog, href: '/order-medicines', gradient: 'from-lime-500 to-green-600' },
  { name: 'Devices', icon: Thermometer, href: '/order-medicines', gradient: 'from-slate-500 to-gray-600' },
];


const trendingProducts = allProducts.filter(p => Array.isArray(p.category) ? p.category.includes('Popular') : p.category === 'Popular');

const AnimatedPlaceholder = () => {
    const placeholders = ['medicines...', 'Paracetamol...', 'Sunscreen...', 'and much more!'];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prevIndex) => (prevIndex + 1) % placeholders.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [placeholders.length]);

    return (
        <div className="absolute left-10 top-1/2 -translate-y-1/2 flex items-center pointer-events-none h-full">
            <span className="text-sm text-muted-foreground mr-1">Search for</span>
            <AnimatePresence mode="wait">
                <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="text-sm text-muted-foreground"
                >
                    {placeholders[index]}
                </motion.span>
            </AnimatePresence>
        </div>
    );
}

export default function HomePage() {
  const plugin = useRef(
      Autoplay({ delay: 3000, stopOnInteraction: true })
    )
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { cart, addToCart, updateQuantity } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (product: typeof allProducts[0]) => {
    addToCart({ ...product, quantity: 1 });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  }

  const FeatureCard = ({ card }: { card: typeof featureCards[0] }) => {
    const content = (
      <Card className="h-full hover:bg-card/60 transition-colors flex flex-col justify-center p-4 text-center items-center aspect-square">
        <div className={cn("p-3 rounded-xl", card.color)}>
          <card.icon className="h-8 w-8 text-white" />
        </div>
        <div className="mt-2">
          <h3 className="font-semibold text-sm">{card.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
        </div>
      </Card>
    );
    return (
      <Link href={card.href}>
        {content}
      </Link>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-8 overflow-x-hidden">

       <div>
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
      </div>
      
       <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
        <Input 
          placeholder=""
          className={cn("pl-10", isSearchFocused && 'ring-2 ring-primary')}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
        {!isSearchFocused && <AnimatedPlaceholder />}
      </div>

      {/* Shop by Category */}
       <div>
        <h3 className="font-headline text-2xl font-bold mb-4">Shop by Category</h3>
        <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4">
          {categories.map((category) => (
            <Link href={category.href} key={category.name} className="flex-shrink-0 w-20">
              <div className="flex flex-col items-center gap-2">
                <div className={cn("w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br", category.gradient)}>
                  <category.icon className="h-8 w-8 text-white" />
                </div>
                <p className="text-xs font-medium text-center">{category.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>


       {/* Feature Cards */}
       <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {featureCards.map((card) => (
          <FeatureCard key={card.title} card={card} />
        ))}
      </div>
      

       {/* Products Section */}
       <div>
        <h3 className="font-headline text-2xl font-bold mb-4">Trending Products</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {trendingProducts.map((product) => {
            const cartItem = cart.find(item => item.id === product.id);
            return (
              <Card key={product.id} className="overflow-hidden group">
                <CardContent className="p-3">
                  <h4 className="text-sm font-semibold truncate">{product.name}</h4>
                  <p className="text-xs text-muted-foreground">1 unit</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-sm">₹{product.price.toFixed(2)}</span>
                    {cartItem ? (
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-6 text-center">{cartItem.quantity}</span>
                        <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => handleAddToCart(product)}>Add</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
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
