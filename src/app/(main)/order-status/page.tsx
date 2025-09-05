
"use client";

import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Copy, Share2, Phone, FileText, HelpCircle, ShieldAlert, Bike, CheckCircle2, Package, CookingPot, Check, ChevronDown, Map, MessageSquare, LifeBuoy } from 'lucide-react';
import Image from 'next/image';

const orderStatusSteps = [
  { name: 'Order Confirmed', icon: CheckCircle2, time: '10:00 AM', completed: true },
  { name: 'Preparing', icon: CookingPot, time: '10:05 AM', completed: true },
  { name: 'Rider Assigned', icon: Bike, time: '10:15 AM', completed: false },
  { name: 'Order Picked Up', icon: Package, time: '10:20 AM', completed: false },
  { name: 'Arrived at Location', icon: Check, time: '10:35 AM', completed: false },
  { name: 'Delivered', icon: CheckCircle2, time: '10:40 AM', completed: false },
];

const faqs = [
  {
    question: "How can I track my order?",
    answer: "You can track your order status in real-time on this page. The progress bar and status updates will show you exactly where your order is."
  },
  {
    question: "Can I change my delivery address?",
    answer: "Once an order is placed, you cannot change the delivery address. Please ensure the address is correct before confirming your order."
  },
  {
    question: "What if I receive a wrong or damaged item?",
    answer: "Please use the 'Report an Issue' option on this page to contact our support team. We will resolve it for you as quickly as possible."
  }
];

export default function OrderStatusPage() {
  const [viewDetails, setViewDetails] = useState(true);
  const progress = (orderStatusSteps.filter(s => s.completed).length / orderStatusSteps.length) * 100;
  const currentStep = orderStatusSteps.find(s => !s.completed) || orderStatusSteps[orderStatusSteps.length-1];


  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-6">

      <Card className="overflow-hidden">
        <CardHeader className="p-4 bg-card/80 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">Order #ZM1869</h1>
              <Button variant="ghost" size="icon" className="w-6 h-6"><Copy className="w-4 h-4" /></Button>
            </div>
            <p className="text-sm font-semibold text-orange-400">Arriving in 15 min</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon"><Share2 /></Button>
            <Button variant="outline" size="icon"><Phone /></Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <button className="w-full flex justify-between items-center" onClick={() => setViewDetails(!viewDetails)}>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-semibold">{currentStep.name}</p>
            </div>
            <div className="flex items-center text-sm text-primary">
              View Details <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${viewDetails ? 'rotate-180' : ''}`} />
            </div>
          </button>
          
          {viewDetails && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">Order Progress</p>
                <p className="font-bold text-orange-400">{Math.round(progress)}%</p>
              </div>
              <Progress value={progress} className="h-2 bg-orange-500" />

              <div className="space-y-4">
                {orderStatusSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.completed ? 'bg-green-500' : 'bg-muted'}`}>
                      <step.icon className={`w-5 h-5 ${step.completed ? 'text-white' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <p className={`font-semibold ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>{step.name}</p>
                      <p className="text-xs text-muted-foreground">{step.time}</p>
                    </div>
                    {step.completed && <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold">Delivery Status</h2>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback>ZR</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold">Delivery Partner</p>
              <p className="text-sm text-muted-foreground">Arriving in 15 mins • 2.4 km away</p>
            </div>
          </div>

          <div className="relative h-48 w-full rounded-md overflow-hidden bg-muted">
             <Image src="https://picsum.photos/800/400?random=20" alt="Map" layout="fill" objectFit="cover" data-ai-hint="map satellite" />
             <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <Button variant="secondary">
                    <Map className="mr-2 h-4 w-4"/> View on Map
                </Button>
             </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
           <h2 className="text-lg font-bold">Order Items: 1</h2>
           <div className="flex items-center gap-2">
               <Button variant="ghost" size="sm" className="text-green-500 hover:bg-green-500/10 hover:text-green-500"><FileText className="w-4 h-4 mr-1"/> Invoice</Button>
               <Button variant="ghost" size="sm" className="text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-500"><HelpCircle className="w-4 h-4 mr-1"/> Help</Button>
               <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-500/10 hover:text-red-500"><ShieldAlert className="w-4 h-4 mr-1"/> Issue</Button>
           </div>
        </CardHeader>
         <CardContent>
          {/* Item details would be rendered here */}
           <div className="flex items-center justify-between p-2 rounded-md bg-background">
                <div>
                    <p className="font-semibold">Vitamin C Tablets</p>
                    <p className="text-sm text-muted-foreground">1 unit</p>
                </div>
                <p className="font-bold">₹280.00</p>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <h2 className="text-lg font-bold">Need Help?</h2>
        </CardHeader>
        <CardContent>
             <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger>{faq.question}</AccordionTrigger>
                        <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center justify-between">
            <h3 className="font-semibold">Still have questions?</h3>
            <div className="flex gap-2">
                <Button variant="outline"><MessageSquare className="mr-2 h-4 w-4"/>Chat with Agent</Button>
                <Button variant="outline"><LifeBuoy className="mr-2 h-4 w-4"/>Support</Button>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
