
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="relative w-48 h-48 mb-6">
        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
        <div className="relative flex items-center justify-center w-full h-full bg-card rounded-full">
          <ShoppingCart className="h-20 w-20 text-primary" />
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
      <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
      <Button asChild>
        <Link href="/home">Start Shopping</Link>
      </Button>
    </div>
  );
}
