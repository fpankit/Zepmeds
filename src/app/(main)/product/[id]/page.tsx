
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
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { useCart } from '@/context/cart-context';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

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
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addToCart, cart, updateQuantity } = useCart();
    
    useEffect(() => {
        if (!id) return;
        
        const fetchProduct = async () => {
            setIsLoading(true);
            try {
                const productDocRef = doc(db, 'products', id as string);
                const productDocSnap = await getDoc(productDocRef);

                if (productDocSnap.exists()) {
                    const productData = { id: productDocSnap.id, ...productDocSnap.data() } as Product;
                    setProduct(productData);

                    // Fetch related products
                    if (productData.category) {
                        const relatedQuery = query(
                            collection(db, 'products'),
                            where('category', '==', productData.category),
                            where('id', '!=', productData.id),
                            limit(4)
                        );
                        const relatedSnapshot = await getDocs(relatedQuery);
                        const related = relatedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
                        setRelatedProducts(related);
                    }

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
    
    const cartItem = product ? cart.find(item => item.id === product.id) : null;
    
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

    const packageInfo = `1 ${product.packageType || 'unit'} of ${product.packageUnit || ''}`.trim();

    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                 <h1 className="text-lg font-semibold truncate">{product.name}</h1>
                <Button variant="ghost" size="icon">
                    <Share2 className="h-5 w-5" />
                </Button>
            </header>

            <main className="flex-1 overflow-y-auto pb-24">
                <div className="p-4">
                    <Carousel className="w-full max-w-xs mx-auto">
                        <CarouselContent>
                            {Array.from({ length: 3 }).map((_, index) => (
                                <CarouselItem key={index}>
                                    <Image 
                                        src={product.imageUrl || `https://picsum.photos/seed/${product.id}-${index}/600/600`}
                                        alt={product.name}
                                        width={600}
                                        height={600}
                                        className="w-full aspect-square object-cover rounded-lg"
                                        data-ai-hint={product.dataAiHint}
                                    />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        {/* Optional: Add Previous/Next if multiple images are supported */}
                    </Carousel>
                </div>
                
                <div className="p-4 pt-0 space-y-6">
                    <div>
                         {product.isRx && <Badge variant="destructive" className="mb-2">Rx Prescription Required</Badge>}
                        <h2 className="text-2xl font-bold">{product.name}</h2>
                        <p className="text-muted-foreground mt-1">{packageInfo}</p>
                    </div>

                    <Card>
                        <CardContent className="p-4 grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Manufacturer</p>
                                <p className="font-semibold">{product.manufacturer || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Salt Composition</p>
                                <p className="font-semibold">{product.saltComposition || 'None'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Accordion type="single" collapsible className="w-full space-y-3">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Key Information</AccordionTrigger>
                            <AccordionContent>
                                {product.keyInfo || 'No key information available for this product.'}
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Directions of use</AccordionTrigger>
                            <AccordionContent>
                                 {product.directions || 'No directions for use available. Please consult your doctor.'}
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>How it works</AccordionTrigger>
                            <AccordionContent>
                                {product.howItWorks || 'Information on how this product works is not available.'}
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>Quick tips</AccordionTrigger>
                            <AccordionContent>
                                {product.quickTips || 'No quick tips available for this product.'}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    
                    {relatedProducts.length > 0 && (
                        <div>
                            <h2 className="text-lg font-bold mb-4">Related Products</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {relatedProducts.map(related => (
                                    <Link href={`/product/${related.id}`} key={related.id}>
                                         <Card className="overflow-hidden h-full flex flex-col">
                                            <CardContent className="p-0 flex-1 flex flex-col">
                                                <Image 
                                                    src={related.imageUrl || `https://picsum.photos/seed/${related.id}/200/200`}
                                                    alt={related.name}
                                                    width={200}
                                                    height={200}
                                                    className="w-full h-24 object-cover"
                                                />
                                                <div className="p-3 flex-1 flex flex-col">
                                                    <h4 className="font-semibold text-sm truncate">{related.name}</h4>
                                                    <p className="text-xs text-muted-foreground">1 Strip of 15</p>
                                                    <p className="font-bold text-base mt-auto pt-2">₹{related.price.toFixed(2)}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 p-4 border-t bg-background">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">{packageInfo}</p>
                        <p className="text-2xl font-bold">₹{product.price.toFixed(2)}</p>
                    </div>
                    {cartItem ? (
                         <div className="flex items-center justify-center gap-2">
                             <Button size="lg" variant="outline" className="px-4" onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}>-</Button>
                             <span className="w-10 text-center font-bold text-lg">{cartItem.quantity}</span>
                             <Button size="lg" variant="outline" className="px-4" onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}>+</Button>
                         </div>
                    ) : (
                        <Button size="lg" className="w-1/2" onClick={handleAddToCart}>
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            Add to cart
                        </Button>
                    )}
                </div>
            </footer>
        </div>
    );
}
