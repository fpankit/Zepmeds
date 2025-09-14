
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ArrowLeft, Loader2, Share2, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { useCart } from '@/context/cart-context';

const ProductDetailSkeleton = () => (
    <div className="p-4 space-y-6">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/4" />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-32" />
            </div>
            <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-20" />
            </div>
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
    </div>
)


export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { id } = params;

    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { addToCart } = useCart();
    
    useEffect(() => {
        if (!id) return;
        
        const fetchProduct = async () => {
            setIsLoading(true);
            try {
                const productDocRef = doc(db, 'products', id as string);
                const productDocSnap = await getDoc(productDocRef);

                if (productDocSnap.exists()) {
                    setProduct({ id: productDocSnap.id, ...productDocSnap.data() } as Product);
                } else {
                    toast({ variant: 'destructive', title: 'Product not found' });
                    router.push('/order-medicines');
                }
            } catch (error) {
                console.error("Error fetching product: ", error);
                toast({ variant: 'destructive', title: 'Failed to load product' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [id, router, toast]);

    const handleAddToCart = () => {
        if (product) {
            addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                imageUrl: product.imageUrl,
                isRx: product.isRx,
            });
            toast({
                title: `${product.name} added to cart`,
            });
        }
    };
    
    if (isLoading) {
        return (
             <div className="flex flex-col h-screen bg-background">
                <header className="sticky top-0 z-10 flex items-center p-4 bg-background border-b">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </header>
                <main className="flex-1 overflow-y-auto">
                    <ProductDetailSkeleton />
                </main>
            </div>
        )
    }

    if (!product) {
        return null; // Or a 'not found' component
    }

    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
            </header>

            <main className="flex-1 overflow-y-auto pb-24">
                <Card className="rounded-none border-0 shadow-none">
                    <CardContent className="p-0">
                         <Carousel className="w-full">
                            <CarouselContent>
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <CarouselItem key={index}>
                                        <Image 
                                            src={product.imageUrl || `https://picsum.photos/seed/${product.id}-${index}/600/600`}
                                            alt={product.name}
                                            width={600}
                                            height={600}
                                            className="w-full aspect-square object-cover"
                                            data-ai-hint={product.dataAiHint}
                                        />
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                             {/* Optional: Add Previous/Next if multiple images are supported */}
                        </Carousel>
                    </CardContent>
                </Card>
                
                <div className="p-4 space-y-6">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">{product.name}</h1>
                            <p className="text-muted-foreground mt-1">1 Tube of 100 Gm</p>
                        </div>
                        <Button variant="outline" size="icon">
                            <Share2 className="h-5 w-5" />
                        </Button>
                    </div>

                    <Card>
                        <CardContent className="p-4 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Manufacturer</p>
                                <p className="font-semibold">{product.manufacturer || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Salt Composition</p>
                                <p className="font-semibold">{product.saltComposition || 'None'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Accordion type="single" collapsible className="w-full space-y-3">
                        <AccordionItem value="item-1" className="rounded-lg border bg-card/50">
                            <AccordionTrigger className="p-4 font-semibold text-base">Key Information</AccordionTrigger>
                            <AccordionContent className="p-4 pt-0">
                                {product.keyInfo || 'No key information available for this product.'}
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2" className="rounded-lg border bg-card/50">
                            <AccordionTrigger className="p-4 font-semibold text-base">Directions of use</AccordionTrigger>
                            <AccordionContent className="p-4 pt-0">
                                 {product.directions || 'No directions for use available. Please consult your doctor.'}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 p-4 border-t bg-background">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">1 Tube of 100 Gm</p>
                        <p className="text-2xl font-bold">₹{product.price.toFixed(2)}</p>
                    </div>
                    <Button size="lg" className="w-1/2" onClick={handleAddToCart}>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Add to cart
                    </Button>
                </div>
            </footer>
        </div>
    );
}

