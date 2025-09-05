import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutGrid } from "lucide-react";

export default function MorePage() {
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-6 w-6" />
            More Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg">
            <p className="text-lg font-semibold">More Features Coming Soon</p>
            <p className="text-muted-foreground">Stay tuned for fitness devices, health monitors, and more.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
