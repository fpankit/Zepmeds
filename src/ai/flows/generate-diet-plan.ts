
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a personalized diet and lifestyle plan.
 *
 * The flow takes a user's health metrics and a target language as input, then generates
 * a culturally relevant health risk analysis, diet plan, exercise tips, home remedies, and do's/don'ts.
 * It includes a fallback mechanism to generate a basic report if AI services are unavailable.
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
    morning: z.string().describe('A detailed breakfast suggestion.'),
    lunch: z.string().describe('A detailed lunch suggestion.'),
    dinner: z.string().describe('A detailed dinner suggestion.'),
});

const DoAndDontSchema = z.object({
    dos: z.array(z.string()).describe('A detailed list of at least 5 things the user should do.'),
    donts: z.array(z.string()).describe('A detailed list of at least 5 things the user should avoid.'),
});

const HealthAnalysisSchema = z.object({
    riskSummary: z.string().describe("A brief, 1-2 sentence summary of the user's overall health risk based on the data."),
    risks: z.array(z.object({
        condition: z.string().describe("The health condition being analyzed (e.g., 'Diabetes', 'High Blood Pressure', 'Obesity', 'Low Stamina', 'Cardiac Stress')."),
        level: z.string().describe("The assessed risk level ('Low', 'Moderate', 'High', 'Very High')."),
        reason: z.string().describe("A detailed reason for the assessment, explaining how the user's data contributes to this risk level.")
    })).describe("An array of health risk assessments. MUST include Diabetes, High Blood Pressure, Obesity, and Low Stamina.")
});

const GenerateDietPlanOutputSchema = z.object({
  healthAnalysis: HealthAnalysisSchema,
  dietPlan: DietPlanSchema,
  exerciseTips: z.array(z.string()).describe('A detailed list of at least 4 exercise or activity recommendations.'),
  homeRemedies: z.array(z.string()).describe('A detailed list of at least 4 local, culturally relevant home remedies ("ghar ke nuskhe").'),
  doAndDont: DoAndDontSchema,
});
export type GenerateDietPlanOutput = z.infer<typeof GenerateDietPlanOutputSchema>;


const englishPrompt = ai.definePrompt({
  name: 'generateDietPlanEnglishPrompt',
  input: {schema: HealthMetricsSchema},
  output: {schema: GenerateDietPlanOutputSchema},
  prompt: `You are an expert nutritionist and lifestyle coach from India. Based on the user's health metrics, create a personalized and comprehensive health report. The suggestions must be practical and culturally relevant for an average person in India. Generate detailed content for each section to be informative.

  User's Health Data:
  - Blood Pressure: {{{bloodPressure}}}
  - Blood Sugar: {{{bloodGlucose}}}
  - Daily Steps: {{{dailySteps}}}
  - Water Intake: {{{waterIntake}}}
  - Calories Burned: {{{caloriesBurned}}}

  Your response MUST include the following sections:
  1. **Health Risk Analysis**: 
     - You MUST analyze the risk ('Low', 'Moderate', 'High', 'Very High') for ALL of the following conditions: Diabetes, High Blood Pressure, Obesity, and Low Stamina. Provide a detailed, specific reason for each assessment based on the user's data.
     - CRITICAL: Also analyze the risk of over-exertion or negative effects. For example, if 'dailySteps' is excessively high (e.g., > 30,000), identify a risk of 'Joint Problems' or 'Cardiac Stress'. If water intake is extremely high, mention risks like hyponatremia. Provide a detailed explanation.
  2.  **Diet Plan**: Suggest detailed, common Indian meals for breakfast (morning), lunch, and dinner. Provide enough detail to fill a section on a page.
  3.  **Exercise Tips**: Provide at least 4-5 practical and detailed activity or exercise tips.
  4.  **Home Remedies**: Suggest at least 4 detailed local home remedies (ghar ke nuskhe) relevant to the user's potential health risks.
  5.  **Do's and Don'ts**: Provide a detailed list of at least 5 important do's and at least 5 important don'ts.

  Keep the language simple and encouraging. Generate the entire response in English.
  `,
});

// Basic offline report generator
const generateOfflineReport = (healthMetrics: z.infer<typeof HealthMetricsSchema>): GenerateDietPlanOutput => {
    return {
        healthAnalysis: {
            riskSummary: "This is a basic offline analysis. For a detailed AI-powered report, please connect to the internet.",
            risks: [
                { condition: 'General Health', level: 'Review Needed', reason: 'Basic health metrics suggest a review of diet and exercise. Connect online for a full analysis.'}
            ]
        },
        dietPlan: {
            morning: "Start your day with a balanced breakfast like Poha, Upma, or Oatmeal.",
            lunch: "Have a wholesome lunch with roti, dal, a vegetable curry, and a side of salad.",
            dinner: "Keep dinner light. Options include Khichdi, soup, or grilled vegetables."
        },
        exerciseTips: [
            "Aim for at least 30 minutes of brisk walking daily.",
            "Incorporate stretching exercises to improve flexibility.",
            "Stay hydrated throughout the day.",
            "Take short breaks to walk and stretch if you have a sedentary job."
        ],
        homeRemedies: [
            "Drink warm water with lemon and honey in the morning.",
            "Include turmeric in your diet for its anti-inflammatory properties.",
            "Chew on ginger or drink ginger tea to aid digestion."
        ],
        doAndDont: {
            dos: [
                "Eat a balanced diet with plenty of fruits and vegetables.",
                "Get at least 7-8 hours of sleep per night.",
                "Practice portion control during meals.",
                "Monitor your health metrics regularly."
            ],
            donts: [
                "Avoid processed and sugary foods.",
                "Limit your intake of caffeine and alcohol.",
                "Avoid a sedentary lifestyle.",
                "Don't skip meals, especially breakfast."
            ]
        }
    }
}


const generateDietPlanFlow = ai.defineFlow(
  {
    name: 'generateDietPlanFlow',
    inputSchema: GenerateDietPlanInputSchema,
    outputSchema: GenerateDietPlanOutputSchema,
  },
  async ({ healthMetrics, targetLanguage }) => {
    let englishResult: GenerateDietPlanOutput | undefined;
    try {
      // 1. Generate the report in English
      const { output } = await englishPrompt(healthMetrics);
      englishResult = output;

      if (!englishResult) {
          throw new Error("Failed to generate diet plan in English.");
      }
    } catch (e: any) {
        console.warn("AI report generation failed. Falling back to offline report.", e.message);
        // Fallback to a basic, non-AI report if the AI call fails (e.g., offline)
        englishResult = generateOfflineReport(healthMetrics);
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
    try {
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
    } catch (translationError) {
        console.warn("Translation failed. Returning English version as fallback.");
        // If translation fails (e.g., offline after generating English report), return the English version.
        return englishResult;
    }
  }
);


export async function generateDietPlan(input: GenerateDietPlanInput): Promise<GenerateDietPlanOutput> {
  return generateDietPlanFlow(input);
}
