
"use client";

import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { usePathname } from "next/navigation";
import { CallNotificationHandler } from "@/components/features/call-notification-handler";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const noLayoutRoutes = ["/checkout", "/symptom-checker/results", "/echo-doc/call", "/first-aid/", "/video-call/"];
  
  const isLayoutVisible = !noLayoutRoutes.some(route => pathname.startsWith(route));


  if (!isLayoutVisible) {
    return <main>{children}</main>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <CallNotificationHandler />
      <main className="flex-1 pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
