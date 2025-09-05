"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { aiSymptomChecker, AISymptomCheckerOutput } from "@/ai/flows/ai-symptom-checker";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Bot, User, Loader2, Sparkles, Send } from "lucide-react";
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
    setMessages((prev) => [...prev, { role: "user", content: values.symptoms }]);

    try {
      const result = await aiSymptomChecker({ symptoms: values.symptoms });
      setMessages((prev) => [...prev, { role: "ai", content: result }]);
      form.reset();
    } catch (error) {
      console.error("Error with AI symptom checker:", error);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: { suggestions: "An error occurred.", advice: "Please try again later." } },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="flex h-[70vh] flex-col">
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
                        <div>
                            <h4 className="font-bold mb-2 flex items-center gap-2"><Sparkles className="text-accent h-4 w-4"/>Suggestions</h4>
                            <p>{message.content.suggestions}</p>
                        </div>
                         <div>
                            <h4 className="font-bold mb-2 flex items-center gap-2"><Sparkles className="text-accent h-4 w-4"/>Advice</h4>
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
