
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import jsQR from 'jsqr';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Loader2, CameraOff, QrCode, History } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ScannedData {
  medicine_id: string;
  batch_no: string;
  expiry_date: string;
  manufacturer: string;
}

interface VerificationResult {
  status: 'verified' | 'counterfeit' | 'expired';
  data: ScannedData;
  productName: string;
  scannedAt: string;
}

type ScanHistoryItem = VerificationResult;

export default function VerifyMedicinePage() {
  const router = useRouter();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);

  useEffect(() => {
    // Load scan history from local storage
    const storedHistory = localStorage.getItem('zepmeds_scan_history');
    if (storedHistory) {
      setScanHistory(JSON.parse(storedHistory));
    }
  }, []);

  const saveScanToHistory = (scanResult: VerificationResult) => {
    const updatedHistory = [scanResult, ...scanHistory].slice(0, 20); // Keep last 20 scans
    setScanHistory(updatedHistory);
    localStorage.setItem('zepmeds_scan_history', JSON.stringify(updatedHistory));
  };


  const getCameraPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCameraPermission(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions to use this feature.',
      });
    }
  }, [toast]);

  useEffect(() => {
    getCameraPermission();
     return () => {
      // Stop camera stream when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [getCameraPermission]);

  const tick = useCallback(() => {
    if (isScanning && videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });
        if (code) {
          setIsScanning(false);
          handleScan(code.data);
        }
      }
    }
    requestAnimationFrame(tick);
  }, [isScanning]);

  useEffect(() => {
    if (hasCameraPermission) {
      requestAnimationFrame(tick);
    }
  }, [hasCameraPermission, tick]);

  const handleScan = async (data: string) => {
    setIsLoading(true);
    setResult(null);

    try {
      if (!data) {
        throw new Error("QR code is empty.");
      }
      
      let parsedData: ScannedData;
      try {
        parsedData = JSON.parse(data);
      } catch (e) {
        throw new Error('Invalid QR code format.');
      }

      if (!parsedData.medicine_id || !parsedData.batch_no || !parsedData.expiry_date || !parsedData.manufacturer) {
        throw new Error('Invalid QR code format.');
      }

      const medDocRef = doc(db, 'medicines', parsedData.medicine_id);
      const medDocSnap = await getDoc(medDocRef);

      let verificationStatus: VerificationResult['status'];
      let productName = "Unknown Medicine";

      if (medDocSnap.exists()) {
        const firestoreData = medDocSnap.data();
        productName = firestoreData.name || "Unknown Medicine";

        if (
          firestoreData.batch_no === parsedData.batch_no &&
          firestoreData.manufacturer === parsedData.manufacturer
        ) {
          const expiryDate = new Date(parsedData.expiry_date);
          if (expiryDate < new Date()) {
            verificationStatus = 'expired';
          } else {
            verificationStatus = 'verified';
          }
        } else {
          verificationStatus = 'counterfeit';
        }
      } else {
        verificationStatus = 'counterfeit';
      }
      
      const finalResult: VerificationResult = {
        status: verificationStatus,
        data: parsedData,
        productName: productName,
        scannedAt: new Date().toISOString(),
      };

      setResult(finalResult);
      saveScanToHistory(finalResult);

    } catch (error: any) {
      console.error('Scan handling error:', error);
      toast({
        variant: 'destructive',
        title: 'Scan Failed',
        description: error.message || 'The QR code is invalid or not recognized. Please try a different one.',
      });
      // Allow user to scan again after a failed attempt
       setTimeout(() => setIsScanning(true), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const ResultCard = ({ result }: { result: VerificationResult }) => {
    const statusInfo = {
      verified: {
        icon: <CheckCircle className="h-12 w-12 text-green-500" />,
        title: 'Medicine Verified',
        description: 'This product is genuine.',
        color: 'border-green-500 bg-green-500/10',
      },
      counterfeit: {
        icon: <XCircle className="h-12 w-12 text-red-500" />,
        title: 'Counterfeit Risk',
        description: 'This product could not be verified in our database. Do not use.',
        color: 'border-red-500 bg-red-500/10',
      },
      expired: {
        icon: <AlertTriangle className="h-12 w-12 text-yellow-500" />,
        title: 'Medicine Expired',
        description: 'This product has passed its expiry date. Do not use.',
        color: 'border-yellow-500 bg-yellow-500/10',
      },
    };

    const currentStatus = statusInfo[result.status];

    return (
      <Card className={cn("text-center", currentStatus.color)}>
        <CardHeader>
          <div className="mx-auto">{currentStatus.icon}</div>
          <CardTitle className="mt-4">{currentStatus.title}</CardTitle>
          <p className="text-muted-foreground">{currentStatus.description}</p>
        </CardHeader>
        <CardContent className="text-left space-y-2">
            <p><strong>Product:</strong> {result.productName}</p>
            <p><strong>Batch No:</strong> {result.data.batch_no}</p>
            <p><strong>Expiry Date:</strong> {format(new Date(result.data.expiry_date), 'MMMM yyyy')}</p>
            <p><strong>Manufacturer:</strong> {result.data.manufacturer}</p>
            <p className="text-xs text-muted-foreground pt-2">Scanned on: {format(new Date(result.scannedAt), 'PPp')}</p>
        </CardContent>
        <CardFooter>
            <Button className="w-full" onClick={() => {setResult(null); setIsScanning(true)}}>Scan Another</Button>
        </CardFooter>
      </Card>
    );
  };
  
  const HistoryItemCard = ({ item }: { item: ScanHistoryItem }) => {
      const statusInfo = {
          verified: { color: 'text-green-500', icon: <CheckCircle className="h-5 w-5"/> },
          counterfeit: { color: 'text-red-500', icon: <XCircle className="h-5 w-5"/> },
          expired: { color: 'text-yellow-500', icon: <AlertTriangle className="h-5 w-5"/> },
      };
      const currentStatus = statusInfo[item.status];
      return (
          <Card className="p-4 flex items-start gap-4">
              <div className={cn("mt-1", currentStatus.color)}>
                {currentStatus.icon}
              </div>
              <div className="flex-1">
                  <p className="font-bold">{item.productName}</p>
                  <p className="text-sm">Batch: {item.data.batch_no}</p>
                  <p className="text-xs text-muted-foreground mt-1">{format(new Date(item.scannedAt), 'PP, p')}</p>
              </div>
          </Card>
      )
  };


  return (
    <div className="flex flex-col h-screen bg-black">
      <header className="sticky top-0 z-20 flex items-center justify-between p-4 bg-black/50 backdrop-blur-md text-white">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Verify Medicine</h1>
        <div className="w-8"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
          <Tabs defaultValue="scanner" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="scanner"><QrCode className="mr-2 h-4 w-4" />Scanner</TabsTrigger>
                  <TabsTrigger value="history"><History className="mr-2 h-4 w-4" />History</TabsTrigger>
              </TabsList>
              <TabsContent value="scanner" className="flex-1 mt-4">
                 <Card className="relative aspect-square w-full max-w-md mx-auto overflow-hidden bg-black">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                        <div className="w-64 h-64 border-4 border-dashed border-white/50 rounded-lg" />
                         <p className="mt-4 text-white font-semibold">
                            {isScanning ? 'Point camera at QR code' : 'QR Code detected!'}
                         </p>
                    </div>

                    {isLoading && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                            <Loader2 className="h-10 w-10 text-white animate-spin" />
                        </div>
                    )}

                    {!isScanning && result && (
                         <div className="absolute inset-0 bg-black/70 p-4 flex items-center justify-center">
                            <ResultCard result={result} />
                        </div>
                    )}

                    {hasCameraPermission === false && (
                         <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-center p-4">
                            <CameraOff className="h-12 w-12 text-red-500 mb-4" />
                            <h3 className="text-xl font-bold text-white">Camera Access Denied</h3>
                            <p className="text-muted-foreground mb-4">Please grant camera permission in your browser settings to use the scanner.</p>
                            <Button onClick={getCameraPermission}>Retry</Button>
                        </div>
                    )}
                </Card>
              </TabsContent>
              <TabsContent value="history" className="flex-1 mt-4">
                <ScrollArea className="h-full">
                    <div className="space-y-4">
                        {scanHistory.length > 0 ? (
                            scanHistory.map((item, index) => <HistoryItemCard key={index} item={item} />)
                        ) : (
                            <div className="text-center text-muted-foreground py-10">
                                <History className="mx-auto h-12 w-12 mb-4" />
                                <h3 className="text-lg font-semibold">No Scan History</h3>
                                <p>Your past medicine scans will appear here.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
              </TabsContent>
          </Tabs>
      </main>
    </div>
  );
}

    