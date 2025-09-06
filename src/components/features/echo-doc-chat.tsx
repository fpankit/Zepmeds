"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { echoDoc, EchoDocOutput } from "@/ai/flows/echo-doc-flow";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { User, Loader2, Send, Pill, Activity, MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  query: z.string().min(5, "Please describe your issue in a bit more detail."),
});

type Message = {
  role: "user" | "ai";
  content: string | EchoDocOutput;
};

export function EchoDocChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { query: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const userMessage: Message = { role: "user", content: values.query };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const result = await echoDoc({ query: values.query });
      const aiMessage: Message = { role: "ai", content: result };
      setMessages((prev) => [...prev, aiMessage]);
      form.reset();
    } catch (error) {
      console.error("Error with Echo Doc AI:", error);
      const errorMessage: Message = { 
        role: "ai", 
        content: { 
          response: "I'm sorry, I encountered an error and can't provide advice right now. Please try again later. For any medical concerns, please consult a healthcare professional.",
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
          <MessageSquare />
          Echo Doc AI
        </CardTitle>
        <CardDescription>Your personal AI medical agent. Chat about your symptoms to get recommendations and health updates.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-8 w-8 border-2 border-primary">
                <AvatarFallback><MessageSquare size={20}/></AvatarFallback>
              </Avatar>
              <div className="rounded-lg bg-card p-3 text-sm max-w-[85%]">
                <p>Hello! I'm Echo Doc, your AI health assistant. How are you feeling today? <br /><br /><strong className="text-destructive-foreground/70">Disclaimer: I am an AI and not a real doctor. Please consult a healthcare professional for medical advice.</strong></p>
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
                     <AvatarFallback><MessageSquare size={20}/></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "rounded-lg p-3 text-sm max-w-[85%] leading-relaxed",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card"
                  )}
                >
                  {typeof message.content === 'string' ? (
                    <p>{message.content}</p>
                  ) : (
                    <div className="space-y-4">
                        <p>{message.content.response}</p>
                        {message.content.medicineRecommendation && (
                            <div className="p-3 rounded-md bg-background/50 border border-border">
                                <h4 className="font-bold mb-2 flex items-center gap-2"><Pill className="text-accent h-4 w-4"/>Medicine Suggestions</h4>
                                <p>{message.content.medicineRecommendation}</p>
                            </div>
                        )}
                         {message.content.healthcareUpdate && (
                            <div className="p-3 rounded-md bg-background/50 border border-border">
                                <h4 className="font-bold mb-2 flex items-center gap-2"><Activity className="text-accent h-4 w-4"/>Health Update</h4>
                                <p>{message.content.healthcareUpdate}</p>
                            </div>
                        )}
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
                     <AvatarFallback><MessageSquare size={20}/></AvatarFallback>
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
              name="query"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Textarea
                      placeholder="e.g., I have a bad headache, what can I take?"
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
