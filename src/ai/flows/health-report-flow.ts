
'use server';
/**
 * @fileOverview An AI health report generation agent.
 *
 * - generateHealthReport - A function that handles the health report generation process.
 * - HealthReportInput - The input type for the generateHealthReport function.
 * - HealthReportOutput - The return type for the generateHealthReport function.
 */

import { ai } from '@/ai/dev';
import { z } from 'zod';

const HealthReportInputSchema = z.object({
  dailySteps: z.string().describe("User's daily steps count."),
  waterIntake: z.string().describe("User's daily water intake."),
  caloriesBurned: z.string().describe("User's daily calories burned."),
  bloodPressure: z.string().describe("User's latest blood pressure reading (e.g., '120/80 mmHg')."),
  bloodGlucose: z.string().describe("User's latest blood glucose reading (e.g., '95 mg/dL')."),
  heartRate: z.string().describe("User's latest resting heart rate (e.g., '72 bpm')."),
});
export type HealthReportInput = z.infer<typeof HealthReportInputSchema>;

const HealthReportOutputSchema = z.object({
  riskAnalysis: z.array(z.object({
    condition: z.string().describe("The health condition being analyzed (e.g., Diabetes, High BP, Obesity, Stamina)."),
    riskLevel: z.enum(['Low', 'Moderate', 'High']).describe("The assessed risk level."),
    explanation: z.string().describe("A brief explanation for the assessed risk level based on the provided data."),
  })).describe("An analysis of potential health risks based on the user's data."),
  dietPlan: z.object({
    breakfast: z.string().describe("Indian cuisine breakfast recommendation."),
    lunch: z.string().describe("Indian cuisine lunch recommendation."),
    dinner: z.string().describe("Indian cuisine dinner recommendation."),
  }).describe("A daily diet plan with Indian cuisine options."),
  exercisePlan: z.array(z.string()).describe("A list of recommended exercises."),
  homeRemedies: z.array(z.string()).describe("A list of suggested home remedies for general well-being."),
  dosAndDonts: z.object({
    dos: z.array(z.string()).describe("A list of things the user should do."),
    donts: z.array(z.string()).describe("A list of things the user should avoid."),
  }).describe("A list of general do's and don'ts for a healthier lifestyle."),
  disclaimer: z.string().describe("A mandatory disclaimer that this is not a substitute for professional medical advice."),
});
export type HealthReportOutput = z.infer<typeof HealthReportOutputSchema>;

const prompt = ai.definePrompt({
  name: 'healthReportPrompt',
  input: { schema: HealthReportInputSchema },
  output: { schema: HealthReportOutputSchema },
  prompt: `You are an expert health and wellness AI. Based on the following user health data, generate a comprehensive health report.

  User Health Data:
  - Daily Steps: {{{dailySteps}}}
  - Water Intake: {{{waterIntake}}}
  - Calories Burned: {{{caloriesBurned}}}
  - Blood Pressure: {{{bloodPressure}}}
  - Blood Glucose: {{{bloodGlucose}}}
  - Heart Rate: {{{heartRate}}}

  Your analysis should cover the following points:
  1.  **Risk Analysis**: Assess the risk (Low, Moderate, High) for High Diabetes, High BP, Obesity, and overall Stamina. Also, identify any other potential risks based on the data (e.g., high cardio leading to joint stress). Provide a brief explanation for each risk assessment.
  2.  **Diet Plan**: Create a simple one-day diet plan based on common, healthy Indian cuisine for breakfast, lunch, and dinner.
  3.  **Exercise Plan**: Suggest 3-4 suitable exercises.
  4.  **Home Remedies**: Provide 2-3 simple home remedies for general wellness.
  5.  **Do's and Don'ts**: List a few key do's and don'ts for a healthier lifestyle.
  6.  **Disclaimer**: ALWAYS start the disclaimer field with "This is an AI-generated report and not a substitute for professional medical advice. Please consult a doctor for any health concerns."

  Provide the output in the specified JSON format.
  `,
});

export async function generateHealthReport(input: HealthReportInput): Promise<HealthReportOutput> {
  const { output } = await prompt(input);
  if (!output) {
    throw new Error('The AI model did not return a valid response for the health report.');
  }
  return output;
}
