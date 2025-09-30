
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
  AlertTriangle,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useTranslation } from '@/context/language-context';
import { SearchDialog } from '@/components/features/search-dialog';
import { VoiceOrderSheet } from '@/components/features/voice-order-sheet';

const PRODUCTS_PER_PAGE = 8;

const ProductCardSkeleton = () => (
    <Card className="overflow-hidden">
        <CardContent className="p-3 space-y-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
    </Card>
);

export default function OrderMedicinesPage() {
  const t = useTranslation();
  
  const categories = [
    { name: t('orderMedicines.categories.all'), icon: Pill, gradient: 'from-blue-500 to-cyan-400', key: 'All' },
    { name: t('orderMedicines.categories.generalHealth'), icon: Heart, gradient: 'from-green-500 to-teal-400', key: 'General Health' },
    { name: t('orderMedicines.categories.painRelief'), icon: Bone, gradient: 'from-red-500 to-orange-400', key: 'Pain Relief' },
    { name: t('orderMedicines.categories.skinCare'), icon: Sun, gradient: 'from-yellow-500 to-amber-400', key: 'Skin Care' },
    { name: t('orderMedicines.categories.eyeCare'), icon: Eye, gradient: 'from-indigo-500 to-purple-400', key: 'Eye Care' },
    { name: t('orderMedicines.categories.petCare'), icon: Dog, gradient: 'from-pink-500 to-rose-400', key: 'Pet Care' },
    { name: t('orderMedicines.categories.devices'), icon: Thermometer, gradient: 'from-gray-500 to-slate-400', key: 'Devices' },
  ];

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
      setProducts([]); 
    }

    try {
      let productsQuery: Query<DocumentData>;
      const baseQuery = collection(db, "products");
      
      let queries = [];
      
      if (category !== 'All') {
        queries.push(where("category", "==", category));
      }
      
      productsQuery = query(baseQuery, ...queries, orderBy("name"));

      if (lastVisibleDoc) {
        productsQuery = query(productsQuery, startAfter(lastVisibleDoc));
      }
      
      productsQuery = query(productsQuery, limit(PRODUCTS_PER_PAGE));
      
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
    setLastDoc(null);
    setHasMore(true);
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
      title: t('orderMedicines.toast.addedToCart'),
      description: `${product.name} ${t('orderMedicines.toast.hasBeenAdded')}`,
    });
  }

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-6">
      
      <SearchDialog />

      <div className="space-y-4">
        <h2 className="text-xl font-bold">{t('orderMedicines.categoriesTitle')}</h2>
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
          <div className="flex w-max space-x-4">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={cn(
                  'flex flex-col items-center justify-center space-y-2 w-20 h-20 rounded-2xl text-center p-2 transition-all duration-200 transform hover:scale-105',
                   'bg-gradient-to-br text-white shadow-lg',
                   category.gradient,
                  selectedCategory === category.key
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
            {categories.find(c => c.key === selectedCategory)?.name || t('orderMedicines.allProducts')}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {isLoading && products.length === 0 ? (
             Array.from({ length: 8 }).map((_, index) => <ProductCardSkeleton key={index} />)
          ) : (
            products.map((product) => {
              const cartItem = cart.find(item => item.id === product.id);
              const hasDiscount = product.mrp && product.mrp > product.price;
              const discount = hasDiscount ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
              const stock = product.stock ?? 100; // Default to 100 if stock is not defined
              const fewLeft = stock < 50;

              return (
                <DelayedSkeleton key={product.id} isLoading={false} skeleton={<ProductCardSkeleton />}>
                    <Card className="overflow-hidden group flex flex-col">
                        <CardContent className="p-0 flex-1 flex flex-col">
                           <Link href={`/product/${product.id}`} className="block">
                                <div className="aspect-square w-full relative">
                                    <div className="h-full w-full bg-muted" />
                                </div>
                                <div className="p-3">
                                    {product.isRx && <Badge variant="destructive" className="mb-2">Rx</Badge>}
                                    <h3 className="font-semibold text-sm leading-tight truncate">{product.name}</h3>
                                    <p className="text-xs text-muted-foreground truncate">{product.uses}</p>
                                    <div className="mt-2">
                                        <div className="flex items-baseline gap-2">
                                            <p className="font-bold text-base text-primary">₹{product.price.toFixed(2)}</p>
                                            {hasDiscount && <p className="text-xs text-muted-foreground line-through">₹{product.mrp.toFixed(2)}</p>}
                                        </div>
                                         {hasDiscount && (
                                            <p className="text-xs font-bold text-green-500 mt-1">You save {discount}%</p>
                                        )}
                                    </div>
                                    <p className={cn("text-xs font-bold mt-1", fewLeft ? "text-red-500" : "text-green-500")}>
                                      {fewLeft ? 'A few left' : 'In Stock'}
                                    </p>
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
                                    <Button size="sm" className="w-full" onClick={() => handleAddToCart(product)} disabled={stock === 0}>
                                        {stock === 0 ? "Out of Stock" : <><ShoppingCart className="mr-2 h-4 w-4"/> {t('orderMedicines.addToCart')}</>}
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
            {!hasMore && products.length > 0 && <p className="text-muted-foreground">{t('orderMedicines.endOfResults')}</p>}
        </div>
         {!isLoading && products.length === 0 && (
            <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">{t('orderMedicines.noProductsInCategory')}</p>
            </div>
         )}
      </div>

      <VoiceOrderSheet />
    </div>
  );
}
