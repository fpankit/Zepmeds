
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { echoDoc, EchoDocOutput } from "@/ai/flows/echo-doc-flow";
import { textToSpeech } from "@/ai/flows/text-to-speech";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { User, Loader2, Send, Pill, Activity, MessageSquare, Mic, MicOff, Volume2, Waves } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  query: z.string().min(5, "Please describe your issue in a bit more detail."),
});

type Message = {
  role: "user" | "ai";
  content: string | EchoDocOutput;
};

// Check for SpeechRecognition API
const SpeechRecognition =
  (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));

export function EchoDocChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { query: "" },
  });

  const playAudioResponse = async (text: string) => {
    setIsSpeaking(true);
    try {
      const response = await textToSpeech({ text });
      if (audioRef.current) {
        audioRef.current.src = response.media;
        audioRef.current.play();
        audioRef.current.onended = () => setIsSpeaking(false);
      }
    } catch (error) {
      console.error("Failed to play audio response:", error);
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // Can be changed dynamically

    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        form.setValue("query", form.getValues("query") + finalTranscript);
      }
    };
    
    recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
    }

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [form]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      form.setValue("query", ""); // Clear input before starting
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  };
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setIsListening(false);
    recognitionRef.current?.stop();

    const userMessage: Message = { role: "user", content: values.query };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const result = await echoDoc({ query: values.query });
      const aiMessage: Message = { role: "ai", content: result };
      setMessages((prev) => [...prev, aiMessage]);
      await playAudioResponse(result.response);
      form.reset();
    } catch (error) {
      console.error("Error with Echo Doc AI:", error);
      const errorMessage: Message = { 
        role: "ai", 
        content: { 
          response: "I'm sorry, I encountered an error and can't provide advice right now. Please try again later. For any medical concerns, please consult a healthcare professional.",
        } 
      };
      setMessages((prev) => [...prev, errorMessage]);
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
        <CardDescription>Your personal AI medical agent. Chat or talk about your symptoms to get recommendations.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-8 w-8 border-2 border-primary">
                <AvatarFallback><MessageSquare size={20}/></AvatarFallback>
              </Avatar>
              <div className="rounded-lg bg-card p-3 text-sm max-w-[85%]">
                <p>Hello! I'm Echo Doc, your AI health assistant. How are you feeling today? You can type or use the microphone to talk to me. <br /><br /><strong className="text-destructive-foreground/70">Disclaimer: I am an AI and not a real doctor. Please consult a healthcare professional for medical advice.</strong></p>
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
            {(isLoading || isSpeaking || isListening) && (
               <div className="flex items-start gap-4">
                 <Avatar className="h-8 w-8 border-2 border-primary">
                     <AvatarFallback><MessageSquare size={20}/></AvatarFallback>
                  </Avatar>
                 <div className="rounded-lg bg-card p-3 text-sm flex items-center gap-2">
                    {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                    {isSpeaking && <Volume2 className="h-5 w-5 animate-pulse text-accent" />}
                    {isListening && <Waves className="h-5 w-5 animate-pulse text-primary" />}
                    <span>{isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Thinking...'}</span>
                 </div>
               </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full items-start gap-2">
            {SpeechRecognition && (
                <Button type="button" variant={isListening ? 'destructive' : 'outline'} size="icon" onClick={toggleListening} disabled={isLoading}>
                    {isListening ? <MicOff className="h-4 w-4"/> : <Mic className="h-4 w-4" />}
                    <span className="sr-only">Toggle Listening</span>
                </Button>
            )}
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
      <audio ref={audioRef} className="hidden" />
    </Card>
  );
}
