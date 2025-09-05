import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope } from "lucide-react";

export default function DoctorPage() {
  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6" />
            Consult a Doctor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg">
            <p className="text-lg font-semibold">Coming Soon</p>
            <p className="text-muted-foreground">Our doctor consultation feature is under development.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
