
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
  differentialDiagnosis: z.array(z.object({
    condition: z.string().describe("The name of the possible medical condition."),
    confidence: z.enum(["High", "Medium", "Low"]).describe("The confidence level (High, Medium, or Low) for this diagnosis."),
    reasoning: z.string().describe("A brief explanation for why this condition is suspected based on the provided symptoms."),
  })).describe("A list of possible diseases with confidence scores and reasoning."),
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
  prompt: `You are an expert medical AI assistant. Your primary function is to perform a differential diagnosis based on user-provided symptoms and provide safe, helpful guidance.

  IMPORTANT: The user has requested the response in '{{{targetLanguage}}}'. You MUST provide your entire response, including all fields in the output schema, in this language.

  User Symptoms:
  {{{symptoms}}}
  {{#if photoDataUri}}
  Symptom Photo:
  {{media url=photoDataUri}}
  {{/if}}

  Based on the symptoms, perform the following actions:
  1.  **Differential Diagnosis**: Identify 2-3 potential medical conditions. For each condition, provide:
      -   `condition`: The name of the condition.
      -   `confidence`: A confidence score ('High', 'Medium', or 'Low').
      -   `reasoning`: Explain *why* you suspect this condition based on the specific symptoms provided. This is crucial for explainability.

  2.  **General Guidance**: Provide general recommendations that are safe for the identified potential conditions.
      -   Suggest 2-3 common, safe, over-the-counter medicines.
      -   List 3-4 important precautions.
      -   Recommend a simple diet to follow.
      -   Suggest whether to rest or do light exercise.

  3.  **Doctor Advisory**:
      -   Provide a clear advisory on whether a doctor visit is recommended.
      -   Set the 'recommendedSpecialist' field to the most appropriate specialist (e.g., 'General Physician', 'Dermatologist'). If no specific specialist is needed but a doctor visit is advised, suggest 'General Physician'.
      -   IMPORTANT: Start your advisory with a translated version of "This is not a substitute for professional medical advice. Please consult a doctor for a proper diagnosis."
  
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
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI model did not return a valid response.');
    }
    return output;
  }
);
