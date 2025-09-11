
'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import jsQR from 'jsqr';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Loader2, CameraOff, Box, PackageCheck, PackageX } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface PackageItem {
  name: string;
  quantity: number;
}

interface PackageQRData {
  order_id: string;
  items: PackageItem[];
}

interface VerificationResult {
  status: 'matched' | 'mismatched' | 'error';
  message: string;
  scannedItems: PackageItem[];
  orderedItems: PackageItem[];
}

function ScanPackageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { toast } = useToast();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    if (!orderId) {
      toast({ variant: 'destructive', title: 'Error', description: 'No order ID provided.' });
      router.push('/orders');
      return;
    }

    const fetchOrder = async () => {
      const orderDocRef = doc(db, 'orders', orderId);
      const orderDocSnap = await getDoc(orderDocRef);
      if (orderDocSnap.exists()) {
        setOrderData(orderDocSnap.data());
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Order not found.' });
        router.push('/orders');
      }
    };
    fetchOrder();
  }, [orderId, router, toast]);

  const getCameraPermission = useCallback(async () => {
    if (hasCameraPermission) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error("Video play failed:", e));
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
  }, [toast, hasCameraPermission]);

  useEffect(() => {
    getCameraPermission();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [getCameraPermission]);

  const tick = useCallback(() => {
    if (isScanning && videoRef.current?.HAVE_ENOUGH_DATA && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context && video.videoWidth > 0 && video.videoHeight > 0) {
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
    if (hasCameraPermission && isScanning) {
      requestAnimationFrame(tick);
    }
  }, [isScanning, hasCameraPermission]);

  useEffect(() => {
    if (isScanning) {
      requestAnimationFrame(tick);
    }
  }, [isScanning, tick]);

  const handleScan = async (data: string) => {
    setIsLoading(true);
    setResult(null);

    if (!orderData) {
        toast({ variant: 'destructive', title: 'Order data not loaded.' });
        setIsLoading(false);
        return;
    }

    try {
      let parsedData: PackageQRData;
      try {
        parsedData = JSON.parse(data);
      } catch (e) {
        setResult({ status: 'error', message: 'Invalid QR code format.', scannedItems: [], orderedItems: orderData.cart });
        return;
      }
      
      const { order_id, items: scannedItems } = parsedData;

      if (!order_id || !scannedItems) {
        setResult({ status: 'error', message: 'QR code is missing required package information.', scannedItems: [], orderedItems: orderData.cart });
        return;
      }

      if (order_id !== orderId) {
        setResult({ status: 'error', message: `This package is for a different order (ID: ...${order_id.slice(-4)}).`, scannedItems, orderedItems: orderData.cart });
        return;
      }

      // Simple comparison logic
      const orderedMap = new Map(orderData.cart.map((item: any) => [item.name, item.quantity]));
      const scannedMap = new Map(scannedItems.map(item => [item.name, item.quantity]));
      let isMatch = true;

      if (orderedMap.size !== scannedMap.size) {
        isMatch = false;
      } else {
        for (const [name, quantity] of orderedMap) {
          if (scannedMap.get(name) !== quantity) {
            isMatch = false;
            break;
          }
        }
      }
      
      if (isMatch) {
        setResult({ status: 'matched', message: 'Package contents match your order.', scannedItems, orderedItems: orderData.cart });
      } else {
        setResult({ status: 'mismatched', message: 'Package contents do not match your order. Please contact support.', scannedItems, orderedItems: orderData.cart });
      }

    } catch (error: any) {
      setResult({ status: 'error', message: 'An unexpected error occurred while verifying the package.', scannedItems: [], orderedItems: orderData.cart });
    } finally {
      setIsLoading(false);
    }
  };

  const renderItemsList = (items: PackageItem[], title: string, isScannedList = false) => (
    <div>
      <h4 className="font-semibold mb-2">{title}</h4>
      <ul className="space-y-1 text-sm list-disc pl-5">
        {items.map(item => (
          <li key={item.name} className="flex justify-between">
            <span>{item.name}</span>
            <span className="font-mono">x{item.quantity}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const ResultCard = ({ result }: { result: VerificationResult }) => {
    const statusInfo = {
      matched: { icon: <PackageCheck className="h-12 w-12 text-green-500" />, title: 'Contents Matched', color: 'border-green-500 bg-green-500/10' },
      mismatched: { icon: <PackageX className="h-12 w-12 text-yellow-500" />, title: 'Contents Mismatch', color: 'border-yellow-500 bg-yellow-500/10' },
      error: { icon: <AlertTriangle className="h-12 w-12 text-red-500" />, title: 'Verification Error', color: 'border-red-500 bg-red-500/10' },
    };
    const currentStatus = statusInfo[result.status];

    return (
      <Card className={cn("text-center", currentStatus.color)}>
        <CardHeader>
          <div className="mx-auto">{currentStatus.icon}</div>
          <CardTitle className="mt-4">{currentStatus.title}</CardTitle>
          <p className="text-muted-foreground">{result.message}</p>
        </CardHeader>
        {result.status !== 'error' && (
          <CardContent className="text-left space-y-4">
            {renderItemsList(result.orderedItems, 'Your Order')}
            {renderItemsList(result.scannedItems, 'Scanned Package', true)}
          </CardContent>
        )}
        <CardFooter>
          <Button className="w-full" onClick={() => { setResult(null); setIsScanning(true); }}>Scan Again</Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-black">
      <header className="sticky top-0 z-20 flex items-center justify-between p-4 bg-black/50 backdrop-blur-md text-white">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Scan Package</h1>
        <div className="w-8"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <Card className="relative aspect-square w-full max-w-md mx-auto overflow-hidden bg-black">
          <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
          <canvas ref={canvasRef} className="hidden" />

          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4">
            <div className="w-64 h-64 border-4 border-dashed border-white/50 rounded-lg" />
            <p className="mt-4 text-white font-semibold text-center">
              {isScanning ? 'Scan the QR code on your package' : 'QR Code detected!'}
            </p>
          </div>

          {isLoading && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <Loader2 className="h-10 w-10 text-white animate-spin" />
            </div>
          )}

          {!isScanning && result && (
            <div className="absolute inset-0 bg-black/80 p-4 flex items-center justify-center">
              <ResultCard result={result} />
            </div>
          )}

          {hasCameraPermission === false && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-center p-4">
              <CameraOff className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-white">Camera Access Denied</h3>
              <p className="text-muted-foreground mb-4">Please grant camera permission to use the scanner.</p>
              <Button onClick={getCameraPermission}>Retry</Button>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}

export default function ScanPackagePage() {
    return (
        <Suspense fallback={<Skeleton className="w-full h-screen" />}>
            <ScanPackageContent />
        </Suspense>
    )
}
