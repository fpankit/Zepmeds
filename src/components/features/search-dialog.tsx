
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "../ui/button";
import { Search, Pill, Loader2, AlertCircle } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, limit, getDocs, orderBy } from "firebase/firestore";
import { Product } from "@/lib/types";
import { DialogTitle } from "../ui/dialog";
import { useTranslation } from "@/context/language-context";

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const t = useTranslation();


  const fetchSuggestions = useCallback(async (search: string) => {
    const trimmedSearch = search.trim();
    if (trimmedSearch.length < 2) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const capitalizedSearch = trimmedSearch.charAt(0).toUpperCase() + trimmedSearch.slice(1);

      const q = query(
        collection(db, "products"),
        orderBy("name"),
        where("name", ">=", capitalizedSearch),
        where("name", "<=", capitalizedSearch + "\uf8ff"),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      const newSuggestions = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Product)
      );
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error("Error fetching search suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, fetchSuggestions]);

  const handleSelect = (productId: string) => {
    setOpen(false);
    router.push(`/product/${productId}`);
  };

  const handleNotify = () => {
      setOpen(false);
      router.push(`/urgent-medicine?name=${encodeURIComponent(searchQuery)}`);
  }
  
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])


  const NotFoundContent = () => (
      <div className="text-center py-6 px-4">
          <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-sm font-semibold">{t('orderMedicines.notFound.title')}</p>
          <p className="mt-1 text-xs text-muted-foreground">
             {t('orderMedicines.notFound.description1').replace('{searchQuery}', `"${searchQuery}"`)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
             {t('orderMedicines.notFound.description2')}
          </p>
          <Button onClick={handleNotify} size="sm" className="mt-4">
            {t('orderMedicines.notFound.button')}
          </Button>
      </div>
  );


  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-start text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span>{t('orderMedicines.searchPlaceholder')}</span>
        <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
         <DialogTitle className="sr-only">Search for medicines</DialogTitle>
        <CommandInput
          placeholder={t('orderMedicines.searchPlaceholder')}
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          {isLoading && <div className="p-4 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin"/></div>}
          
          {!isLoading && suggestions.length === 0 && searchQuery.length > 1 && (
            <CommandEmpty>
                <NotFoundContent />
            </CommandEmpty>
          )}

          {suggestions.length > 0 && (
            <CommandGroup heading="Suggestions">
              {suggestions.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.name}
                  onSelect={() => handleSelect(product.id)}
                  className="flex items-center gap-3"
                >
                  <Pill className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                        In <span className="text-primary">{product.category}</span>
                    </p>
                  </div>
                  <p className="font-bold text-sm">₹{product.price.toFixed(2)}</p>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
