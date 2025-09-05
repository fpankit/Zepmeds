
"use client";

import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { CartProvider } from "@/context/cart-context";
import { AuthProvider } from "@/context/auth-context";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const noLayoutRoutes = ["/checkout"];
  const showLayout = !noLayoutRoutes.includes(pathname);

  return (
    <AuthProvider>
      <CartProvider>
        {showLayout ? (
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pb-20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </main>
            <BottomNav />
          </div>
        ) : (
          <main>{children}</main>
        )}
      </CartProvider>
    </AuthProvider>
  );
}
