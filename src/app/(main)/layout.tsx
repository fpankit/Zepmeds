

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
  const noLayoutRoutes = ["/checkout", "/first-aid/", "/verify-medicine", "/scan-package", "/health-report", "/profile/", "/product/", "/chat/", "/doctor/", "/asha/", "/activity/"];
  
  const isLayoutVisible = !noLayoutRoutes.some(route => {
    if (route.endsWith('/')) {
        // This handles routes like /profile/ and /call/
        return pathname.startsWith(route);
    }
    // This handles exact matches like /checkout
    return pathname === route;
  });

  const isHeaderHidden = noHeaderRoutes.includes(pathname);

  if (!isLayoutVisible) {
    // A special check for profile sub-pages which should not have the main layout
    if (pathname.startsWith('/profile/') || pathname.startsWith('/product/') || pathname.startsWith('/urgent-medicine') || pathname.startsWith('/health-report') || pathname.startsWith('/chat/') || pathname.startsWith('/doctor/') || pathname.startsWith('/asha/') || pathname.startsWith('/activity/')) {
        return <main>{children}</main>;
    }
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
