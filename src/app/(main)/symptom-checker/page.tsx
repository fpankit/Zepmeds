
'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Loader2, Upload, X,Languages } from 'lucide-react';
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
    { value: 'German', label: 'German (Deutsch)' },
    { value: 'Chinese', label: 'Chinese (中文)' },
];


export default function SymptomCheckerPage() {
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('English');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageDataUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
      toast({
        variant: 'destructive',
        title: 'Login Required',
        description: 'Please log in to use the AI Symptom Checker.',
      });
      router.push('/login');
      return;
    }

    setIsLoading(true);
    // Store data in session storage to pass to the results page
    sessionStorage.setItem('symptomCheckerData', JSON.stringify({
      symptoms,
      photoDataUri: imageDataUri,
      targetLanguage: targetLanguage
    }));
    router.push(`/symptom-checker/results`);
  };
  
  const removeImage = () => {
      setImagePreview(null);
      setImageDataUri(null);
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
            <label className="font-medium text-sm flex items-center gap-2">
              <Languages className="h-4 w-4"/> Select Language
            </label>
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

          <Textarea
            placeholder="e.g., 'I have a headache, a sore throat, and a slight fever for the last 2 days...'"
            className="min-h-[150px] text-base"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
          
          <div className="space-y-2">
            {imagePreview ? (
              <div className="relative group">
                <Image src={imagePreview} alt="Symptom preview" width={500} height={300} className="rounded-lg object-cover w-full aspect-video" />
                <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={removeImage}>
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
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              'Analyze My Symptoms'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
