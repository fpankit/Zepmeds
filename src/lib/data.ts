

import { User, MapPin, History, HeartPulse, FileText, Stethoscope, Siren, LifeBuoy, Pill, ClipboardList, Languages, FilePlus2 } from "lucide-react";

export const profileLinks = [
    { icon: User, textKey: "profile.patientDetails", href: "/profile/edit", color: "text-red-400" },
    { icon: MapPin, textKey: "profile.manageAddresses", href: "/profile/addresses", color: "text-red-400" },
    { icon: History, textKey: "profile.orderHistory", href: "/orders", color: "text-orange-400" },
    { icon: Pill, textKey: "profile.pastMedicines", href: "#", color: "text-green-400" },
    { icon: ClipboardList, textKey: "profile.diagnosticReports", href: "/profile/diagnostic-reports", color: "text-purple-400" },
    { icon: FileText, textKey: "profile.myHealthReport", href: "/health-report", color: "text-green-400" },
    { icon: Stethoscope, textKey: "profile.consultDoctor", href: "/doctor", color: "text-green-400" },
    { icon: Siren, textKey: "profile.emergencyServices", href: "/emergency", color: "text-yellow-400" },
    { icon: LifeBuoy, textKey: "profile.helpSupport", href: "#", color: "text-blue-400" },
    { icon: Languages, textKey: "profile.changeLanguage", href: "/profile/language", color: "text-sky-400" },
    { icon: FilePlus2, textKey: "profile.createReport", href: "/create-report", color: "text-teal-400", doctorOnly: true },
  ];
  
  export const supportLinks = [
      // This can be merged or kept separate if needed elsewhere.
      // For the new profile page, these are not directly used.
  ];



