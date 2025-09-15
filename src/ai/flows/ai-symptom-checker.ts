
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
      "An optional photo or a single frame from a video of a visible symptom, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  targetLanguage: z.string().describe("The language in which the AI's response should be translated (e.g., 'Hindi', 'English', 'Punjabi')."),
});
export type AiSymptomCheckerInput = z.infer<typeof AiSymptomCheckerInputSchema>;

const AiSymptomCheckerOutputSchema = z.object({
  differentialDiagnosis: z.array(z.object({
    condition: z.string().describe("The name of the possible medical condition."),
    confidence: z.enum(["High", "Medium", "Low"]).describe("The confidence level (High, Medium, or Low) for this diagnosis."),
    reasoning: z.string().describe("A brief explanation for why this condition is suspected based on the provided symptoms."),
  })).describe("A list of possible diseases with confidence scores and reasoning."),
  potentialMedicines: z.array(z.string()).describe('A list of suggested home remedies followed by over-the-counter medicines.'),
  precautions: z.array(z.string()).describe('A detailed list of 3-4 precautions to take.'),
  diet: z.array(z.string()).describe('A detailed list of 3-4 dietary recommendations.'),
  exercise: z.array(z.string()).describe('A detailed list of 2-3 suggested light exercises or rest recommendations.'),
  doctorAdvisory: z.string().describe('An advisory on whether to consult a doctor and what kind of doctor to see.'),
  recommendedSpecialist: z.string().optional().describe("The recommended specialist to consult (e.g., 'Dermatologist', 'General Physician'). This should match a specialty available in the app."),
});
export type AiSymptomCheckerOutput = z.infer<typeof AiSymptomCheckerOutputSchema>;

const prompt = ai.definePrompt({
  name: 'aiSymptomCheckerPrompt',
  input: { schema: AiSymptomCheckerInputSchema },
  output: { schema: AiSymptomCheckerOutputSchema },
  prompt: `You are an expert medical AI assistant. Your primary function is to perform a differential diagnosis based on user-provided symptoms and provide safe, helpful, and detailed guidance.

  IMPORTANT: The user has requested the response in '{{{targetLanguage}}}'. You MUST provide your entire response, including all fields in the output schema, in this language.

  User Symptoms:
  {{{symptoms}}}
  {{#if photoDataUri}}
  Symptom Photo/Video Frame (as Base64 data URI):
  {{media url=photoDataUri}}
  {{/if}}

  Based on the symptoms, perform the following actions:
  1.  **Differential Diagnosis**: Identify 2-3 potential medical conditions. For each condition, provide:
      -   condition: The name of the condition.
      -   confidence: A confidence score ('High', 'Medium', 'Low').
      -   reasoning: Explain *why* you suspect this condition based on the specific symptoms provided. This is crucial for explainability.

  2.  **General Guidance**: Provide comprehensive and safe recommendations.
      -   **Medicines**: First, suggest 2-3 safe home remedies. Then, suggest 2-3 common, safe, over-the-counter medicines relevant to the symptoms. Combine them into the single 'potentialMedicines' list.
      -   **Precautions**: List 3-4 important and detailed precautions to take.
      -   **Diet**: Recommend a simple, easy-to-follow diet with 3-4 specific food items to eat or avoid.
      -   **Exercise**: Suggest 2-3 specific light exercises or clear rest instructions. Be descriptive.

  3.  **Doctor Advisory**:
      -   Provide a clear, direct advisory on whether a doctor visit is recommended.
      -   Set the 'recommendedSpecialist' field to the most appropriate specialist (e.g., 'General Physician', 'Dermatologist'). If no specific specialist is needed but a doctor visit is advised, suggest 'General Physician'.
      -   IMPORTANT: The 'doctorAdvisory' text MUST begin with a translated version of this exact sentence: "This is not a substitute for professional medical advice. Please consult a doctor for a proper diagnosis."
  
  Provide the output in the specified JSON format. Do not provide any information outside of this structure.
  `,
});

export const aiSymptomChecker = ai.defineFlow(
  {
    name: 'aiSymptomCheckerFlow',
    inputSchema: AiSymptomCheckerInputSchema,
    outputSchema: AiSymptomCheckerOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output) {
        throw new Error('The AI model did not return a valid response. Please try again.');
      }
      return output;
    } catch (error: any) {
      console.error('AI Symptom Checker error:', error);
      const errorMessage = error.message || '';
      if (errorMessage.includes('503') || errorMessage.includes('overloaded') || errorMessage.toLowerCase().includes('quota')) {
        throw new Error('The AI model is currently busy. Please try again in a few moments.');
      }
      throw new Error('An unexpected error occurred while analyzing your symptoms. Please try again later.');
    }
  }
);
