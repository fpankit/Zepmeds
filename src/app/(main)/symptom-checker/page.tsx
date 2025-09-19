
'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Loader2, Upload, X, Languages } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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


export default function SymptomCheckerPage() {
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaDataUri, setMediaDataUri] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('English');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  

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

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <BrainCircuit className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-3xl font-bold">AI Symptom Checker</CardTitle>
          <CardDescription>Describe your symptoms, and our AI will provide initial guidance. This is not a substitute for professional medical advice.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Textarea
              placeholder="e.g., 'I have a headache, a sore throat, and a slight fever for the last 2 days...'"
              className="min-h-[150px] text-base"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            />
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
    </div>
  );
}
