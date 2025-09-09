

"use client";

import { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { generatePrescriptionSummary } from "@/ai/flows/generate-prescription-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UploadCloud, FileText, X, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PrescriptionDetails } from "@/lib/types";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  prescription: z
    .any()
    .refine((files) => files?.[0], "Image is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
});

interface PrescriptionUploaderProps {
    onUploadSuccess: (details: PrescriptionDetails) => void;
}


export function PrescriptionUploader({ onUploadSuccess }: PrescriptionUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // Automatically submit after selecting a file
      handleSubmit(file);
    }
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  async function handleSubmit(file: File) {
    setIsLoading(true);

    try {
      const dataUri = await toBase64(file);
      const result = await generatePrescriptionSummary({ prescriptionImageUri: dataUri });
      onUploadSuccess({ summary: result, dataUri });
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
    form.reset();
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  return (
    <div>
        {isLoading && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground p-8">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p>AI is analyzing your prescription...</p>
              </div>
        )}
        {!preview && !isLoading && (
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
    </div>
  );
}
