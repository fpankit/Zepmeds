
'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp, doc, updateDoc, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Video, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp;
}

interface ChatDetails {
    id: string;
    participants: string[];
    participantDetails: {
        [key: string]: {
            name: string;
            photoURL: string | null;
        }
    };
}


const ChatSkeleton = () => (
    <div className="p-4 space-y-4">
        <div className="flex justify-end"><Skeleton className="h-10 w-48 rounded-lg" /></div>
        <div className="flex justify-start"><Skeleton className="h-10 w-64 rounded-lg" /></div>
        <div className="flex justify-end"><Skeleton className="h-12 w-32 rounded-lg" /></div>
        <div className="flex justify-start"><Skeleton className="h-8 w-56 rounded-lg" /></div>
    </div>
);

export default function ChatRoomPage() {
    const { user, loading: authLoading } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatDetails, setChatDetails] = useState<ChatDetails | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const params = useParams();
    const chatId = params.id as string;
    const { toast } = useToast();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (authLoading || !chatId) return;
        if (!user || user.isGuest) {
            router.push('/login');
            return;
        }
        
        const chatDocRef = doc(db, 'chats', chatId);
        const unsubscribeChat = onSnapshot(chatDocRef, (doc) => {
            if(doc.exists()) {
                setChatDetails({ id: doc.id, ...doc.data() } as ChatDetails);
            }
        });

        const messagesQuery = query(
            collection(db, 'chats', chatId, 'messages'),
            orderBy('timestamp', 'asc')
        );

        const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Message));
            setMessages(fetchedMessages);
            setIsLoading(false);
        });

        return () => {
            unsubscribeChat();
            unsubscribeMessages();
        }
    }, [chatId, user, authLoading, router]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !chatId) return;

        const messageText = newMessage;
        setNewMessage('');

        const messagesColRef = collection(db, 'chats', chatId, 'messages');
        const chatDocRef = doc(db, 'chats', chatId);

        try {
            await addDoc(messagesColRef, {
                senderId: user.id,
                text: messageText,
                timestamp: serverTimestamp(),
            });

            await updateDoc(chatDocRef, {
                lastMessage: messageText,
                lastMessageTimestamp: serverTimestamp(),
            });

        } catch (error) {
            console.error("Error sending message:", error);
            toast({ variant: 'destructive', title: 'Failed to send message' });
            setNewMessage(messageText); // Restore message on failure
        }
    };

    const handleVideoCall = async () => {
        if (!chatDetails || !user) return;
        
        const otherParticipantId = chatDetails.participants.find(p => p !== user.id);
        const otherParticipantDetails = otherParticipantId ? chatDetails.participantDetails[otherParticipantId] : null;

        if (!otherParticipantId || !otherParticipantDetails) {
            toast({ variant: 'destructive', title: 'Could not start video call.' });
            return;
        }

        try {
            // Re-fetch appointment if needed or create a temporary call object
            const callDocRef = await addDoc(collection(db, 'zep_calls'), {
                doctorId: user.isDoctor ? user.id : otherParticipantId,
                doctorName: user.isDoctor ? `${user.firstName} ${user.lastName}` : otherParticipantDetails.name,
                patientId: user.isDoctor ? otherParticipantId : user.id,
                patientName: user.isDoctor ? otherParticipantDetails.name : `${user.firstName} ${user.lastName}`,
                status: 'ringing',
                createdAt: serverTimestamp(),
            });
            
            toast({ title: "Starting Video Call...", description: "Ringing the other person." });
            router.push(`/call/${callDocRef.id}`);

        } catch(error) {
            console.error("Error initiating call from chat:", error);
            toast({ variant: 'destructive', title: 'Call Failed', description: 'Could not initiate video call.' });
        }
    }


    const otherParticipant = chatDetails && user ? chatDetails.participantDetails[chatDetails.participants.find(p => p !== user.id)!] : null;
    const getInitials = (name: string) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }
    
    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="sticky top-0 z-10 flex items-center justify-between p-2.5 bg-background border-b">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    {otherParticipant ? (
                        <>
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={otherParticipant.photoURL || undefined} alt={otherParticipant.name} />
                                <AvatarFallback>{getInitials(otherParticipant.name)}</AvatarFallback>
                            </Avatar>
                            <span className="font-bold">{otherParticipant.name}</span>
                        </>
                    ) : (
                         <div className="flex items-center gap-2">
                             <Skeleton className="h-9 w-9 rounded-full" />
                             <Skeleton className="h-5 w-24" />
                         </div>
                    )}
                </div>
                <Button variant="ghost" size="icon" onClick={handleVideoCall}>
                    <Video className="h-6 w-6" />
                </Button>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? <ChatSkeleton /> : messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-2xl max-w-xs lg:max-w-md ${msg.senderId === user?.id ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card rounded-bl-none'}`}>
                            <p className="text-sm">{msg.text}</p>
                            {msg.timestamp && (
                                <p className={`text-xs mt-1 ${msg.senderId === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                    {format(msg.timestamp.toDate(), 'p')}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
                 <div ref={messagesEndRef} />
            </main>

            <footer className="p-4 border-t bg-background">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Input 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                        autoComplete="off"
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                        <Send className="h-5 w-5" />
                    </Button>
                </form>
            </footer>
        </div>
    );
}

