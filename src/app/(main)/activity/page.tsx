import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks } from "lucide-react";

export default function ActivityPage() {
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-6 w-6" />
            Your Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg">
            <p className="text-lg font-semibold">No activity yet.</p>
            <p className="text-muted-foreground">Your order history and consultations will appear here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
