'use server';

/**
 * @fileOverview Summarizes a prescription to extract medication, dosage, and instructions.
 *
 * - generatePrescriptionSummary - A function that handles the prescription summarization process.
 * - GeneratePrescriptionSummaryInput - The input type for the generatePrescriptionSummary function.
 * - GeneratePrescriptionSummaryOutput - The return type for the generatePrescriptionSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePrescriptionSummaryInputSchema = z.object({
  prescriptionImageUri: z
    .string()
    .describe(
      "A photo of a prescription, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GeneratePrescriptionSummaryInput = z.infer<
  typeof GeneratePrescriptionSummaryInputSchema
>;

const GeneratePrescriptionSummaryOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A summary of the medication, dosage, and instructions from the prescription.'
    ),
});
export type GeneratePrescriptionSummaryOutput = z.infer<
  typeof GeneratePrescriptionSummaryOutputSchema
>;

export async function generatePrescriptionSummary(
  input: GeneratePrescriptionSummaryInput
): Promise<GeneratePrescriptionSummaryOutput> {
  return generatePrescriptionSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePrescriptionSummaryPrompt',
  input: {schema: GeneratePrescriptionSummaryInputSchema},
  output: {schema: GeneratePrescriptionSummaryOutputSchema},
  prompt: `You are a pharmacist tasked with summarizing prescriptions.

  Analyze the provided prescription image and extract the following information:

  - Medication Name(s)
  - Dosage(s)
  - Instructions

  Provide a concise summary of the prescription, including all the extracted information.
  Prescription Image: {{media url=prescriptionImageUri}}
  Summary:`,
});

const generatePrescriptionSummaryFlow = ai.defineFlow(
  {
    name: 'generatePrescriptionSummaryFlow',
    inputSchema: GeneratePrescriptionSummaryInputSchema,
    outputSchema: GeneratePrescriptionSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
