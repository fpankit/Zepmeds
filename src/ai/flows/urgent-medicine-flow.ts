
'use server';
/**
 * @fileOverview An AI agent for validating medicine names for urgent delivery.
 *
 * - validateUrgentMedicine - A function that checks if medicine names are valid.
 * - UrgentMedicineInput - The input type for the function.
 * - UrgentMedicineOutput - The return type for the function.
 */

import { ai } from '@/ai/dev';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';

const UrgentMedicineInputSchema = z.object({
  medicineNames: z
    .array(z.string())
    .describe('A list of medicine names provided by the user.'),
});
export type UrgentMedicineInput = z.infer<typeof UrgentMedicineInputSchema>;

const ValidatedMedicineSchema = z.object({
  name: z.string().describe('The name of the medicine, corrected by the AI if necessary.'),
  isValid: z
    .boolean()
    .describe('Whether the medicine name is a valid, real medicine.'),
  requiresPrescription: z
    .boolean()
    .describe('Whether this medicine typically requires a doctor\'s prescription (Rx).'),
  reason: z
    .string()
    .describe(
      'A brief explanation for the validation status. E.g., "Validated." or "Invalid name, this does not appear to be a real medicine."'
    ),
  estimatedPrice: z.number().describe('A rough estimated price in INR for a standard unit (e.g., one strip) of the medicine. Provide 0 if the medicine is invalid or price is unknown.'),
});
export type ValidatedMedicine = z.infer<typeof ValidatedMedicineSchema>;


const UrgentMedicineOutputSchema = z.object({
  validatedMedicines: z
    .array(ValidatedMedicineSchema)
    .describe('A list of validation results for each medicine name provided.'),
});
export type UrgentMedicineOutput = z.infer<typeof UrgentMedicineOutputSchema>;

const prompt = ai.definePrompt({
  name: 'urgentMedicinePrompt',
  model: 'googleai/gemini-1.5-flash', // Use the correct model name with prefix
  input: { schema: UrgentMedicineInputSchema },
  output: { schema: UrgentMedicineOutputSchema },
  prompt: `You are an expert pharmacist AI for an Indian medicine delivery app called Zepmeds.
  Your task is to validate a list of medicine names provided by a user for an urgent order.

  For each medicine name in the input list, you must determine the following:
  1.  **Correct the Name**: If the user has made a spelling mistake, correct it to the most likely valid medicine name. For example, if the user enters "Crosin", correct it to "Crocin".
  2.  **Validate**: Check if the corrected name is a real, valid medicine available in India.
  3.  **Prescription (Rx) Status**: Determine if the medicine is a prescription-only drug (Rx) or an over-the-counter (OTC) medicine.
  4.  **Reasoning**: Provide a short, clear reason for the validation. For valid medicines, just say "Validated." For invalid ones, explain why (e.g., "Not a recognized medicine.").
  5.  **Estimated Price**: Provide a rough, estimated price in Indian Rupees (INR) for a standard unit (like one strip of 10 tablets, or a small bottle). If a medicine is invalid or you cannot estimate a price, use 0.

  Here is the list of medicine names from the user:
  {{#each medicineNames}}
  - {{{this}}}
  {{/each}}

  Please process each name and return the results in the specified JSON format.
  `,
});

export async function validateUrgentMedicine(
  input: UrgentMedicineInput
): Promise<UrgentMedicineOutput> {
  const { output } = await prompt(input);
  if (!output) {
    throw new Error(
      'The AI model failed to generate a validation response. Please try again.'
    );
  }
  return output;
}
