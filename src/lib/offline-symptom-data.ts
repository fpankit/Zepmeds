
import { AiSymptomCheckerOutput } from "@/ai/flows/ai-symptom-checker";

/**
 * This file contains pre-defined, safe, general advice for common symptoms.
 * It is used as a fallback when the user is offline and cannot access the live AI model.
 * The advice provided here should be generic and always encourage consulting a doctor.
 */

// A simplified, offline version of the AI output schema
type OfflineAdvice = Omit<AiSymptomCheckerOutput, 'recommendedSpecialist'>;

const commonCold: OfflineAdvice = {
    differentialDiagnosis: [
        {
            condition: "Common Cold",
            confidence: "Medium",
            reasoning: "Symptoms like a runny nose, sore throat, and cough are typical of a common cold, which is a mild viral infection of the nose and throat."
        }
    ],
    potentialMedicines: [
        "Gargle with warm salt water to soothe a sore throat.",
        "Drink plenty of fluids like water, soup, and herbal tea.",
        "Use a saline nasal spray to relieve congestion.",
        "Over-the-counter pain relievers like Paracetamol can help with body aches and fever.",
        "Decongestant nasal drops can be used for a blocked nose."
    ],
    precautions: [
        "Get plenty of rest to help your body fight the infection.",
        "Wash your hands frequently to prevent spreading the virus.",
        "Avoid close contact with others.",
        "Cover your mouth and nose when you cough or sneeze."
    ],
    diet: [
        "Eat light and easy-to-digest foods like khichdi or vegetable soup.",
        "Include Vitamin C-rich foods like oranges and lemons.",
        "Avoid cold and fried foods.",
        "Ginger tea can help soothe your throat."
    ],
    exercise: [
        "Avoid strenuous exercise. Gentle stretching or a short walk is okay if you feel up to it.",
        "Prioritize rest and sleep to allow your body to recover."
    ],
    doctorAdvisory: "This is not a substitute for professional medical advice. Please consult a doctor for a proper diagnosis, especially if symptoms worsen or last more than a week."
};

const headache: OfflineAdvice = {
    differentialDiagnosis: [
        {
            condition: "Tension Headache",
            confidence: "Medium",
            reasoning: "A dull, aching pain on both sides of the head is often a sign of a tension headache, which is the most common type of headache."
        }
    ],
    potentialMedicines: [
        "Apply a cold or warm compress to your forehead or the back of your neck.",
        "Rest in a quiet, dark room.",
        "Try gentle neck stretches.",
        "Over-the-counter pain relievers like Paracetamol or Ibuprofen are effective.",
    ],
    precautions: [
        "Ensure you are getting enough sleep.",
        "Stay hydrated by drinking plenty of water throughout the day.",
        "Take regular breaks from screens to avoid eye strain.",
        "Manage stress through relaxation techniques like deep breathing."
    ],
    diet: [
        "Avoid skipping meals.",
        "Limit caffeine and alcohol intake.",
        "Some people find relief by avoiding aged cheese and processed meats."
    ],
    exercise: [
        "Regular, moderate exercise like walking or yoga can help prevent tension headaches.",
        "Avoid intense exercise during a headache as it may worsen the pain."
    ],
    doctorAdvisory: "This is not a substitute for professional medical advice. Please consult a doctor for a proper diagnosis, especially if headaches are severe, frequent, or accompanied by other symptoms like fever or vision changes."
};

const acidity: OfflineAdvice = {
    differentialDiagnosis: [
        {
            condition: "Acidity / Indigestion",
            confidence: "Medium",
            reasoning: "A burning sensation in the chest (heartburn), bloating, and gas are common signs of acidity, often caused by excess stomach acid."
        }
    ],
    potentialMedicines: [
        "Drink a glass of cold milk for temporary relief.",
        "Chew on a few basil (tulsi) leaves.",
        "Sip on cool water or coconut water.",
        "Over-the-counter antacids (like Digene, Gelusil) can neutralize stomach acid.",
    ],
    precautions: [
        "Avoid lying down immediately after meals. Wait at least 2-3 hours.",
        "Eat smaller, more frequent meals instead of large ones.",
        "Elevate the head of your bed while sleeping.",
        "Avoid smoking and alcohol."
    ],
    diet: [
        "Avoid spicy, oily, and fried foods.",
        "Limit intake of citrus fruits, tomatoes, onions, and carbonated drinks.",
        "Include yogurt and bananas in your diet.",
        "Chew your food slowly and thoroughly."
    ],
    exercise: [
        "A gentle walk after meals can aid digestion.",
        "Avoid exercises that put pressure on your abdomen, like crunches, shortly after eating."
    ],
    doctorAdvisory: "This is not a substitute for professional medical advice. Please consult a doctor for a proper diagnosis if symptoms are persistent or severe."
};


// The main data map
export const offlineSymptomData: Record<string, { keywords: string[], data: OfflineAdvice }> = {
    'common_cold': {
        keywords: ['cold', 'cough', 'sneeze', 'runny nose', 'sore throat', 'fever', 'zukham', 'khasi', 'bukhar'],
        data: commonCold,
    },
    'headache': {
        keywords: ['headache', 'head pain', 'migraine', 'sir dard', 'sar dard'],
        data: headache,
    },
    'acidity': {
        keywords: ['acidity', 'heartburn', 'indigestion', 'gas', 'gerd', 'pet me jalan', 'seeney me jalan'],
        data: acidity,
    }
    // Add more common conditions here
};


/**
 * Finds a matching offline advice object based on keywords in the user's symptom description.
 * @param symptoms The user's symptom description.
 * @returns An `AiSymptomCheckerOutput`-like object or null if no match is found.
 */
export function findOfflineMatch(symptoms: string, targetLanguage: string): AiSymptomCheckerOutput | null {
    const lowercasedSymptoms = symptoms.toLowerCase();
    
    for (const key in offlineSymptomData) {
        const entry = offlineSymptomData[key];
        for (const keyword of entry.keywords) {
            if (lowercasedSymptoms.includes(keyword)) {
                // We found a match, return the corresponding data
                // For offline mode, we can't translate, so we return the default English data.
                // The UI should ideally show a notice that this is general, non-translated advice.
                return entry.data;
            }
        }
    }
    
    // No match found
    return null;
}
