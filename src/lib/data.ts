
import { User, MapPin, History, HeartPulse, FileText, Stethoscope, Siren, LifeBuoy, Pill } from "lucide-react";

export const profileLinks = [
    { icon: User, text: "Patient Details", href: "/profile/edit", color: "text-red-400" },
    { icon: MapPin, text: "Manage Addresses", href: "#", color: "text-red-400" },
    { icon: History, text: "Order History", href: "/orders", color: "text-orange-400" },
    { icon: Pill, text: "Past Medicines", href: "#", color: "text-green-400" },
    { icon: FileText, text: "Medical Reports", href: "/health-report", color: "text-green-400" },
    { icon: Stethoscope, text: "Consult a Doctor", href: "/doctor", color: "text-green-400" },
    { icon: Siren, text: "Emergency Services", href: "/emergency", color: "text-yellow-400" },
    { icon: LifeBuoy, text: "Help & Support", href: "#", color: "text-blue-400" },
  ];
  
  export const supportLinks = [
      // This can be merged or kept separate if needed elsewhere.
      // For the new profile page, these are not directly used.
  ];

