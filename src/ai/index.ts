// This file is used to register all AI flows with the Genkit system.
// By centralizing imports here, we avoid circular dependencies between the
// main AI configuration and the individual flow files.

import './flows/ai-symptom-checker';
import './flows/health-report-flow';
import './flows/ai-sentry-checker';
import './flows/echo-doc-flow';
