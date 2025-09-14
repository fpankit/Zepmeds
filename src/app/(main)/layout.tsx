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
  const noHeaderRoutes: string[] = [];
  const noLayoutRoutes = ["/checkout", "/symptom-checker/results", "/echo-doc/call", "/first-aid/", "/verify-medicine", "/scan-package", "/activity", "/call/", "/health-report"];
  
  const isLayoutVisible = !noLayoutRoutes.some(route => pathname.startsWith(route) || pathname === '/order-status');
  const isHeaderHidden = noHeaderRoutes.includes(pathname);


  if (!isLayoutVisible && pathname.startsWith('/order-status')) {
      return <main>{children}</main>;
  }

  if (!isLayoutVisible) {
    return <main>{children}</main>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {!isHeaderHidden && <Header />}
      <main className="flex-1 pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
