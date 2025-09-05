"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { aiSymptomChecker, AISymptomCheckerOutput } from "@/ai/flows/ai-symptom-checker";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Bot, User, Loader2, Send, Pill, Apple, ShieldAlert, Dumbbell, Stethoscope } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  symptoms: z.string().min(10, "Please describe your symptoms in more detail."),
});

type Message = {
  role: "user" | "ai";
  content: string | AISymptomCheckerOutput;
};

export function SymptomCheckerChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { symptoms: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const userMessage: Message = { role: "user", content: values.symptoms };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const result = await aiSymptomChecker({ symptoms: values.symptoms });
      const aiMessage: Message = { role: "ai", content: result };
      setMessages((prev) => [...prev, aiMessage]);
      form.reset();
    } catch (error) {
      console.error("Error with AI symptom checker:", error);
      const errorMessage: Message = { 
        role: "ai", 
        content: { 
          medicines: "An error occurred while fetching advice.", 
          diet: "Please try again later.",
          precautions: "If the problem persists, contact support.",
          workouts: "",
          advice: "Please consult a healthcare professional for medical advice." 
        } 
      };
      setMessages((prev) => [
        ...prev,
        errorMessage,
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="flex h-[80vh] flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot />
          AI Symptom Checker
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-8 w-8 border-2 border-primary">
                <AvatarFallback><Bot size={20}/></AvatarFallback>
              </Avatar>
              <div className="rounded-lg bg-card p-3 text-sm max-w-[85%]">
                <p>Hello! I'm your AI health assistant. Please describe your symptoms, and I'll provide some potential suggestions and advice. <br /><br /><strong className="text-destructive-foreground/70">Disclaimer: I am not a real doctor. Please consult a healthcare professional for medical advice.</strong></p>
              </div>
            </div>
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-4",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "ai" && (
                  <Avatar className="h-8 w-8 border-2 border-primary">
                     <AvatarFallback><Bot size={20}/></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "rounded-lg p-3 text-sm max-w-[85%]",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card"
                  )}
                >
                  {typeof message.content === 'string' ? (
                    <p>{message.content}</p>
                  ) : (
                    <div className="space-y-4">
                        <div className="p-2 rounded-md bg-background/50">
                            <h4 className="font-bold mb-2 flex items-center gap-2"><Pill className="text-accent h-4 w-4"/>Medicines</h4>
                            <p>{message.content.medicines}</p>
                        </div>
                        <div className="p-2 rounded-md bg-background/50">
                            <h4 className="font-bold mb-2 flex items-center gap-2"><Apple className="text-accent h-4 w-4"/>Diet</h4>
                            <p>{message.content.diet}</p>
                        </div>
                         <div className="p-2 rounded-md bg-background/50">
                            <h4 className="font-bold mb-2 flex items-center gap-2"><ShieldAlert className="text-accent h-4 w-4"/>Precautions</h4>
                            <p>{message.content.precautions}</p>
                        </div>
                         <div className="p-2 rounded-md bg-background/50">
                            <h4 className="font-bold mb-2 flex items-center gap-2"><Dumbbell className="text-accent h-4 w-4"/>Workouts</h4>
                            <p>{message.content.workouts}</p>
                        </div>
                         <div className="p-2 rounded-md bg-primary/20">
                            <h4 className="font-bold mb-2 flex items-center gap-2"><Stethoscope className="text-primary h-4 w-4"/>Advice</h4>
                            <p>{message.content.advice}</p>
                        </div>
                    </div>
                  )}
                </div>
                 {message.role === "user" && (
                   <Avatar className="h-8 w-8">
                     <AvatarFallback><User size={20}/></AvatarFallback>
                   </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
               <div className="flex items-start gap-4">
                 <Avatar className="h-8 w-8 border-2 border-primary">
                     <AvatarFallback><Bot size={20}/></AvatarFallback>
                  </Avatar>
                 <div className="rounded-lg bg-card p-3 text-sm">
                   <Loader2 className="h-5 w-5 animate-spin" />
                 </div>
               </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full items-start gap-2">
            <FormField
              control={form.control}
              name="symptoms"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Textarea
                      placeholder="e.g., I have a headache and a sore throat..."
                      className="resize-none"
                      disabled={isLoading}
                      rows={1}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size="icon" disabled={isLoading}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </Form>
      </CardFooter>
    </Card>
  );
}
