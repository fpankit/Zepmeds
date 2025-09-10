
import { User, MapPin, History, HeartPulse, FileText, Wallet, Tag, LifeBuoy } from "lucide-react";

export const profileLinks = [
    { icon: User, text: "Personal Details", href: "/profile/edit" },
    { icon: MapPin, text: "Addresses", href: "#" },
    { icon: History, text: "Order History", href: "/orders" },
    { icon: HeartPulse, text: "Past Medicines", href: "#" },
    { icon: FileText, text: "Diagnosed Reports", href: "#" },
  ];
  
  export const supportLinks = [
      { icon: Wallet, text: "Wallet", href: "#" },
      { icon: Tag, text: "Coupons & Offers", href: "#" },
      { icon: LifeBuoy, text: "Help & Support", href: "#" },
  ];
