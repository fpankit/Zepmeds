
"use client";

import { AuthProvider } from "@/context/auth-context";
import { CartProvider } from "@/context/cart-context";
import { HMSRoomProvider } from "@100mslive/react-sdk";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HMSRoomProvider>
      <AuthProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </AuthProvider>
    </HMSRoomProvider>
  );
}
