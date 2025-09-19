'use client';

import { useState, useRef, ChangeEvent, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Loader2, Upload, X, Languages, Calendar, Pill, ShieldAlert, User, History, ChevronRight, Mic, MicOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AiSymptomCheckerInput, AiSymptomCheckerOutput } from '@/ai/flows/ai-symptom-checker';
import { cn } from '@/lib/utils';

// --- Client-side Speech Recognition Setup ---
const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
let recognition: any;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-IN'; // Can be changed dynamically
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
}


const languages = [
    { value: 'English', label: 'English' },
    { value: 'Hindi', label: 'Hindi (हिन्दी)' },
    { value: 'Punjabi', label: 'Punjabi (ਪੰਜਾਬੀ)' },
    { value: 'Kannada', label: 'Kannada (ಕನ್ನಡ)' },
    { value: 'Tamil', label: 'Tamil (தமிழ்)' },
    { value: 'Telugu', label: 'Telugu (తెలుగు)' },
];

const MAX_WIDTH = 800;
const MAX_HEIGHT = 600;
const COMPRESSION_QUALITY = 0.7;

interface HistoryItem {
    id: string;
    input: AiSymptomCheckerInput;
    result: AiSymptomCheckerOutput;
    timestamp: string;
}


export default function SymptomCheckerPage() {
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaDataUri, setMediaDataUri] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [age, setAge] = useState('');
  const [duration, setDuration] = useState('');
  const [pastMedications, setPastMedications] = useState('');
  const [allergies, setAllergies] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    try {
        const storedHistory = localStorage.getItem('symptomCheckerHistory');
        if (storedHistory) {
            setHistory(JSON.parse(storedHistory));
        }
    } catch (e) {
        console.error("Could not parse history from localStorage", e);
        // If parsing fails, it might be good to clear the corrupted data
        localStorage.removeItem('symptomCheckerHistory');
    }
  }, []);
  

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const image = document.createElement('img');
        image.src = reader.result as string;
        image.onload = () => {
            compressAndSetImage(image);
        };
      };
      reader.readAsDataURL(file);
  }

  const compressAndSetImage = (imageSource: HTMLImageElement) => {
      if (canvasRef.current) {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            const { width, height } = getResizedDimensions(
                imageSource.width,
                imageSource.height
            );
            canvas.width = width;
            canvas.height = height;
            context?.drawImage(imageSource, 0, 0, width, height);
            const compressedDataUri = canvas.toDataURL('image/jpeg', COMPRESSION_QUALITY);
            setMediaDataUri(compressedDataUri); // This holds the data for upload
            setMediaPreview(compressedDataUri); // Also use it for preview
      }
  }
  
  const handleVoiceInput = useCallback(() => {
    if (!SpeechRecognition) {
        toast({ variant: 'destructive', title: 'Browser Not Supported', description: 'Speech recognition is not available in your browser.' });
        return;
    }

    if (isListening) {
        recognition.stop();
        setIsListening(false);
        return;
    }

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
        toast({ variant: 'destructive', title: 'Voice Input Error', description: `Could not process audio. Error: ${event.error}` });
        setIsListening(false);
    };
    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSymptoms(prev => prev ? `${prev}. ${transcript}` : transcript);
    };

    recognition.start();

  }, [isListening, toast]);

  const handleAnalyze = () => {
    if (!symptoms.trim()) {
      toast({
        variant: 'destructive',
        title: 'Symptoms Required',
        description: 'Please describe your symptoms before analyzing.',
      });
      return;
    }

    if (!user || user.isGuest) {
      toast({ variant: 'destructive', title: 'Login Required' });
      router.push('/login');
      return;
    }

    setIsLoading(true);

    // Save data to session storage and redirect to results page
    sessionStorage.setItem('symptomCheckerData', JSON.stringify({
        symptoms,
        mediaDataUri, // Pass the data URI directly
        targetLanguage,
        age,
        duration,
        pastMedications,
        allergies,
    }));
    router.push(`/symptom-checker/results`);
  };
  
  const getResizedDimensions = (originalWidth: number, originalHeight: number) => {
    let width = originalWidth;
    let height = originalHeight;

    if (width > height) {
        if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
        }
    } else {
        if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
        }
    }
    return { width, height };
  }

  const removeMedia = () => {
      setMediaPreview(null);
      setMediaDataUri(null);
      if(fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  }

  const viewHistoryItem = (item: HistoryItem) => {
      sessionStorage.setItem('symptomCheckerHistoryItem', JSON.stringify(item));
      router.push('/symptom-checker/results');
  }

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <BrainCircuit className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-3xl font-bold">AI Symptom Checker</CardTitle>
          <CardDescription>Describe your symptoms, and our AI will provide initial guidance. This is not a substitute for professional medical advice.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="space-y-2">
            <Label htmlFor="symptoms-text" className="font-medium">Describe your primary symptoms*</Label>
            <div className="relative">
              <Textarea
                id="symptoms-text"
                placeholder="e.g., 'I have a headache, a sore throat, and a slight fever for the last 2 days...'"
                className="min-h-[120px] text-base pr-12"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
              <Button
                size="icon"
                variant="ghost"
                className={cn("absolute top-2 right-2 text-muted-foreground", isListening && "text-destructive animate-pulse")}
                onClick={handleVoiceInput}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age" className="flex items-center gap-2"><User className="h-4 w-4"/>Age*</Label>
                <Input id="age" type="number" placeholder="e.g., 25" value={age} onChange={(e) => setAge(e.target.value)} />
              </div>
              <div className="space-y-2">
                 <Label htmlFor="duration" className="flex items-center gap-2"><Calendar className="h-4 w-4"/>Symptom Duration*</Label>
                 <Input id="duration" placeholder="e.g., 3 days" value={duration} onChange={(e) => setDuration(e.target.value)} />
              </div>
          </div>
          
           <div className="space-y-2">
            <Label htmlFor="medications" className="flex items-center gap-2"><Pill className="h-4 w-4"/>Past Medications</Label>
            <Textarea
              id="medications"
              placeholder="Any current or recent medications? (e.g., 'Took Paracetamol 4 hours ago')"
              className="min-h-[60px]"
              value={pastMedications}
              onChange={(e) => setPastMedications(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies" className="flex items-center gap-2"><ShieldAlert className="h-4 w-4"/>Allergies</Label>
            <Textarea
              id="allergies"
              placeholder="Do you have any known allergies? (e.g., 'Allergic to Penicillin, dust')"
              className="min-h-[60px]"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="font-medium text-sm flex items-center gap-2">
              <Languages className="h-4 w-4"/> Select Language
            </div>
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                   <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
              <canvas ref={canvasRef} className="hidden" />
              {mediaPreview ? (
              <div className="relative group w-full aspect-video">
                  <Image src={mediaPreview} alt="Symptom preview" fill className="rounded-lg object-cover" />
                  <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={removeMedia}>
                  <X className="h-5 w-5" />
                  </Button>
              </div>
              ) : (
              <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload a Photo (Optional)
              </Button>
              )}
              <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/png, image/jpeg"
              />
          </div>

        </CardContent>
        <CardFooter>
          <Button
            className="w-full text-lg"
            onClick={handleAnalyze}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {isLoading ? 'Processing...' : 'Analyze My Symptoms'}
          </Button>
        </CardFooter>
      </Card>
      
      {history.length > 0 && (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History className="text-primary"/>
                    Analysis History
                </CardTitle>
                <CardDescription>View your past symptom analyses, available offline.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {history.map(item => (
                    <div key={item.id} className="p-4 rounded-lg bg-card/50 border flex items-center justify-between cursor-pointer hover:bg-card/80" onClick={() => viewHistoryItem(item)}>
                        <div>
                            <p className="font-semibold truncate max-w-xs">{item.input.symptoms}</p>
                            <p className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground"/>
                    </div>
                ))}
            </CardContent>
        </Card>
      )}
    </div>
  );
}
