
"use client";

import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { usePathname } from "next/navigation";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const noLayoutRoutes = ["/checkout", "/video-call", "/call-status", "/symptom-checker/results"];
  
  const isLayoutVisible = !noLayoutRoutes.some(route => pathname.startsWith(route));


  if (!isLayoutVisible) {
    return <main>{children}</main>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
