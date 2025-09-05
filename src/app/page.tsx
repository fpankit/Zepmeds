
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/icons/logo";
import { AnimatePresence, motion } from "framer-motion";

export default function SplashPage() {
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000); // Show splash for 2 seconds

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showSplash) {
      router.push("/login");
    }
  }, [showSplash, router]);

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.7 }}
            className="z-10 flex flex-col items-center"
          >
            <Logo className="h-24 w-auto text-primary" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
