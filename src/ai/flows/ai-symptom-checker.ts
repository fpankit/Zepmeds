
'use server';
/**
 * @fileOverview A symptom checker AI agent.
 *
 * - aiSymptomChecker - A function that handles the symptom checking process.
 * - AiSymptomCheckerInput - The input type for the aiSymptomChecker function.
 * - AiSymptomCheckerOutput - The return type for the aiSymptomChecker function.
 */

import { ai } from '@/ai/dev';
import { z } from 'zod';

const AiSymptomCheckerInputSchema = z.object({
  symptoms: z.string().describe('A description of the user\'s symptoms.'),
});
export type AiSymptomCheckerInput = z.infer<typeof AiSymptomCheckerInputSchema>;

const AiSymptomCheckerOutputSchema = z.object({
  potentialMedicines: z.array(z.string()).describe('A list of suggested over-the-counter medicines.'),
  precautions: z.array(z.string()).describe('A list of precautions to take.'),
  diet: z.array(z.string()).describe('A list of dietary recommendations.'),
  exercise: z.array(z.string()).describe('A list of suggested light exercises or rest.'),
  doctorAdvisory: z.string().describe('An advisory on whether to consult a doctor and what kind of doctor to see.'),
});
export type AiSymptomCheckerOutput = z.infer<typeof AiSymptomCheckerOutputSchema>;

export async function aiSymptomChecker(input: AiSymptomCheckerInput): Promise<AiSymptomCheckerOutput> {
  return aiSymptomCheckerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSymptomCheckerPrompt',
  input: { schema: AiSymptomCheckerInputSchema },
  output: { schema: AiSymptomCheckerOutputSchema },
  prompt: `You are an expert medical AI assistant. Based on the user's symptoms, provide a helpful and safe analysis.

  User Symptoms:
  {{{symptoms}}}

  Provide the following information based on the symptoms:
  - Suggest 2-3 common, safe, over-the-counter medicines.
  - List 3-4 important precautions.
  - Recommend a simple diet to follow.
  - Suggest whether to rest or do light exercise.
  - Provide a clear advisory on whether a doctor visit is recommended, and if so, which specialist (e.g., General Physician, ENT Specialist).

  IMPORTANT: Start your advisory with "This is not a substitute for professional medical advice. Please consult a doctor for a proper diagnosis."
  
  Do not provide any information outside of the requested output format.
  `,
});

const aiSymptomCheckerFlow = ai.defineFlow(
  {
    name: 'aiSymptomCheckerFlow',
    inputSchema: AiSymptomCheckerInputSchema,
    outputSchema: AiSymptomCheckerOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI model did not return a valid response.');
    }
    return output;
  }
);
