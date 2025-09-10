
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a personalized diet and lifestyle plan.
 *
 * The flow takes a user's health metrics and a target language as input, then generates
 * a culturally relevant health risk analysis, diet plan, exercise tips, home remedies, and do's/don'ts.
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

const HealthAnalysisSchema = z.object({
    riskSummary: z.string().describe("A brief, 1-2 sentence summary of the user's overall health risk based on the data."),
    risks: z.array(z.object({
        condition: z.string().describe("The health condition being analyzed (e.g., 'Diabetes', 'High Blood Pressure', 'Obesity', 'Low Stamina')."),
        level: z.string().describe("The assessed risk level ('Low', 'Moderate', 'High')."),
        reason: z.string().describe("A brief reason for the assessment.")
    })).describe("An array of health risk assessments.")
});

const GenerateDietPlanOutputSchema = z.object({
  healthAnalysis: HealthAnalysisSchema,
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
  prompt: `You are an expert nutritionist and lifestyle coach from India. Based on the user's health metrics, create a personalized health report. The suggestions should be practical and culturally relevant for an average person in India.

  User's Health Data:
  - Blood Pressure: {{{bloodPressure}}}
  - Blood Sugar: {{{bloodGlucose}}}
  - Daily Steps: {{{dailySteps}}}
  - Water Intake: {{{waterIntake}}}
  - Calories Burned: {{{caloriesBurned}}}

  Your response MUST include the following sections:
  1. **Health Risk Analysis**:
     - Provide a brief, 1-2 sentence summary of the user's overall health risk.
     - Analyze the risk ('Low', 'Moderate', 'High') for the following conditions: Diabetes, High Blood Pressure, Obesity, and Low Stamina. Provide a short reason for each assessment.
  2.  **Diet Plan**: Suggest simple, common Indian meals for breakfast (morning), lunch, and dinner.
  3.  **Exercise Tips**: Provide 3-4 practical activity or exercise tips.
  4.  **Home Remedies**: Suggest 2-3 local home remedies (ghar ke nuskhe) relevant to the user's BP or Sugar levels.
  5.  **Do's and Don'ts**: Provide a list of important do's and another list of important don'ts.

  Keep the language simple and encouraging. Generate the entire response in English.
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

    // Helper function to translate a single string
    const translate = async (text: string) => {
        if (!text) return "";
        const result = await translateText({ text, targetLanguage });
        return result.translatedText;
    };
    
    // Helper function to translate an array of strings
    const translateArray = async (arr: string[]) => {
        if (!arr || arr.length === 0) return [];
        const translatedText = await translate(arr.join('\n---\n'));
        return translatedText.split('\n---\n');
    };

    // 3. Translate all parts of the result to the target language
    const [
        translatedAnalysisSummary,
        translatedRisks,
        translatedMorning,
        translatedLunch,
        translatedDinner,
        translatedExercise,
        translatedRemedies,
        translatedDos,
        translatedDonts
    ] = await Promise.all([
        translate(englishResult.healthAnalysis.riskSummary),
        Promise.all(englishResult.healthAnalysis.risks.map(async (risk) => ({
            condition: await translate(risk.condition),
            level: await translate(risk.level),
            reason: await translate(risk.reason),
        }))),
        translate(englishResult.dietPlan.morning),
        translate(englishResult.dietPlan.lunch),
        translate(englishResult.dietPlan.dinner),
        translateArray(englishResult.exerciseTips),
        translateArray(englishResult.homeRemedies),
        translateArray(englishResult.doAndDont.dos),
        translateArray(englishResult.doAndDont.donts),
    ]);

    return {
      healthAnalysis: {
        riskSummary: translatedAnalysisSummary,
        risks: translatedRisks,
      },
      dietPlan: {
        morning: translatedMorning,
        lunch: translatedLunch,
        dinner: translatedDinner,
      },
      exerciseTips: translatedExercise,
      homeRemedies: translatedRemedies,
      doAndDont: {
        dos: translatedDos,
        donts: translatedDonts,
      }
    };
  }
);


export async function generateDietPlan(input: GenerateDietPlanInput): Promise<GenerateDietPlanOutput> {
  return generateDietPlanFlow(input);
}
