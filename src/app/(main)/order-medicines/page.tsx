
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search,
  Pill,
  Star,
  Heart,
  Eye,
  Stethoscope,
  Bone,
  Sun,
  Dog,
  Thermometer,
  ShoppingCart,
  FileText,
  Minus,
  Plus,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/types';
import { collection, query, getDocs, limit, startAfter, orderBy, where, Query, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { DelayedSkeleton } from '@/components/features/delayed-skeleton';
import Link from 'next/link';

const categories = [
  { name: 'All', icon: Pill, gradient: 'from-blue-500 to-cyan-400' },
  { name: 'General Health', icon: Heart, gradient: 'from-green-500 to-teal-400' },
  { name: 'Pain Relief', icon: Bone, gradient: 'from-red-500 to-orange-400' },
  { name: 'Skin Care', icon: Sun, gradient: 'from-yellow-500 to-amber-400' },
  { name: 'Eye Care', icon: Eye, gradient: 'from-indigo-500 to-purple-400' },
  { name: 'Pet Care', icon: Dog, gradient: 'from-pink-500 to-rose-400' },
  { name: 'Devices', icon: Thermometer, gradient: 'from-gray-500 to-slate-400' },
];

const PRODUCTS_PER_PAGE = 8;

const ProductCardSkeleton = () => (
    <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Skeleton className="w-full h-32" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex justify-between items-center mt-2">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </CardContent>
    </Card>
);

export default function OrderMedicinesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { cart, addToCart, updateQuantity, setProductMap } = useCart();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const isFetching = useRef(false);

  const { ref: loadMoreRef, entry } = useIntersectionObserver({
    threshold: 0.5,
  });

  const fetchProducts = useCallback(async (lastVisibleDoc: QueryDocumentSnapshot<DocumentData> | null = null, category: string = 'All') => {
    if (isFetching.current) return;
    isFetching.current = true;

    if (lastVisibleDoc) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setProducts([]); // Clear products on new category selection or initial load
    }

    try {
      let productsQuery: Query<DocumentData>;
      const baseQuery = collection(db, "products");

      let categoryQuery: Query<DocumentData>;
      
      if (category !== 'All') {
        categoryQuery = query(baseQuery, where("category", "==", category), orderBy("name"));
      } else {
        categoryQuery = query(baseQuery, orderBy("name"));
      }

      productsQuery = lastVisibleDoc
        ? query(categoryQuery, startAfter(lastVisibleDoc), limit(PRODUCTS_PER_PAGE))
        : query(categoryQuery, limit(PRODUCTS_PER_PAGE));
      
      const querySnapshot = await getDocs(productsQuery);
      const newProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

      const currentProducts = lastVisibleDoc ? [...products, ...newProducts] : newProducts;
      setProducts(currentProducts);
      
      const newProductMap = new Map<string, Product>();
      currentProducts.forEach(p => newProductMap.set(p.name, p));
      setProductMap(newProductMap);

      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
      setHasMore(querySnapshot.docs.length === PRODUCTS_PER_PAGE);

    } catch (error) {
      console.error("Error fetching products: ", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch products. You may be viewing offline data.' });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      isFetching.current = false;
    }
  }, [toast, setProductMap, products]);
  
  useEffect(() => {
    // This effect now serves as the trigger for category changes
    fetchProducts(null, selectedCategory);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  useEffect(() => {
    if (entry?.isIntersecting && hasMore && !isLoadingMore && !isFetching.current) {
      fetchProducts(lastDoc, selectedCategory);
    }
  }, [entry, hasMore, isLoadingMore, fetchProducts, lastDoc, selectedCategory]);

  const handleAddToCart = (product: Product) => {
    addToCart({ ...product, quantity: 1, imageUrl: product.imageUrl });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  }

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search for medicines..." className="pl-10" />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Categories</h2>
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
          <div className="flex w-max space-x-4">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => {
                  setLastDoc(null);
                  setHasMore(true);
                  setSelectedCategory(category.name);
                }}
                className={cn(
                  'flex flex-col items-center justify-center space-y-2 w-20 h-20 rounded-2xl text-center p-2 transition-all duration-200 transform hover:scale-105',
                   'bg-gradient-to-br text-white shadow-lg',
                   category.gradient,
                  selectedCategory === category.name
                    ? 'ring-2 ring-offset-2 ring-offset-background ring-white'
                    : 'opacity-80 hover:opacity-100'
                )}
              >
                <category.icon className="h-7 w-7" />
                <span className="text-xs font-bold">{category.name}</span>
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">
            {selectedCategory === 'All' ? 'All Products' : selectedCategory}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {isLoading && products.length === 0 ? (
             Array.from({ length: 8 }).map((_, index) => <ProductCardSkeleton key={index} />)
          ) : (
            products.map((product) => {
              const cartItem = cart.find(item => item.id === product.id);
              return (
                <DelayedSkeleton key={product.id} isLoading={false} skeleton={<ProductCardSkeleton />}>
                    <Card className="overflow-hidden group flex flex-col">
                        <CardContent className="p-0 flex-1 flex flex-col">
                           <Link href={`/product/${product.id}`} className="block">
                                <div className="relative">
                                    {product.imageUrl ? (
                                        <Image
                                            src={product.imageUrl}
                                            alt={product.name}
                                            width={200}
                                            height={200}
                                            className="w-full h-32 object-cover"
                                            data-ai-hint={product.dataAiHint}
                                        />
                                    ) : (
                                        <div className="w-full h-32 bg-muted flex items-center justify-center">
                                        <Pill className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                    )}
                                    {product.isRx && <Badge variant="destructive" className="absolute top-2 right-2">Rx</Badge>}
                                </div>
                                <div className="p-3">
                                    <h3 className="font-semibold text-sm leading-tight truncate">{product.name}</h3>
                                    <p className="text-xs text-muted-foreground truncate">{product.uses}</p>
                                    <div className="mt-2">
                                        <div className="flex items-baseline gap-1">
                                            <p className="font-bold text-base">₹{product.price}</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                            <div className="p-3 pt-0 mt-auto">
                                {cartItem ? (
                                    <div className="flex items-center justify-between gap-1">
                                        <Button size="icon" variant="outline" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}>
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="w-6 text-center font-bold text-sm">{cartItem.quantity}</span>
                                        <Button size="icon" variant="outline" className="h-8 w-8 rounded-full" onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <Button size="sm" className="w-full" onClick={() => handleAddToCart(product)}>
                                        <ShoppingCart className="mr-2 h-4 w-4"/>
                                        Add
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                 </DelayedSkeleton>
              )
            })
          )}
        </div>

        <div ref={loadMoreRef} className="col-span-full flex justify-center py-6">
            {isLoadingMore && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
            {!hasMore && products.length > 0 && <p className="text-muted-foreground">You've reached the end.</p>}
        </div>
         {!isLoading && products.length === 0 && (
            <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">No products found in this category.</p>
            </div>
         )}
      </div>
    </div>
  );
}
