
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Pill,
  Stethoscope,
  Search,
  Gift,
  CreditCard,
  Star,
  Minus,
  Plus,
  MessageSquare,
  Siren,
  PackageSearch,
  HeartPulse,
  QrCode,
  BrainCircuit,
  Clock,
  Truck,
  Ambulance,
} from 'lucide-react';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/context/language-context';
import { SearchDialog } from '@/components/features/search-dialog';
import { VoiceOrderSheet } from '@/components/features/voice-order-sheet';

const featureCards = [
  {
    title: 'Medicine Delivery',
    description: 'Order medicines online',
    icon: Pill,
    href: '/order-medicines',
    color: 'bg-blue-500',
  },
  {
    title: 'Consult a Doctor',
    description: 'Online consultation',
    icon: Stethoscope,
    href: '/doctor',
    color: 'bg-green-500',
  },
  {
    title: 'AI Symptom Checker',
    description: 'Check your symptoms',
    icon: BrainCircuit,
    href: '/symptom-checker',
    color: 'bg-purple-500',
  },
  {
    title: 'First Aid Help',
    description: 'Emergency tutorials',
    icon: HeartPulse,
    href: '/first-aid',
    color: 'bg-yellow-500',
  },
  {
    title: 'Urgent Medicine',
    description: 'Find nearby chemists',
    icon: Ambulance,
    href: '/urgent-medicine',
    color: 'bg-teal-500',
  },
  {
    title: 'Emergency Services',
    description: '24/7 critical support',
    icon: Siren,
    href: '/emergency',
    color: 'bg-red-500',
  },
];

const offerCards = [
  {
    title: 'Exclusive Offers',
    description: 'Use code ZEPMEDS for 20% off',
    icon: Gift,
    buttonText: 'Shop Now',
    buttonClass: 'bg-indigo-600 hover:bg-indigo-700',
    iconContainerClass: 'bg-indigo-500/20',
    iconClass: 'text-indigo-400',
  },
  {
    title: 'Cashback on Card Payments',
    description: 'Get 5% cashback with any card',
    icon: CreditCard,
    buttonText: 'Shop Now',
    buttonClass: 'bg-green-600 hover:bg-green-700',
    iconContainerClass: 'bg-green-500/20',
    iconClass: 'text-green-400',
  },
  {
    title: 'Buy Now, Pay Later',
    description: 'Zero interest EMI available',
    icon: Clock,
    buttonText: 'Shop Now',
    buttonClass: 'bg-amber-600 hover:bg-amber-700',
    iconContainerClass: 'bg-amber-500/20',
    iconClass: 'text-amber-400',
  },
  {
    title: 'Free Express Delivery',
    description: 'On orders above ₹500',
    icon: Truck,
    buttonText: 'Shop Now',
    buttonClass: 'bg-blue-600 hover:bg-blue-700',
    iconContainerClass: 'bg-blue-500/20',
    iconClass: 'text-blue-400',
  },
];

const sponsorCards = [
  {
    sponsor: 'HealthPlus',
    title: 'Vitamin Supplements',
    subtitle: 'Buy 2 Get 1 Free',
    gradient: 'from-purple-500 via-pink-500 to-red-500',
  },
  {
    sponsor: 'Wellness Co',
    title: 'Organic Skincare',
    subtitle: 'Upto 30% off',
    gradient: 'from-green-400 via-cyan-500 to-blue-500',
  },
  {
    sponsor: 'FitLife',
    title: 'Protein Shakes',
    subtitle: 'Combo offers available',
    gradient: 'from-orange-400 via-red-500 to-pink-500',
  },
];

const trendingProducts = [
  {
    id: 'prod1',
    name: 'Paracetamol 500mg',
    price: 25.0,
    category: 'Popular',
    image: 'https://firebasestorage.googleapis.com/v0/b/zepmeds-admin-panel.appspot.com/o/images%2Fproducts%2Fprod1.png?alt=media',
    dataAiHint: 'medicine tablets',
    isRx: false,
  },
  {
    id: 'prod2',
    name: 'Antiseptic Liquid',
    price: 80.0,
    category: 'Popular',
    image: 'https://firebasestorage.googleapis.com/v0/b/zepmeds-admin-panel.appspot.com/o/images%2Fproducts%2Fprod2.png?alt=media',
    dataAiHint: 'antiseptic liquid',
    isRx: false,
  },
  {
    id: 'prod3',
    name: 'Amoxicillin 250mg',
    price: 150.0,
    category: 'Popular',
    image: 'https://firebasestorage.googleapis.com/v0/b/zepmeds-admin-panel.appspot.com/o/images%2Fproducts%2Fprod3.png?alt=media',
    dataAiHint: 'antibiotic medicine',
    isRx: true,
  },
  {
    id: 'prod4',
    name: 'Moisturizing Cream',
    price: 350.0,
    category: 'Skin Care',
    image: 'https://firebasestorage.googleapis.com/v0/b/zepmeds-admin-panel.appspot.com/o/images%2Fproducts%2Fprod4.png?alt=media',
    dataAiHint: 'skincare cream',
    isRx: false,
  },
  {
    id: 'prod5',
    name: 'Amlodipine 5mg',
    price: 220.0,
    category: 'Heart',
    image: 'https://firebasestorage.googleapis.com/v0/b/zepmeds-admin-panel.appspot.com/o/images%2Fproducts%2Fprod5.png?alt=media',
    dataAiHint: 'hypertension medicine',
    isRx: true,
  },
  {
    id: 'prod6',
    name: 'Band-Aid Pack',
    price: 50.0,
    category: 'Popular',
    image: 'https://firebasestorage.googleapis.com/v0/b/zepmeds-admin-panel.appspot.com/o/images%2Fproducts%2Fprod6.png?alt=media',
    dataAiHint: 'bandages pack',
    isRx: false,
  },
];

export default function HomePage() {
  const { cart, addToCart, updateQuantity } = useCart();
  const { toast } = useToast();
  const t = useTranslation();

  const handleAddToCart = (product: typeof trendingProducts[0]) => {
    addToCart({ ...product, quantity: 1 });
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-8 overflow-x-hidden">
      <div>
        <Carousel className="w-full">
          <CarouselContent>
            {sponsorCards.map((card, index) => (
              <CarouselItem key={index}>
                <Card
                  className={cn(
                    'overflow-hidden relative min-h-[200px] flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-br',
                    card.gradient
                  )}
                >
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
          <CarouselNext className="right-2" />
        </Carousel>
      </div>

      <div className="relative">
        <SearchDialog />
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {featureCards.map((card) => (
          <Link href={card.href} key={card.title} prefetch={false}>
            <Card className="h-full hover:bg-card/60 transition-colors flex flex-col justify-center p-2 text-center items-center aspect-square">
              <div className={cn('p-3 rounded-xl', card.color)}>
                <card.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="mt-2">
                <h3 className="font-semibold text-xs sm:text-sm">
                  {card.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                  {card.description}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Products Section */}
      <div>
        <h3 className="font-headline text-2xl font-bold mb-4">
          {t('home.trendingProducts')}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {trendingProducts.map((product) => {
            const cartItem = cart.find((item) => item.id === product.id);
            return (
              <Card key={product.id} className="overflow-hidden">
                <CardContent className="p-0 flex flex-col justify-between h-full">
                  <div>
                    <div className="w-full h-32 bg-muted" />
                    <div className="p-3">
                      {product.isRx && (
                        <Badge variant="destructive" className="mb-2">
                          Rx
                        </Badge>
                      )}
                      <h4 className="font-bold text-sm truncate">
                        {product.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        1 unit
                      </p>
                      <span className="font-bold text-md mt-2 block">
                        ₹{product.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 pt-0">
                    {cartItem ? (
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(product.id, cartItem.quantity - 1)
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-bold text-md">
                          {cartItem.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(product.id, cartItem.quantity + 1)
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full"
                        variant="outline"
                        onClick={() => handleAddToCart(product)}
                      >
                        Add
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Special Offers Section */}
      <div>
        <h3 className="font-headline text-2xl font-bold mb-4">
          {t('home.specialOffers')}
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {offerCards.map((offer) => (
            <Card
              key={offer.title}
              className="p-4 flex items-center justify-between bg-card/80 transition-all hover:bg-card/90 hover:scale-[1.02]"
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn('p-3 rounded-lg', offer.iconContainerClass)}
                >
                  <offer.icon className={cn('h-6 w-6', offer.iconClass)} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">
                    {offer.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {offer.description}
                  </p>
                </div>
              </div>
              <Button
                className={cn('text-white text-xs h-8 px-3', offer.buttonClass)}
                size="sm"
              >
                <offer.icon className="h-4 w-4 mr-2" /> {offer.buttonText}
              </Button>
            </Card>
          ))}
        </div>
      </div>
      <VoiceOrderSheet />
    </div>
  );
}
