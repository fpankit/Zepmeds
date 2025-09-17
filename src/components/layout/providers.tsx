
"use client";

import { AuthProvider } from "@/context/auth-context";
import { CartProvider } from "@/context/cart-context";
import { LanguageProvider } from "@/context/language-context";
import { HMSRoomProvider } from "@100mslive/react-sdk";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
        {/* The HMSRoomProvider has been moved to VideoCallContent to prevent conflicts */}
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
    </LanguageProvider>
  );
}
