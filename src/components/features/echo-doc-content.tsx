
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, Mic, MicOff, Loader2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';

// --- Client-side Speech Recognition Setup ---
const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
let recognition: any;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    // We will let the browser detect the language from the spoken audio.
    // Setting a specific language like 'hi-IN' can limit recognition of other languages.
    // recognition.lang = 'hi-IN'; // This is now removed to allow multi-language input
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
}

type ConversationTurn = {
    role: 'user' | 'model';
    text: string;
};

const INITIAL_GREETING_HI = "नमस्ते, मैं इको डॉक्टर हूँ। आप कैसा महसूस कर रहे हैं?";


// --- Client-side Text-to-Speech with Voice Selection ---
const speakText = (text: string) => {
    try {
        if ('speechSynthesis' in window && text) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Detect language from text
            const isHindi = /[\u0900-\u097F]/.test(text);
            const isPunjabi = /[\u0A00-\u0A7F]/.test(text);
            const isMarathi = isHindi; // Marathi uses Devanagari script like Hindi
            const isTelugu = /[\u0C00-\u0C7F]/.test(text);
            
            let langCode = 'en-IN';
            let preferredGender = 'male'; // Default to male for English

            if (isPunjabi) {
                langCode = 'pa-IN';
                preferredGender = 'male'; // "Gabru Munda" voice (male for Punjabi)
            } else if (isHindi || isMarathi) {
                langCode = 'hi-IN';
                preferredGender = 'female'; // Female for Hindi/Marathi
            } else if (isTelugu) {
                langCode = 'te-IN';
                preferredGender = 'female'; // Default to female for Telugu
            }
            
            utterance.lang = langCode;

            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                 let selectedVoice = voices.find(voice => voice.lang === langCode && voice.name.toLowerCase().includes(preferredGender) && voice.name.includes('Google'));
                 if (!selectedVoice) selectedVoice = voices.find(voice => voice.lang === langCode && voice.name.toLowerCase().includes(preferredGender));
                 if (!selectedVoice) selectedVoice = voices.find(voice => voice.lang === langCode);

                if (selectedVoice) {
                    utterance.voice = selectedVoice;
                }
                window.speechSynthesis.speak(utterance);
            } else {
                 // Fallback if voices are not loaded yet
                window.speechSynthesis.onvoiceschanged = () => {
                    const voices = window.speechSynthesis.getVoices();
                    let selectedVoice = voices.find(voice => voice.lang === langCode && voice.name.toLowerCase().includes(preferredGender) && voice.name.includes('Google'));
                    if (!selectedVoice) selectedVoice = voices.find(voice => voice.lang === langCode && voice.name.toLowerCase().includes(preferredGender));
                    if (!selectedVoice) selectedVoice = voices.find(voice => voice.lang === langCode);

                    if (selectedVoice) {
                        utterance.voice = selectedVoice;
                    }
                    window.speechSynthesis.speak(utterance);
                };
            }
        }
    } catch (e) {
        console.error("Browser speech synthesis failed.", e);
    }
};


// --- Improved Client-Side Logic with Multi-Language Responses ---
const getSimpleResponse = (userText: string): string => {
    const text = userText.toLowerCase();

    // --- Keywords in Multiple Languages ---
    const keywords = {
        greetings: ['hello', 'hi', 'hey', 'namaste', 'namaskar', 'sat sri akal', 'vanakkam', 'namaskaram'],
        thanks: ['thank you', 'thanks', 'dhanyavaad', 'shukriya', 'meharbani', 'nandri'],
        headache: ['headache', 'head pain', 'migraine', 'sar dard', 'sir dard', 'matha dukhta', 'talai vali', 'tala noppi', 'sir pida', 'sir dukhda'],
        fever: ['fever', 'temperature', 'bukhar', 'taap', 'jwar', 'taapmaan', 'kaichal', 'jwaram'],
        cold_cough: ['cold', 'sneeze', 'runny nose', 'cough', 'sardi', 'jukaam', 'khansi', 'zukaam', 'irumal', 'daggu'],
        stomach_pain: ['stomach ache', 'stomach pain', 'pet dard', 'pota dukhta', 'vayiru vali', 'kadupu noppi'],
        vomiting_diarrhea: ['vomiting', 'nausea', 'diarrhea', 'loose motion', 'ulti', 'dast', 'ji michlana', 'pet kharab', 'vaanti', 'bedhi']
    };

    // --- Responses in Multiple Languages ---
    const responses = {
        greetings: {
            en: "Hello! I'm Echo Doc. How are you feeling today?",
            hi: "नमस्ते! मैं इको डॉक्टर हूँ। कृपया बताएं, आज आप कैसा महसूस कर रहे हैं?"
        },
        thanks: {
            en: "You're most welcome! I'm here if you need anything else. Please take care of yourself.",
            hi: "आपका स्वागत है! अगर आपको किसी और चीज की जरूरत है तो मैं यहां हूं। कृपया अपना ध्यान रखें।"
        },
        headache: {
            en: "For a headache, try resting in a quiet, dark room and apply a cold compress to your forehead. Home remedies like ginger tea can be soothing. Over-the-counter medicine like Paracetamol may help. However, for a proper diagnosis, it's very important to consult a real doctor.",
            hi: "सिरदर्द के लिए, शांत, अंधेरे कमरे में आराम करने और अपने माथे पर ठंडा सेक लगाने का प्रयास करें। अदरक की चाय जैसे घरेलू उपचार आरामदायक हो सकते हैं। पैरासिटामॉल जैसी ओवर-द-काउंटर दवा मदद कर सकती है। उचित निदान के लिए, असली डॉक्टर से परामर्श करना बहुत महत्वपूर्ण है।",
            mr: "डोकेदुखीसाठी, शांत, अंधाऱ्या खोलीत आराम करा आणि कपाळावर थंड कॉम्प्रेस लावा. आल्याचा चहासारखे घरगुती उपाय आराम देऊ शकतात. पॅरासिटामॉलसारखे ओव्हर-द-काउंटर औषध मदत करू शकते. योग्य निदानासाठी, डॉक्टरांचा सल्ला घेणे खूप महत्वाचे आहे.",
            pa: "ਸਿਰ ਦਰਦ ਲਈ, ਇੱਕ ਸ਼ਾਂਤ, ਹਨੇਰੇ ਕਮਰੇ ਵਿੱਚ ਆਰਾਮ ਕਰਨ ਦੀ ਕੋਸ਼ਿਸ਼ ਕਰੋ ਅਤੇ ਆਪਣੇ ਮੱਥੇ 'ਤੇ ਠੰਡਾ ਸੇਕ ਲਗਾਓ। ਅਦਰਕ ਦੀ ਚਾਹ ਵਰਗੇ ਘਰੇਲੂ ਉਪਚਾਰ ਆਰਾਮਦਾਇਕ ਹੋ ਸਕਦੇ ਹਨ। ਪੈਰਾਸੀਟਾਮੋਲ ਵਰਗੀ ਓਵਰ-ਦ-ਕਾਊਂਟਰ ਦਵਾਈ ਮਦਦ ਕਰ ਸਕਦੀ ਹੈ। ਸਹੀ ਨਿਦਾਨ ਲਈ, ਅਸਲੀ ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਕਰਨਾ ਬਹੁਤ ਜ਼ਰੂਰੀ ਹੈ।",
            te: "తలనొప్పి కోసం, నిశ్శబ్దమైన, చీకటి గదిలో విశ్రాంతి తీసుకోండి మరియు మీ నుదిటిపై చల్లని కట్టు వేయండి. అల్లం టీ వంటి ఇంటి నివారణలు ఉపశమనం కలిగిస్తాయి. పారాసెటమాల్ వంటి ఓవర్-ది-కౌంటర్ మందులు సహాయపడవచ్చు. సరైన రోగ నిర్ధారణ కోసం, నిజమైన వైద్యుడిని సంప్రదించడం చాలా ముఖ్యం."
        },
        fever: {
            hi: "मुझे समझ में आया कि आपको बुखार है। शरीर के तापमान को कम करने के लिए पैरासिटामॉल ले सकते हैं और माथे पर ठंडे पानी की पट्टियां रख सकते हैं। खूब सारे तरल पदार्थ पिएं और आराम करें। यदि बुखार 3 दिनों से अधिक रहता है, तो कृपया डॉक्टर से मिलें।",
            en: "It seems you have a fever. You can take Paracetamol to reduce body temperature and place cool water strips on the forehead. Drink plenty of fluids and rest. If the fever persists for more than 3 days, please see a doctor."
        },
        cold_cough: {
            hi: "मैं समझता हूं कि आप सर्दी और खांसी से जूझ रहे हैं। मैं गर्म नमक के पानी से गरारे करने और भाप लेने की सलाह देता हूं। खांसी के लिए, आप बेनाड्रिल जैसा ओवर-द-काउंटर सिरप आजमा सकते हैं। लेकिन कृपया याद रखें, यह चिकित्सा सलाह का विकल्प नहीं है।",
            en: "I understand you're dealing with a cold and cough. I recommend gargling with warm salt water and taking steam. For the cough, you can try an over-the-counter syrup like Benadryl. But please remember, this is not a substitute for medical advice."
        },
        stomach_pain: {
            hi: "पेट दर्द के लिए, आप गर्म पानी की थैली से सेंक कर सकते हैं और अजवाइन का पानी पी सकते हैं। यह गैस या अपच से राहत दिलाने में मदद कर सकता है। डाइजीन जैसी ओवर-द-काउंटर दवा भी मदद कर सकती है। लेकिन अगर दर्द गंभीर है या लगातार बना रहता है, तो डॉक्टर से सलाह लेना बहुत ज़रूरी है।",
            en: "For stomach pain, you can try a hot water bag and drink carom seed water. This might help with gas or indigestion. An over-the-counter medicine like Digene might also help. But if the pain is severe or persistent, it is very important to consult a doctor."
        },
        vomiting_diarrhea: {
            hi: "मतली या दस्त के लिए, हाइड्रेटेड रहना महत्वपूर्ण है। खूब पानी या ORS घोल पिएं। घरेलू उपचार के लिए, अदरक मतली में मदद कर सकता है, और केला और चावल का आहार दस्त में मदद कर सकता है। लेकिन अगर लक्षण गंभीर हैं, तो कृपया तुरंत डॉक्टर से मिलें।",
            en: "For nausea or diarrhea, staying hydrated is crucial. Drink plenty of water or ORS solution. For home remedies, ginger can help with nausea, and a diet of bananas and rice can help with diarrhea. But if symptoms are severe, please see a doctor immediately."
        },
        fallback: {
            en: "I'm sorry, I can only provide basic information on a few common symptoms. For any serious medical concerns, it is always best to consult a qualified doctor for a proper diagnosis and treatment.",
            hi: "माफ़ कीजिए, मैं कुछ सामान्य लक्षणों के बारे में ही बुनियादी जानकारी दे सकता हूँ। किसी भी गंभीर चिकित्सा चिंता के लिए, उचित निदान और उपचार के लिए हमेशा एक योग्य डॉक्टर से परामर्श करना सबसे अच्छा होता है।"
        }
    };

    // Improved keyword checker for multi-word phrases
    const hasKeyword = (userWords: string, keywordsToCheck: string[]) => {
        return keywordsToCheck.some(kw => {
            const keywordParts = kw.split(' ');
            return keywordParts.every(part => userWords.includes(part));
        });
    }

    if (hasKeyword(text, keywords.greetings)) return responses.greetings.hi;
    if (hasKeyword(text, keywords.thanks)) return responses.thanks.hi;
    
    if (hasKeyword(text, keywords.headache)) {
        if(hasKeyword(text, ['sir pida', 'sir dukhda'])) return responses.headache.pa;
        if(hasKeyword(text, ['sar', 'sir', 'matha'])) return responses.headache.hi;
        if(hasKeyword(text, ['doke'])) return responses.headache.mr;
        if(hasKeyword(text, ['tala'])) return responses.headache.te;
        return responses.headache.en;
    }
    
    if (hasKeyword(text, keywords.fever)) return responses.fever.hi;
    if (hasKeyword(text, keywords.cold_cough)) return responses.cold_cough.hi;
    if (hasKeyword(text, keywords.stomach_pain)) return responses.stomach_pain.hi;
    if (hasKeyword(text, keywords.vomiting_diarrhea)) return responses.vomiting_diarrhea.hi;

    // Default Fallback
    return responses.fallback.hi;
};


export function EchoDocContent() {
    const router = useRouter();
    const { toast } = useToast();
    
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [conversation, setConversation] = useState<ConversationTurn[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const wakeLockRef = useRef<any>(null);

    const acquireWakeLock = useCallback(async () => {
        if ('wakeLock' in navigator) {
            try {
                wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
            } catch (err) {
                // The error is not critical, so we just ignore it.
            }
        }
    }, []);

    const releaseWakeLock = useCallback(() => {
        if (wakeLockRef.current) {
            wakeLockRef.current.release();
            wakeLockRef.current = null;
        }
    }, []);

    useEffect(() => {
        setIsMounted(true);
        // Pre-load voices for TTS, important for some browsers
        if ('speechSynthesis' in window && window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
                // Voices loaded
            };
        }
        
        speakText(INITIAL_GREETING_HI);
        setConversation([{ role: 'model', text: INITIAL_GREETING_HI }]);
        
        return () => {
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            if (recognition) recognition.stop();
            releaseWakeLock();
        };
    }, [releaseWakeLock]);
    
    const handleRecognitionResult = (event: any) => {
        const userText = event.results[0][0].transcript;
        if (userText) {
            setConversation(prev => [...prev, { role: 'user', text: userText }]);
            
            // Get and speak the simple, hardcoded response
            const aiResponseText = getSimpleResponse(userText);
            setConversation(prev => [...prev, { role: 'model', text: aiResponseText }]);
            speakText(aiResponseText);
        }
        stopListening();
    };

    const handleRecognitionError = (event: any) => {
        toast({ variant: 'destructive', title: 'Speech Recognition Error', description: `Could not understand audio. Reason: ${event.error}` });
        stopListening();
    };
    
    const startListening = () => {
        if (!SpeechRecognition) {
            toast({ variant: 'destructive', title: 'Browser Not Supported', description: 'Your browser does not support Speech Recognition.' });
            return;
        }
        if (isRecording || isProcessing) return;

        setIsRecording(true);
        setIsProcessing(true); // Prevents re-triggering
        acquireWakeLock();
        
        // Dynamically set languages to recognize
        recognition.lang = 'hi-IN'; // Prioritize Hindi
        recognition.onresult = handleRecognitionResult;
        recognition.onerror = handleRecognitionError;
        recognition.start();
    };

    const stopListening = () => {
        if (recognition) recognition.stop();
        setIsRecording(false);
        setIsProcessing(false);
        releaseWakeLock();
    };

    if (!isMounted) {
        return (
            <div className="flex flex-col h-screen w-full items-center justify-center bg-background">
                 <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen w-full bg-background">
            <header className="sticky top-0 z-10 flex items-center p-4 bg-background border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <div className="flex items-center gap-3 ml-4">
                    <div className="relative"><Bot className="h-8 w-8 text-teal-400" /><span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" /></div>
                    <div><h1 className="text-lg font-bold">Echo Doc</h1><p className="text-xs text-muted-foreground">AI Health Assistant</p></div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                    {conversation.map((turn, index) => (
                        <motion.div
                            key={index}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${turn.role === 'model' ? 'justify-start' : 'justify-end'}`}
                        >
                            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${turn.role === 'model' ? 'bg-card' : 'bg-primary text-primary-foreground'}`}>
                                <p>{turn.text}</p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </main>

            <footer className="p-4 border-t bg-background">
                <div className="flex flex-col items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        {isRecording ? "Listening..." : "Press the button to speak"}
                    </p>
                    <button
                        onClick={isRecording ? stopListening : startListening}
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-red-500 scale-110' : 'bg-primary'}`}
                    >
                       {isRecording ? <MicOff className="h-8 w-8 text-white" /> : <Mic className="h-8 w-8 text-white" />}
                    </button>
                    <p className="text-xs text-muted-foreground text-center">
                        This is a demo and not a real AI. Always consult a real doctor for medical advice.
                    </p>
                </div>
            </footer>
        </div>
    );
}
