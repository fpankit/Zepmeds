
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/auth-context";
import placeholderImages from '@/app/lib/placeholder-images.json';
import { Clock, Search, SlidersHorizontal } from "lucide-react";
import Image from "next/image";

const categories = [
    { 
        title: "Beneficiaries", 
        tasks: "12 Records", 
        image: placeholderImages.illustrations.womanWithLaptop.url, 
        hint: placeholderImages.illustrations.womanWithLaptop.hint, 
        color: "bg-amber-100 dark:bg-amber-900/50" 
    },
    { 
        title: "Reports", 
        tasks: "05 Reports", 
        image: placeholderImages.illustrations.manWithLaptop.url,
        hint: placeholderImages.illustrations.manWithLaptop.hint,
        color: "bg-emerald-100 dark:bg-emerald-900/50" 
    },
];

const ongoingTasks = [
    {
        title: "ANC/PNC Visits",
        team: [
            { src: "https://i.pravatar.cc/150?img=1", alt: "Member 1"},
            { src: "https://i.pravatar.cc/150?img=2", alt: "Member 2"},
            { src: "https://i.pravatar.cc/150?img=3", alt: "Member 3"},
        ],
        dueDate: "6d",
        time: "9:00 AM - 4:00 PM",
        progress: 46,
        color: "bg-purple-100 dark:bg-purple-900/50"
    },
    {
        title: "Vaccination Drive",
        team: [
            { src: "https://i.pravatar.cc/150?img=4", alt: "Member 4"},
            { src: "https://i.pravatar.cc/150?img=5", alt: "Member 5"},
            { src: "https://i.pravatar.cc/150?img=6", alt: "Member 6"},
        ],
        dueDate: "4d",
        time: "10:00 AM - 2:00 PM",
        progress: 76,
        color: "bg-lime-100 dark:bg-lime-900/50"
    }
]

export default function AshaDashboardPage() {
    const { user } = useAuth();
    
    return (
        <div className="bg-background text-foreground p-6 font-sans">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Hi {user?.firstName || 'Rakib'}</h1>
                    <p className="text-muted-foreground">10 tasks pending</p>
                </div>
                <Avatar className="h-12 w-12">
                    <AvatarImage src={user?.photoURL} alt={user?.displayName || "ASHA Worker"}/>
                    <AvatarFallback>{user?.firstName?.[0] || 'A'}</AvatarFallback>
                </Avatar>
            </header>

            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5"/>
                    <Input placeholder="Search" className="pl-10 h-12 bg-card border-none rounded-lg" />
                </div>
                <Button variant="default" size="icon" className="h-12 w-12 rounded-lg bg-primary text-primary-foreground">
                    <SlidersHorizontal className="h-6 w-6"/>
                </Button>
            </div>
            
            <section className="mb-6">
                <h2 className="text-lg font-bold mb-3">Categories</h2>
                <div className="grid grid-cols-2 gap-4">
                    {categories.map((category) => (
                        <Card key={category.title} className={`${category.color} border-none overflow-hidden`}>
                            <CardContent className="p-4">
                                <div className="relative h-20 w-full mb-2">
                                     <Image src={category.image} alt={category.title} layout="fill" objectFit="contain" data-ai-hint={category.hint} />
                                </div>
                                <h3 className="font-bold">{category.title}</h3>
                                <p className="text-sm text-muted-foreground">{category.tasks}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <section>
                 <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-bold">Ongoing tasks</h2>
                    <Button variant="link" className="text-muted-foreground">See all</Button>
                </div>
                <div className="space-y-4">
                    {ongoingTasks.map(task => (
                        <Card key={task.title} className={`${task.color} border-none`}>
                            <CardContent className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold">{task.title}</h3>
                                    <div className="text-xs font-semibold bg-background/50 px-2 py-1 rounded-md">{task.dueDate}</div>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Team members</p>
                                    <div className="flex -space-x-2">
                                        {task.team.map((member, index) => (
                                            <Avatar key={index} className="h-6 w-6 border-2 border-background">
                                                <AvatarImage src={member.src} alt={member.alt} />
                                                <AvatarFallback>{member.alt[0]}</AvatarFallback>
                                            </Avatar>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <Clock className="h-4 w-4"/>
                                        <span>{task.time}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="relative h-8 w-8">
                                            <Progress value={task.progress} className="h-8 w-8 [&>*]:bg-primary" />
                                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{task.progress}%</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
}
