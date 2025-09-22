
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  useHMSActions,
  useHMSStore,
  selectRoom,
  selectRemotePeers,
  selectAudioTrackByPeerID,
  useAVToggle,
} from '@100mslive/react-sdk';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Languages } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { languageOptions } from '@/locales/language-options';
import { liveTranslateFlow } from '@/ai/flows/live-translate-flow';
import { useToast } from '@/hooks/use-toast';
import { Captions } from './conference';


// Helper function to speak text using browser's SpeechSynthesis API
const speakText = (text: string, lang: string) => {
    try {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang; // Use the target language code

            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                const selectedVoice = voices.find(voice => voice.lang === utterance.lang && voice.default) || voices.find(voice => voice.lang === utterance.lang);
                if (selectedVoice) {
                    utterance.voice = selectedVoice;
                }
                window.speechSynthesis.speak(utterance);
            } else {
                // Fallback if voices are not loaded yet
                window.speechSynthesis.onvoiceschanged = () => {
                     const voices = window.speechSynthesis.getVoices();
                     const selectedVoice = voices.find(voice => voice.lang === utterance.lang && voice.default) || voices.find(voice => voice.lang === utterance.lang);
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

// This component will handle listening to the remote peer's audio
const RemotePeerAudioProcessor = ({ isTranslationEnabled, myLanguage, peerLanguage, setCaptions }: { isTranslationEnabled: boolean, myLanguage: string, peerLanguage: string, setCaptions: (captions: Captions) => void }) => {
    const remotePeers = useHMSStore(selectRemotePeers);
    const remotePeer = remotePeers.length > 0 ? remotePeers[0] : null;
    const audioTrack = useHMSStore(selectAudioTrackByPeerID(remotePeer?.id));
    const hmsActions = useHMSActions();
    
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const isProcessingRef = useRef(false);
    const { toast } = useToast();

    // Mute/unmute remote peer based on translation status
    useEffect(() => {
        if (audioTrack) {
            hmsActions.setVolume(isTranslationEnabled ? 0 : 100, audioTrack.id);
        }
        return () => {
            // Unmute when component unmounts
            if (audioTrack) {
                hmsActions.setVolume(100, audioTrack.id);
            }
             if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, [isTranslationEnabled, audioTrack, hmsActions]);

    const processAudioChunk = useCallback(async (audioBlob: Blob) => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = reader.result as string;
                
                const result = await liveTranslateFlow({
                    audioDataUri: base64Audio,
                    sourceLanguage: peerLanguage,
                    targetLanguage: myLanguage,
                });
                
                if (result && result.translatedText) {
                    // Play the translated text using client-side TTS
                    speakText(result.translatedText, myLanguage);

                    // Update the captions state for display
                    setCaptions({
                        original: result.transcribedText,
                        translated: result.translatedText,
                    });
                }
                isProcessingRef.current = false;
            };
        } catch (error) {
            console.error("Translation flow error:", error);
            toast({
                variant: 'destructive',
                title: 'Translation Error',
                description: 'Could not translate audio chunk.'
            });
            isProcessingRef.current = false;
        }
    }, [peerLanguage, myLanguage, toast, setCaptions]);

    useEffect(() => {
        if (isTranslationEnabled && audioTrack?.nativeTrack) {
            const stream = new MediaStream([audioTrack.nativeTrack]);
            
            const mimeType = MediaRecorder.isTypeSupported('audio/webm; codecs=opus')
                ? 'audio/webm; codecs=opus'
                : 'audio/webm';

            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    processAudioChunk(event.data);
                }
            };
            
            mediaRecorderRef.current.start(3000); // Process audio in 3-second chunks

            return () => {
                mediaRecorderRef.current?.stop();
            };
        } else {
            mediaRecorderRef.current?.stop();
        }
    }, [isTranslationEnabled, audioTrack, processAudioChunk]);

    return null;
}


export function Controls({ setCaptions }: { setCaptions: (captions: Captions) => void }) {
  const hmsActions = useHMSActions();
  const router = useRouter();
  const room = useHMSStore(selectRoom);
  const { user } = useAuth();
  const { isLocalAudioEnabled, isLocalVideoEnabled, toggleAudio, toggleVideo } = useAVToggle();
  
  const [isTranslationEnabled, setIsTranslationEnabled] = useState(false);
  const [myLanguage, setMyLanguage] = useState('en');
  const [peerLanguage, setPeerLanguage] = useState('hi');

  const leaveRoom = async () => {
    // room.name contains the appointment ID
    if (room && room.name) {
      try {
        const appointmentId = room.name;
        const appointmentDocRef = doc(db, 'appointments', appointmentId);
        // Set the status of the appointment to 'completed'
        await updateDoc(appointmentDocRef, { status: 'completed' });
      } catch (error) {
        console.warn("Could not update appointment status to completed:", error);
      }
    }
    
    await hmsActions.leave();
    // Redirect to appointments page after leaving
    router.push('/appointments');
  };

  return (
    <>
    <RemotePeerAudioProcessor isTranslationEnabled={isTranslationEnabled} myLanguage={myLanguage} peerLanguage={peerLanguage} setCaptions={setCaptions} />
    <div className="bg-black/50 p-4">
      <div className="flex items-center justify-center gap-4">
        <Button onClick={toggleAudio} size="icon" className={`h-14 w-14 rounded-full ${isLocalAudioEnabled ? 'bg-gray-600' : 'bg-red-600'}`}>
          {isLocalAudioEnabled ? <Mic /> : <MicOff />}
        </Button>
        <Button onClick={toggleVideo} size="icon" className={`h-14 w-14 rounded-full ${isLocalVideoEnabled ? 'bg-gray-600' : 'bg-red-600'}`}>
          {isLocalVideoEnabled ? <Video /> : <VideoOff />}
        </Button>
        
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className={`h-14 w-14 rounded-full ${isTranslationEnabled ? 'bg-blue-600 ring-2 ring-blue-400' : 'bg-gray-600'}`}>
                    <Languages />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 mb-4">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Live Translation</h4>
                        <p className="text-sm text-muted-foreground">
                            Translate the call in real-time.
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="translation-switch">Enable Translation</Label>
                            <Switch
                                id="translation-switch"
                                checked={isTranslationEnabled}
                                onCheckedChange={setIsTranslationEnabled}
                            />
                        </div>
                         <div className="flex items-center justify-between">
                            <Label htmlFor="my-language">I want to hear in</Label>
                             <Select value={myLanguage} onValueChange={setMyLanguage}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    {languageOptions.map(lang => (
                                        <SelectItem key={lang.code} value={lang.code}>
                                            {lang.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="peer-language">Other person is speaking</Label>
                             <Select value={peerLanguage} onValueChange={setPeerLanguage}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    {languageOptions.map(lang => (
                                        <SelectItem key={lang.code} value={lang.code}>
                                            {lang.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
        
        <Button onClick={leaveRoom} variant="destructive" size="icon" className="h-14 w-14 rounded-full">
          <PhoneOff />
        </Button>
      </div>
    </div>
    </>
  );
}
