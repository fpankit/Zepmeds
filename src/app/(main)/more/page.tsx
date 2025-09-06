
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutGrid } from "lucide-react";
import Link from "next/link";
import { profileLinks, supportLinks } from "@/lib/data";
import { ChevronRight } from "lucide-react";

export default function MorePage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-6 md:px-6 md:py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-6 w-6" />
            More
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
           <ul className="divide-y divide-border">
              {profileLinks.map((link) => (
                <li key={link.text}>
                  <Link href={link.href} className="flex items-center p-4 hover:bg-card/60">
                    <link.icon className="mr-4 h-5 w-5 text-muted-foreground" />
                    <span className="flex-1 font-medium">{link.text}</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                </li>
              ))}
               {supportLinks.map((link) => (
                <li key={link.text}>
                  <Link href={link.href} className="flex items-center p-4 hover:bg-card/60">
                    <link.icon className="mr-4 h-5 w-5 text-muted-foreground" />
                    <span className="flex-1 font-medium">{link.text}</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
        </CardContent>
      </Card>
    </div>
  );
}
