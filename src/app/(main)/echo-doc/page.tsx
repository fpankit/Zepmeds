
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, MessageSquare, FileText } from "lucide-react";
import { useRouter } from "next/navigation";


export default function EchoDocDashboardPage() {
  const router = useRouter();

  const handleStartConsultation = () => {
    // This will eventually lead to the survey page
    // For now, let's just log it.
    console.log("Starting new consultation...");
  };

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-primary" />
            EchoDoc AI Dashboard
          </h1>
          <p className="text-muted-foreground">
            Your personal AI-powered medical consultation history.
          </p>
        </div>
      </header>

      <main>
        <Card className="text-center p-8 border-2 border-dashed border-border hover:border-primary transition-colors duration-300">
            <CardContent className="flex flex-col items-center justify-center gap-4">
                 <div className="p-4 bg-primary/10 rounded-full">
                    <PlusCircle className="h-12 w-12 text-primary" />
                 </div>
                <h2 className="text-2xl font-semibold">Start a New AI Consultation</h2>
                <p className="text-muted-foreground max-w-md">
                    Get instant medical advice, diet plans, and medicine recommendations from our advanced AI.
                </p>
                <Button size="lg" className="mt-4" onClick={handleStartConsultation}>
                    Start New Consultation
                </Button>
            </CardContent>
        </Card>

        <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Past Consultations</h2>
            <Card>
                <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                    <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-xl font-semibold">No Past Consultations</h3>
                    <p className="text-muted-foreground mt-1">Your previous AI consultations will appear here.</p>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
