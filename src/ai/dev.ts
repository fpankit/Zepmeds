import { config } from 'dotenv';
config();

import '@/ai/flows/ai-symptom-checker.ts';
import '@/ai/flows/generate-prescription-summary.ts';
import '@/ai/flows/echo-doc-flow.ts';
