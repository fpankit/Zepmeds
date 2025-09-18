
'use client';

import { useState } from 'react';
import {
  useHMSActions,
  useHMSStore,
  selectIsLocalAudioEnabled,
  selectIsLocalVideoEnabled,
  selectRoom,
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


export function Controls() {
  const hmsActions = useHMSActions();
  const router = useRouter();
  const room = useHMSStore(selectRoom);
  const { user } = useAuth();
  const isLocalAudioEnabled = useHMSStore(selectIsLocalAudioEnabled);
  const isLocalVideoEnabled = useHMSStore(selectIsLocalVideoEnabled);
  
  const [isTranslationEnabled, setIsTranslationEnabled] = useState(false);
  const [myLanguage, setMyLanguage] = useState('en');

  const toggleAudio = async () => {
    await hmsActions.setLocalAudioEnabled(!isLocalAudioEnabled);
  };

  const toggleVideo = async () => {
    await hmsActions.setLocalVideoEnabled(!isLocalVideoEnabled);
  };

  const leaveRoom = async () => {
    if (room && room.name && user && !user.isDoctor) {
      try {
        const callId = room.name;
        const callDocRef = doc(db, 'video_calls', callId);
        await updateDoc(callDocRef, { status: 'completed' });
      } catch (error) {
        console.warn("Could not update call status to completed (document might already be deleted):", error);
      }
    }
    
    await hmsActions.leave();
    router.push('/home');
  };

  return (
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
                <Button variant="outline" size="icon" className={`h-14 w-14 rounded-full ${isTranslationEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}>
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
                            <Label htmlFor="my-language">My Language</Label>
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
                    </div>
                </div>
            </PopoverContent>
        </Popover>
        
        <Button onClick={leaveRoom} variant="destructive" size="icon" className="h-14 w-14 rounded-full">
          <PhoneOff />
        </Button>
      </div>
    </div>
  );
}
