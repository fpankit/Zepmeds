
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

const fever: OfflineAdvice = {
    differentialDiagnosis: [
        {
            condition: "Viral Fever",
            confidence: "Medium",
            reasoning: "Fever is the body's natural response to an infection, often viral. It's usually accompanied by body aches and weakness."
        }
    ],
    potentialMedicines: [
        "Take an over-the-counter fever reducer like Paracetamol.",
        "Place a cool, damp cloth on your forehead.",
        "Drink plenty of fluids like water, soups, and ORS to stay hydrated."
    ],
    precautions: [
        "Get plenty of rest to allow your body to fight the infection.",
        "Monitor your temperature regularly.",
        "Do not use heavy blankets if you have a high fever."
    ],
    diet: [
        "Eat light, easily digestible foods like khichdi, dalia, or toast.",
        "Avoid heavy, oily, and spicy foods.",
        "Include fruits rich in Vitamin C."
    ],
    exercise: [
        "Complete rest is advised until the fever subsides.",
        "Avoid any form of physical exertion."
    ],
    doctorAdvisory: "This is not a substitute for professional medical advice. Please consult a doctor if the fever is very high (above 102°F), lasts more than 3 days, or is accompanied by other severe symptoms."
};

const diarrhea: OfflineAdvice = {
    differentialDiagnosis: [
        {
            condition: "Acute Diarrhea",
            confidence: "Medium",
            reasoning: "Loose, watery stools are often caused by a viral or bacterial infection (gastroenteritis) or food poisoning."
        }
    ],
    potentialMedicines: [
        "The most important treatment is to prevent dehydration. Drink plenty of oral rehydration solution (ORS).",
        "Probiotic supplements may help restore healthy gut bacteria.",
        "Loperamide (like Imodium) can be used for adults but should be avoided if there is fever or blood in the stool."
    ],
    precautions: [
        "Wash your hands thoroughly with soap and water, especially after using the toilet and before eating.",
        "Avoid preparing food for others if you are sick.",
        "Ensure food and water are clean and properly cooked."
    ],
    diet: [
        "Follow the BRAT diet: Bananas, Rice, Applesauce, and Toast.",
        "Yogurt (curd) with rice is also beneficial.",
        "Avoid dairy products (except yogurt), fatty foods, and spicy foods until you recover."
    ],
    exercise: [
        "Rest as much as possible.",
        "Avoid exercise as it can worsen dehydration."
    ],
    doctorAdvisory: "This is not a substitute for professional medical advice. Please consult a doctor if diarrhea is severe, contains blood, is accompanied by high fever, or if you see signs of dehydration (like decreased urination, dry mouth)."
};

const skinRash: OfflineAdvice = {
    differentialDiagnosis: [
        {
            condition: "Contact Dermatitis or Allergy",
            confidence: "Low",
            reasoning: "A skin rash can have many causes, including allergies, insect bites, or infections. The appearance can vary greatly."
        }
    ],
    potentialMedicines: [
        "Apply a cool compress or calamine lotion to soothe the itch.",
        "Oatmeal baths can also provide relief.",
        "Over-the-counter antihistamine creams or tablets (like Cetirizine) can help with itching."
    ],
    precautions: [
        "Avoid scratching the rash, as this can lead to infection.",
        "Try to identify and avoid the substance that may have caused the rash (e.g., new soap, detergent, plant).",
        "Wear loose-fitting cotton clothing."
    ],
    diet: [
        "There is generally no specific diet for a simple rash, but staying hydrated is important for skin health.",
        "If you suspect a food allergy, avoid the potential trigger food."
    ],
    exercise: [
        "Avoid activities that cause excessive sweating, as it can irritate the rash.",
        "Keep the rash area clean and dry."
    ],
    doctorAdvisory: "This is not a substitute for professional medical advice. A skin rash can be a sign of many different conditions. It is highly recommended to consult a doctor, especially a dermatologist, for a correct diagnosis."
};

const musclePain: OfflineAdvice = {
    differentialDiagnosis: [
        {
            condition: "Muscle Strain or Fatigue",
            confidence: "Medium",
            reasoning: "Pain in the muscles is often due to overexertion, unaccustomed exercise, or minor injury."
        }
    ],
    potentialMedicines: [
        "Rest the affected area.",
        "Apply a hot water bag or take a warm bath to relax the muscles.",
        "For a new injury (first 48 hours), an ice pack can help reduce inflammation.",
        "Over-the-counter pain relief gels or sprays can be applied locally.",
        "Painkillers like Ibuprofen or Paracetamol can be taken for relief."
    ],
    precautions: [
        "Always warm up before exercising and cool down afterward.",
        "Avoid sudden, jerky movements.",
        "Stay well-hydrated, especially during physical activity."
    ],
    diet: [
        "Ensure your diet is rich in protein to help muscle repair.",
        "Foods rich in magnesium and potassium, like bananas and leafy greens, can help prevent cramps.",
    ],
    exercise: [
        "Gentle stretching of the sore muscles can provide relief.",
        "Avoid strenuous activity that involves the affected muscle until the pain subsides."
    ],
    doctorAdvisory: "This is not a substitute for professional medical advice. Please consult a doctor if the pain is severe, doesn't improve with rest, or is accompanied by signs of infection like redness and swelling."
};

// The main data map
export const offlineSymptomData: Record<string, { keywords: string[], data: OfflineAdvice }> = {
    'common_cold': {
        keywords: ['cold', 'cough', 'sneeze', 'runny nose', 'sore throat', 'zukham', 'khasi'],
        data: commonCold,
    },
    'headache': {
        keywords: ['headache', 'head pain', 'migraine', 'sir dard', 'sar dard'],
        data: headache,
    },
    'acidity': {
        keywords: ['acidity', 'heartburn', 'indigestion', 'gas', 'gerd', 'pet me jalan', 'seeney me jalan'],
        data: acidity,
    },
    'fever': {
        keywords: ['fever', 'temperature', 'bukhar', 'tapman'],
        data: fever
    },
    'diarrhea': {
        keywords: ['diarrhea', 'loose motion', 'dast', 'pet kharab'],
        data: diarrhea
    },
    'skin_rash': {
        keywords: ['rash', 'itching', 'khujli', 'dane', 'skin problem', 'chakatte'],
        data: skinRash
    },
    'muscle_pain': {
        keywords: ['muscle pain', 'body ache', 'sore muscle', 'badan dard', 'manspeshiyo me dard'],
        data: musclePain
    }
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
