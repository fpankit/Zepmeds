
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, User } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MessageSquare, AlertTriangle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

interface Chat {
    id: string;
    participants: string[];
    participantDetails: {
        [key: string]: {
            name: string;
            photoURL: string | null;
        }
    };
    lastMessage: string;
    lastMessageTimestamp: Timestamp;
}

const ChatSkeleton = () => (
    <div className="space-y-4">
        <div className="flex items-center space-x-4 p-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
        <div className="flex items-center space-x-4 p-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
    </div>
);


export default function ChatsPage() {
    const { user, loading: authLoading } = useAuth();
    const [chats, setChats] = useState<Chat[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (authLoading) return;
        if (!user || user.isGuest) {
            setIsLoading(false);
            return;
        }

        const q = query(
            collection(db, 'chats'),
            where('participants', 'array-contains', user.id),
            orderBy('lastMessageTimestamp', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedChats = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Chat));
            setChats(fetchedChats);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching chats:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading]);

    const getOtherParticipant = (chat: Chat) => {
        if (!user) return null;
        const otherId = chat.participants.find(p => p !== user.id);
        return otherId ? chat.participantDetails[otherId] : null;
    }

    const getInitials = (name: string) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }
    
    if(authLoading) {
        return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    
    if (user?.isGuest) {
        return (
            <div className="flex flex-col h-screen bg-background">
              <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-6 w-6" /></Button>
                <h1 className="text-xl font-bold">My Chats</h1>
                <div className="w-8" />
              </header>
              <main className="flex-1 flex items-center justify-center p-4">
                  <Card className="text-center p-10">
                      <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
                      <h3 className="text-xl font-semibold mt-4">Login Required</h3>
                      <p className="text-muted-foreground">Please log in to see your chats.</p>
                      <Button asChild className="mt-4"><a href="/login">Login</a></Button>
                  </Card>
              </main>
          </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold">My Chats</h1>
                <div className="w-8" />
            </header>
            <main className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <ChatSkeleton />
                ) : chats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                        <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold">No Chats Yet</h3>
                        <p className="text-muted-foreground">Start a conversation with a doctor to see it here.</p>
                        <Button asChild variant="default" className="mt-4">
                            <Link href="/doctor">Find a Doctor</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {chats.map(chat => {
                            const otherUser = getOtherParticipant(chat);
                            if (!otherUser) return null;
                            
                            return (
                                <Link href={`/chat/${chat.id}`} key={chat.id}>
                                    <div className="p-4 flex items-center space-x-4 hover:bg-card/50">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={otherUser.photoURL || undefined} alt={otherUser.name}/>
                                            <AvatarFallback>{getInitials(otherUser.name)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="flex justify-between items-center">
                                                <p className="font-bold truncate">{otherUser.name}</p>
                                                {chat.lastMessageTimestamp && (
                                                    <p className="text-xs text-muted-foreground shrink-0 ml-2">
                                                        {formatDistanceToNow(chat.lastMessageTimestamp.toDate(), { addSuffix: true })}
                                                    </p>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">{chat.lastMessage || '...'}</p>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}

