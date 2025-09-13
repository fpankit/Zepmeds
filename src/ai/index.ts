
// This file is used to register all AI flows with the Genkit system.
// By centralizing imports here, we avoid circular dependencies between the
// main AI configuration and the individual flow files.

import './dev.js'; // Ensures the AI configuration is loaded first

import './flows/generate-prescription-summary.js';
import './flows/translate-text.js';
import './flows/ai-symptom-checker.js';
import './flows/echo-doc-flow.js';
import './flows/detect-language.js';
import '../ai-flows/text-to-speech.js';
import './flows/generate-first-aid-advice.js';
import './flows/predict-medicine-end-date.js';
import './flows/generate-diet-plan.js';
import './flows/delete-all-calls.js';
