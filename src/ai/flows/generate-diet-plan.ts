
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a personalized diet and lifestyle plan.
 *
 * The flow takes a user's health metrics and a target language as input, then generates
 * a culturally relevant diet plan, exercise tips, home remedies, and do's/don'ts.
 *
 * @interface GenerateDietPlanInput - Represents the input for the flow.
 * @interface GenerateDietPlanOutput - Represents the output of the flow.
 * @function generateDietPlan - The main function to initiate the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { translateText } from './translate-text';

const HealthMetricsSchema = z.object({
  bloodPressure: z.string().optional().describe('User\'s latest blood pressure reading.'),
  bloodGlucose: z.string().optional().describe('User\'s latest blood glucose reading.'),
  dailySteps: z.string().optional().describe('User\'s average daily steps.'),
  waterIntake: z.string().optional().describe('User\'s average daily water intake.'),
  caloriesBurned: z.string().optional().describe('User\'s average daily calories burned.'),
});

const GenerateDietPlanInputSchema = z.object({
  healthMetrics: HealthMetricsSchema,
  targetLanguage: z.string().describe('The language for the final report (e.g., "Hindi").'),
});
export type GenerateDietPlanInput = z.infer<typeof GenerateDietPlanInputSchema>;

const DietPlanSchema = z.object({
    morning: z.string().describe('Breakfast suggestion.'),
    lunch: z.string().describe('Lunch suggestion.'),
    dinner: z.string().describe('Dinner suggestion.'),
});

const DoAndDontSchema = z.object({
    dos: z.array(z.string()).describe('A list of things the user should do.'),
    donts: z.array(z.string()).describe('A list of things the user should avoid.'),
});

const GenerateDietPlanOutputSchema = z.object({
  dietPlan: DietPlanSchema,
  exerciseTips: z.array(z.string()).describe('A list of exercise or activity recommendations.'),
  homeRemedies: z.array(z.string()).describe('A list of local, culturally relevant home remedies ("ghar ke nuskhe").'),
  doAndDont: DoAndDontSchema,
});
export type GenerateDietPlanOutput = z.infer<typeof GenerateDietPlanOutputSchema>;


const englishPrompt = ai.definePrompt({
  name: 'generateDietPlanEnglishPrompt',
  input: {schema: HealthMetricsSchema},
  output: {schema: GenerateDietPlanOutputSchema},
  prompt: `You are an expert nutritionist and lifestyle coach from India. Based on the user's health metrics, create a simple, practical, and culturally relevant diet and lifestyle plan. The suggestions should be easy to follow for an average person in India.

  User's Health Data:
  - Blood Pressure: {{{bloodPressure}}}
  - Blood Sugar: {{{bloodGlucose}}}
  - Daily Steps: {{{dailySteps}}}
  - Water Intake: {{{waterIntake}}}
  - Calories Burned: {{{caloriesBurned}}}

  Your response must include these sections:
  1.  **Diet Plan**: Suggest simple, common Indian meals for breakfast (morning), lunch, and dinner.
  2.  **Exercise Tips**: Provide 3-4 practical activity or exercise tips.
  3.  **Home Remedies**: Suggest 2-3 local home remedies (ghar ke nuskhe) relevant to the user's BP or Sugar levels.
  4.  **Do's and Don'ts**: Provide a list of important do's and another list of important don'ts.

  Keep the language simple and encouraging. Generate the response in English.
  `,
});


const generateDietPlanFlow = ai.defineFlow(
  {
    name: 'generateDietPlanFlow',
    inputSchema: GenerateDietPlanInputSchema,
    outputSchema: GenerateDietPlanOutputSchema,
  },
  async ({ healthMetrics, targetLanguage }) => {
    // 1. Generate the report in English
    const { output: englishResult } = await englishPrompt(healthMetrics);
    
    if (!englishResult) {
        throw new Error("Failed to generate diet plan in English.");
    }
    
    // 2. If target language is English, return directly
    if (targetLanguage === 'English') {
      return englishResult;
    }

    // 3. Translate all parts of the result to the target language
    const translatePromises = [
        translateText({ text: englishResult.dietPlan.morning, targetLanguage }),
        translateText({ text: englishResult.dietPlan.lunch, targetLanguage }),
        translateText({ text: englishResult.dietPlan.dinner, targetLanguage }),
        translateText({ text: englishResult.exerciseTips.join('\n---\n'), targetLanguage }),
        translateText({ text: englishResult.homeRemedies.join('\n---\n'), targetLanguage }),
        translateText({ text: englishResult.doAndDont.dos.join('\n---\n'), targetLanguage }),
        translateText({ text: englishResult.doAndDont.donts.join('\n---\n'), targetLanguage }),
    ];

    const [
        translatedMorning,
        translatedLunch,
        translatedDinner,
        translatedExercise,
        translatedRemedies,
        translatedDos,
        translatedDonts
    ] = await Promise.all(translatePromises);

    return {
      dietPlan: {
        morning: translatedMorning.translatedText,
        lunch: translatedLunch.translatedText,
        dinner: translatedDinner.translatedText,
      },
      exerciseTips: translatedExercise.translatedText.split('\n---\n'),
      homeRemedies: translatedRemedies.translatedText.split('\n---\n'),
      doAndDont: {
        dos: translatedDos.translatedText.split('\n---\n'),
        donts: translatedDonts.translatedText.split('\n---\n'),
      }
    };
  }
);


export async function generateDietPlan(input: GenerateDietPlanInput): Promise<GenerateDietPlanOutput> {
  return generateDietPlanFlow(input);
}
