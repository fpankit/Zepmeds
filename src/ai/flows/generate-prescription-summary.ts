
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

const MedicineSchema = z.object({
    name: z.string().describe('The name of the medicine.'),
    dosage: z.string().describe('The dosage and frequency instructions (e.g., "1 tablet twice a day").'),
});

const GeneratePrescriptionSummaryOutputSchema = z.object({
    medicines: z.array(MedicineSchema).describe('An array of medicines found in the prescription.'),
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
  prompt: `You are a pharmacist AI tasked with extracting medication details from a prescription.

  Analyze the provided prescription image and extract the following information for each medication:

  - Medication Name
  - Dosage and Instructions (e.g., "500mg, 1 tablet twice a day after meals")
  
  If you cannot find any medicines, return an empty array. Do not hallucinate.

  Prescription Image: {{media url=prescriptionImageUri}}
  `,
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
