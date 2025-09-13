
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pill, Stethoscope, Search, Bot, Gift, CreditCard, Star, Minus, Plus, MessageSquare, Siren, PackageSearch, HeartPulse, QrCode } from "lucide-react";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

const featureCards = [
    { title: "Medicine Delivery", description: "Order medicines online", icon: Pill, href: "/order-medicines", color: "bg-blue-500" },
    { title: "Consult a Doctor", description: "Online consultation", icon: Stethoscope, href: "/doctor", color: "bg-green-500" },
    { title: "First Aid Help", description: "Emergency tutorials", icon: HeartPulse, href: "/first-aid", color: "bg-yellow-500" },
    { title: "Emergency Services", description: "24/7 critical support", icon: Siren, href: "/emergency", color: "bg-red-500" },
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

const trendingProducts = [
  { id: 'prod1', name: 'Paracetamol 500mg', price: 25.00, category: 'Popular', image: 'https://picsum.photos/200/200?random=1', dataAiHint: 'medicine pills', isRx: false },
  { id: 'prod2', name: 'Antiseptic Liquid', price: 80.00, category: 'Popular', image: 'https://picsum.photos/200/200?random=2', dataAiHint: 'antiseptic bottle', isRx: false },
  { id: 'prod3', name: 'Amoxicillin 250mg', price: 150.00, category: ['Popular', 'Antibiotics'], image: 'https://picsum.photos/200/200?random=3', dataAiHint: 'antibiotic pills', isRx: true },
  { id: 'prod4', name: 'Moisturizing Cream', price: 350.00, category: 'Skin Care', image: 'https://picsum.photos/200/200?random=4', dataAiHint: 'skincare product', isRx: false },
  { id: 'prod5', name: 'Atorvastatin 10mg', price: 220.00, category: 'Heart', image: 'https://picsum.photos/200/200?random=5', dataAiHint: 'heart medicine', isRx: true },
  { id: 'prod6', name: 'Band-Aid Pack', price: 50.00, category: 'Popular', image: 'https://picsum.photos/200/200?random=6', dataAiHint: 'bandages', isRx: false },
];

export default function HomePage() {
  const { cart, addToCart, updateQuantity } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (product: typeof trendingProducts[0]) => {
    addToCart({ ...product, quantity: 1 });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  }

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-8 overflow-x-hidden">

       <div>
        <Carousel className="w-full">
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
          placeholder="Search for medicines, and more!"
          className="pl-10"
        />
      </div>

       {/* Feature Cards */}
       <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {featureCards.map((card) => (
          <Link href={card.href} key={card.title} prefetch={false}>
            <Card className="h-full hover:bg-card/60 transition-colors flex flex-col justify-center p-2 text-center items-center aspect-square">
              <div className={cn("p-3 rounded-xl", card.color)}>
                <card.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="mt-2">
                <h3 className="font-semibold text-xs sm:text-sm">{card.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 hidden sm:block">{card.description}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
      

       {/* Products Section */}
       <div>
        <h3 className="font-headline text-2xl font-bold mb-4">Trending Products</h3>
        <div className="grid grid-cols-2 gap-4">
          {trendingProducts.map((product) => {
            const cartItem = cart.find(item => item.id === product.id);
            return (
              <Card key={product.id} className="overflow-hidden">
                <CardContent className="p-0 flex flex-col justify-between h-full">
                  <div>
                    <div className="relative">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={200}
                        height={200}
                        className="w-full h-32 object-cover"
                        data-ai-hint={product.dataAiHint}
                      />
                      {product.isRx && (
                          <Badge variant="destructive" className="absolute top-2 left-2">Rx</Badge>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="font-bold text-sm truncate">{product.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">1 unit</p>
                      <span className="font-bold text-md mt-2 block">₹{product.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="p-3 pt-0">
                     {cartItem ? (
                       <div className="flex items-center justify-center gap-1">
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-bold text-md">{cartItem.quantity}</span>
                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" className="w-full" variant="outline" onClick={() => handleAddToCart(product)}>Add</Button>
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
