
'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Loader2, Upload, X, Languages, Camera, Video, AlertCircle, RefreshCw, CircleDot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { getStorage, ref as storageRef, uploadString, getDownloadURL } from "firebase/storage";
import { app } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

const languages = [
    { value: 'English', label: 'English' },
    { value: 'Hindi', label: 'Hindi (हिन्दी)' },
    { value: 'Punjabi', label: 'Punjabi (ਪੰਜਾਬੀ)' },
    { value: 'Kannada', label: 'Kannada (ಕನ್ನಡ)' },
    { value: 'Tamil', label: 'Tamil (தமிழ்)' },
    { value: 'Telugu', label: 'Telugu (తెలుగు)' },
];

const MAX_WIDTH = 600;
const MAX_HEIGHT = 450;
const COMPRESSION_QUALITY = 0.7; // Lowered quality for smaller file size


export default function SymptomCheckerPage() {
  const [symptoms, setSymptoms] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaDataUri, setMediaDataUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(3);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);
  
  const getCameraPermission = async (mode: 'user' | 'environment') => {
    stopCamera(); // Stop any existing stream
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(e => console.error("Video play failed:", e));
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
    }
  };
  
  const handleTabChange = (value: string) => {
      if (value === 'live') {
          getCameraPermission(facingMode);
      } else {
          stopCamera();
      }
  }

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

  const compressAndSetImage = (imageSource: HTMLImageElement | HTMLVideoElement) => {
      if (canvasRef.current) {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            const { width, height } = getResizedDimensions(
                imageSource instanceof HTMLImageElement ? imageSource.width : imageSource.videoWidth,
                imageSource instanceof HTMLImageElement ? imageSource.height : imageSource.videoHeight
            );
            canvas.width = width;
            canvas.height = height;
            context?.drawImage(imageSource, 0, 0, width, height);
            const compressedDataUri = canvas.toDataURL('image/jpeg', COMPRESSION_QUALITY);
            setMediaDataUri(compressedDataUri); // This holds the data for upload
      }
  }

  const handleAnalyze = async () => {
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

    try {
        let photoUrl: string | undefined = undefined;

        if (mediaDataUri) {
            toast({ title: "Uploading image...", description: "Please wait while we upload your symptom photo." });
            const storage = getStorage(app);
            const imageRef = storageRef(storage, `symptom-images/${user.id}/${uuidv4()}.jpg`);
            
            // uploadString expects 'data_url' which is what mediaDataUri is.
            const snapshot = await uploadString(imageRef, mediaDataUri, 'data_url');
            photoUrl = await getDownloadURL(snapshot.ref);
        }

        sessionStorage.setItem('symptomCheckerData', JSON.stringify({
            symptoms,
            photoUrl: photoUrl,
            targetLanguage: targetLanguage
        }));
        router.push(`/symptom-checker/results`);

    } catch (error) {
        console.error("Failed during analysis prep or upload:", error);
        toast({ variant: 'destructive', title: "Upload Failed", description: "Could not upload the image. Please try again." });
        setIsLoading(false);
    }
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

  const takePicture = () => {
    if (videoRef.current) {
        compressAndSetImage(videoRef.current);
        setMediaPreview(videoRef.current.srcObject ? canvasRef.current?.toDataURL('image/jpeg', COMPRESSION_QUALITY) || null : null);
        setMediaType('image');
        stopCamera();
    }
  };

  const startRecording = () => {
    if (!videoRef.current?.srcObject) return;
    setIsRecording(true);
    setCountdown(3);
    recordedChunksRef.current = [];
    
    const options = { mimeType: 'video/webm; codecs=vp9' };
    let supportedMimeType = MediaRecorder.isTypeSupported(options.mimeType) ? options.mimeType : 'video/webm';

    mediaRecorderRef.current = new MediaRecorder(videoRef.current.srcObject as MediaStream, { mimeType: supportedMimeType });
    
    mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
        }
    };
    
    mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: supportedMimeType });
        const videoUrl = URL.createObjectURL(blob);
        
        const videoElement = document.createElement('video');
        videoElement.src = videoUrl;
        videoElement.onloadeddata = () => {
            compressAndSetImage(videoElement); // Extract frame and set for upload
            setMediaPreview(videoUrl); // Show the full video in preview
            setMediaType('video');
        };
        stopCamera();
    };
    
    mediaRecorderRef.current.start();

    const countdownInterval = setInterval(() => {
        setCountdown(prev => prev - 1);
    }, 1000);

    setTimeout(() => {
        clearInterval(countdownInterval);
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
    }, 3000);
  };
  
  const removeMedia = () => {
      setMediaPreview(null);
      setMediaDataUri(null);
      setMediaType(null);
      if(fileInputRef.current) {
          fileInputRef.current.value = "";
      }
      getCameraPermission(facingMode); // Restart camera
  }
  
  const switchCamera = () => {
      const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
      setFacingMode(newFacingMode);
      getCameraPermission(newFacingMode);
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
          
           <Tabs defaultValue="upload" className="w-full" onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload"><Upload className="mr-2 h-4 w-4"/>Upload</TabsTrigger>
                    <TabsTrigger value="live"><Camera className="mr-2 h-4 w-4"/>Live Check</TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="mt-4">
                     <div className="space-y-2">
                        {mediaPreview && mediaType === 'image' ? (
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
                </TabsContent>
                <TabsContent value="live" className="mt-4">
                     <div className="space-y-4">
                        {hasCameraPermission === false && (
                             <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Camera Access Required</AlertTitle>
                                <AlertDescription>
                                    Please allow camera access in your browser to use this feature.
                                </AlertDescription>
                            </Alert>
                        )}
                        
                        <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden">
                            <video ref={videoRef} className={cn("w-full h-full object-cover", { 'hidden': !!mediaPreview })} autoPlay muted playsInline />
                            <canvas ref={canvasRef} className="hidden" />
                             {mediaPreview && mediaType === 'image' && (
                                <div className="relative w-full h-full">
                                  <Image src={mediaPreview} alt="Symptom capture" fill className="object-cover" />
                                </div>
                             )}
                             {mediaPreview && mediaType === 'video' && (
                                <video src={mediaPreview} className="w-full h-full object-cover" autoPlay controls loop />
                             )}
                             {isRecording && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                                    <div className="flex flex-col items-center gap-2">
                                        <CircleDot className="h-8 w-8 text-red-500 animate-pulse"/>
                                        <p className="font-mono text-4xl font-bold">{countdown}</p>
                                    </div>
                                </div>
                             )}
                        </div>

                        <div className="flex gap-2">
                            {mediaPreview ? (
                                <Button variant="outline" className="w-full" onClick={removeMedia}>
                                    Retake
                                </Button>
                            ) : (
                                <>
                                 <Button className="w-full" onClick={takePicture} disabled={hasCameraPermission !== true || isRecording}>
                                    <Camera className="mr-2 h-4 w-4" />
                                    Take Picture
                                 </Button>
                                <Button className="w-full" onClick={startRecording} disabled={hasCameraPermission !== true || isRecording}>
                                    <Video className="mr-2 h-4 w-4" />
                                    Record Video
                                </Button>
                                <Button variant="outline" size="icon" onClick={switchCamera} disabled={hasCameraPermission !== true || isRecording}>
                                    <RefreshCw className="h-4 w-4"/>
                                </Button>
                                </>
                            )}
                        </div>
                     </div>
                </TabsContent>
            </Tabs>

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
