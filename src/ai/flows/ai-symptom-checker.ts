
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
  symptoms: z.string().describe("A description of the user's symptoms."),
  photoDataUri: z.string().optional().describe(
      "An optional photo of a visible symptom, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  targetLanguage: z.string().describe("The language in which the AI's response should be translated (e.g., 'Hindi', 'English', 'Punjabi')."),
});
export type AiSymptomCheckerInput = z.infer<typeof AiSymptomCheckerInputSchema>;

const AiSymptomCheckerOutputSchema = z.object({
  potentialMedicines: z.array(z.string()).describe('A list of suggested over-the-counter medicines.'),
  precautions: z.array(z.string()).describe('A list of precautions to take.'),
  diet: z.array(z.string()).describe('A list of dietary recommendations.'),
  exercise: z.array(z.string()).describe('A list of suggested light exercises or rest.'),
  doctorAdvisory: z.string().describe('An advisory on whether to consult a doctor and what kind of doctor to see.'),
  recommendedSpecialist: z.string().optional().describe("The recommended specialist to consult (e.g., 'Dermatologist', 'General Physician'). This should match a specialty available in the app."),
});
export type AiSymptomCheckerOutput = z.infer<typeof AiSymptomCheckerOutputSchema>;

const prompt = ai.definePrompt({
  name: 'aiSymptomCheckerPrompt',
  input: { schema: AiSymptomCheckerInputSchema },
  output: { schema: AiSymptomCheckerOutputSchema },
  prompt: `You are an expert medical AI assistant. Based on the user's symptoms, and optional photo, provide a helpful and safe analysis.

  IMPORTANT: The user has requested the response in '{{{targetLanguage}}}'. You MUST provide your entire response, including all fields in the output schema, in this language.

  User Symptoms:
  {{{symptoms}}}
  {{#if photoDataUri}}
  Symptom Photo:
  {{media url=photoDataUri}}
  {{/if}}

  Provide the following information based on the symptoms:
  - Suggest 2-3 common, safe, over-the-counter medicines.
  - List 3-4 important precautions.
  - Recommend a simple diet to follow.
  - Suggest whether to rest or do light exercise.
  - Provide a clear advisory on whether a doctor visit is recommended, and if so, which specialist (e.g., General Physician, ENT Specialist).
  - Set the 'recommendedSpecialist' field to the type of specialist to see. If no specific specialist is needed, suggest 'General Physician'.

  IMPORTANT: Start your advisory with a translated version of "This is not a substitute for professional medical advice. Please consult a doctor for a proper diagnosis."
  
  Do not provide any information outside of the requested output format.
  `,
});

export const aiSymptomChecker = ai.defineFlow(
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
