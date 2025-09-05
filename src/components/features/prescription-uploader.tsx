
"use client";

import { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { generatePrescriptionSummary, GeneratePrescriptionSummaryOutput } from "@/ai/flows/generate-prescription-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UploadCloud, FileText, Sparkles, X, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  prescription: z
    .any()
    .refine((file) => file, "Image is required.")
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
});

export function PrescriptionUploader() {
  const [summary, setSummary] = useState<GeneratePrescriptionSummaryOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("prescription", file);
      form.clearErrors("prescription");
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // Automatically submit after selecting a file
      onSubmit({ prescription: file });
    }
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSummary(null);

    try {
      const dataUri = await toBase64(values.prescription);
      const result = await generatePrescriptionSummary({ prescriptionImageUri: dataUri });
      setSummary(result);
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "AI Summarization Failed",
        description: "Failed to summarize prescription. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const resetState = () => {
    setPreview(null);
    setSummary(null);
    form.reset();
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  return (
    <Card className="border-primary border-dashed">
      <CardHeader>
        <CardTitle>AI Prescription Reader</CardTitle>
        <CardDescription>
          Upload an image of your prescription to have our AI extract the medicines for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!preview && (
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
            />
            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 5MB</p>
          </div>
        )}

        {form.formState.errors.prescription && (
             <p className="text-sm font-medium text-destructive">{form.formState.errors.prescription.message as string}</p>
        )}
        
        {preview && (
          <div className="space-y-4">
             <div className="relative w-full max-w-xs mx-auto">
                <Image src={preview} alt="Prescription preview" width={300} height={200} className="rounded-md object-contain" />
                <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-7 w-7 rounded-full" onClick={resetState}>
                    <X className="h-4 w-4"/>
                </Button>
             </div>

            {isLoading && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p>AI is analyzing your prescription...</p>
              </div>
            )}

            {summary && (
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText />
                    Extracted Medicines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                     {(summary.medicines || []).map((med, index) => (
                        <div key={index} className="flex justify-between items-center p-2 rounded-md bg-background">
                            <div>
                                <p className="font-semibold">{med.name}</p>
                                <p className="text-sm text-muted-foreground">{med.dosage}</p>
                            </div>
                             <Button size="sm" variant="outline" onClick={() => toast({ title: `${med.name} added to cart!` })}>
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Add to cart
                            </Button>
                        </div>
                     ))}
                      {(summary.medicines?.length === 0) && (
                        <p className="text-muted-foreground">Could not extract any medicines from the prescription.</p>
                      )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
