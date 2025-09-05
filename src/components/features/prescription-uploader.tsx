"use client";

import { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { generatePrescriptionSummary } from "@/ai/flows/generate-prescription-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UploadCloud, FileText, Sparkles } from "lucide-react";

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
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setError(null);
    setSummary(null);

    try {
      const dataUri = await toBase64(values.prescription);
      const result = await generatePrescriptionSummary({ prescriptionImageUri: dataUri });
      setSummary(result.summary);
    } catch (err) {
      console.error(err);
      setError("Failed to summarize prescription. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Prescription</CardTitle>
        <CardDescription>
          Upload an image of your prescription to get a summary of your medication.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

          {form.formState.errors.prescription && (
             <p className="text-sm font-medium text-destructive">{form.formState.errors.prescription.message as string}</p>
          )}

          {preview && (
            <div className="relative w-full max-w-xs mx-auto">
              <Image src={preview} alt="Prescription preview" width={300} height={200} className="rounded-md object-contain" />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading || !form.watch("prescription")}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Summarize with AI
          </Button>
        </form>

        {error && (
            <div className="text-destructive text-sm font-medium">{error}</div>
        )}

        {summary && (
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText />
                Prescription Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{summary}</p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
