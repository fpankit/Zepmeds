
'use server';
/**
 * @fileOverview This file defines a Genkit flow for predicting when a medicine supply will run out.
 *
 * @interface PredictMedicineEndDateInput - Represents the input for the flow.
 * @interface PredictMedicineEndDateOutput - Represents the output of the flow.
 * @function predictMedicineEndDate - The main function to initiate the prediction flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { add, format } from 'date-fns';

const PredictMedicineEndDateInputSchema = z.object({
  startDate: z.string().describe('The start date of the medication in ISO format.'),
  totalTablets: z.number().describe('The total number of tablets the patient has.'),
  tabletsPerDose: z.number().describe('The number of tablets taken in a single dose.'),
  timesPerDay: z.number().describe('How many times a day the medication is taken.'),
});

export type PredictMedicineEndDateInput = z.infer<typeof PredictMedicineEndDateInputSchema>;

const PredictMedicineEndDateOutputSchema = z.object({
  predictedDate: z.string().describe('The predicted date the medicine will run out, in ISO format.'),
});

export type PredictMedicineEndDateOutput = z.infer<typeof PredictMedicineEndDateOutputSchema>;

export async function predictMedicineEndDate(
  input: PredictMedicineEndDateInput
): Promise<PredictMedicineEndDateOutput> {
  return predictMedicineEndDateFlow(input);
}


const predictMedicineEndDateFlow = ai.defineFlow(
  {
    name: 'predictMedicineEndDateFlow',
    inputSchema: PredictMedicineEndDateInputSchema,
    outputSchema: PredictMedicineEndDateOutputSchema,
  },
  async ({ startDate, totalTablets, tabletsPerDose, timesPerDay }) => {
    // This flow is deterministic and doesn't need an LLM. We can calculate the date directly.
    const dailyConsumption = tabletsPerDose * timesPerDay;
    if (dailyConsumption <= 0) {
      // Return a distant future date or handle as an error if consumption is zero or negative
      const futureDate = add(new Date(), { years: 10 });
      return { predictedDate: futureDate.toISOString() };
    }
    
    const durationInDays = Math.floor(totalTablets / dailyConsumption);
    
    const start = new Date(startDate);
    const endDate = add(start, { days: durationInDays });

    return {
      predictedDate: endDate.toISOString(),
    };
  }
);
