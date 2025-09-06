
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/icons/logo";

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
      {showSplash && (
        <div className="z-10 flex flex-col items-center">
            <Logo className="h-24 w-auto text-primary" />
        </div>
      )}
    </div>
  );
}
