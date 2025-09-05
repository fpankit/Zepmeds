
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            Your Cart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg">
            <p className="text-lg font-semibold">Your cart is empty.</p>
            <p className="text-muted-foreground">Add some items to get started.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
