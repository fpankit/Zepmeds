

import { AiSymptomCheckerOutput } from "@/ai/flows/ai-symptom-checker";

/**
 * This file contains pre-defined, safe, general advice for common symptoms.
 * It is used as a fallback when the user is offline and cannot access the live AI model.
 * The advice provided here should be generic and always encourage consulting a doctor.
 */

// A simplified, offline version of the AI output schema
type OfflineAdvice = Omit<AiSymptomCheckerOutput, 'recommendedSpecialist'>;

const genericDoctorAdvisory = "This is a complex condition that requires professional diagnosis. Please consult a doctor immediately for proper diagnosis and treatment. Self-medication can be dangerous.";

const genericPlaceholderAdvice: OfflineAdvice = {
    differentialDiagnosis: [
        {
            condition: "Requires Professional Diagnosis",
            confidence: "Low",
            reasoning: "The symptoms for this condition can vary widely and require a professional medical evaluation."
        }
    ],
    potentialMedicines: ["Do not self-medicate. Follow the prescription provided by your doctor."],
    precautions: ["Consult a doctor for appropriate precautions based on your specific condition."],
    diet: ["Follow the dietary advice given by your healthcare provider."],
    exercise: ["Consult your doctor before starting any exercise regimen."],
    doctorAdvisory: genericDoctorAdvisory
};


const commonCold: OfflineAdvice = {
    differentialDiagnosis: [
        {
            condition: "Common Cold / Viral Rhinitis",
            confidence: "Medium",
            reasoning: "Symptoms like a runny nose, sore throat, cough, and sneezing are typical of a common cold, a mild viral infection of the upper respiratory tract."
        }
    ],
    potentialMedicines: [
        "Gargle with warm salt water to soothe a sore throat.",
        "Drink plenty of fluids like water, soup, and herbal tea (like ginger or tulsi tea).",
        "Use a saline nasal spray or steam inhalation to relieve congestion.",
        "Over-the-counter pain relievers like Paracetamol can help with body aches and fever.",
        "Decongestant nasal drops can be used for a blocked nose, but not for more than 3 days."
    ],
    precautions: [
        "Get plenty of rest to help your body fight the infection.",
        "Wash your hands frequently to prevent spreading the virus.",
        "Avoid close contact with others.",
        "Cover your mouth and nose when you cough or sneeze."
    ],
    diet: [
        "Eat light and easy-to-digest foods like khichdi or vegetable soup.",
        "Include Vitamin C-rich foods like oranges, amla, and lemons.",
        "Avoid cold and fried foods.",
        "Ginger and honey can help soothe your throat."
    ],
    exercise: [
        "Avoid strenuous exercise. Gentle stretching or a short walk is okay if you feel up to it.",
        "Prioritize rest and sleep to allow your body to recover."
    ],
    doctorAdvisory: "This is not a substitute for professional medical advice. Please consult a doctor for a proper diagnosis, especially if symptoms worsen, a high fever develops, or it lasts more than 7-10 days."
};

const headache: OfflineAdvice = {
    differentialDiagnosis: [
        {
            condition: "Tension Headache",
            confidence: "Medium",
            reasoning: "A dull, aching pain on both sides of the head is often a sign of a tension headache, the most common type, often related to stress, eye strain, or poor posture."
        }
    ],
    potentialMedicines: [
        "Apply a cold or warm compress to your forehead or the back of your neck.",
        "Rest in a quiet, dark room.",
        "Try gentle neck stretches and massage your neck and shoulders.",
        "Over-the-counter pain relievers like Paracetamol or Ibuprofen are effective.",
        "Balms like Vicks or Amrutanjan can provide topical relief."
    ],
    precautions: [
        "Ensure you are getting 7-8 hours of quality sleep.",
        "Stay hydrated by drinking plenty of water throughout the day.",
        "Take regular breaks from screens (20-20-20 rule: every 20 mins, look at something 20 feet away for 20 secs).",
        "Manage stress through relaxation techniques like deep breathing or meditation."
    ],
    diet: [
        "Avoid skipping meals, as hunger can trigger headaches.",
        "Limit caffeine and alcohol intake.",
        "Ginger tea may help reduce headache-related inflammation."
    ],
    exercise: [
        "Regular, moderate exercise like walking or yoga can help prevent tension headaches.",
        "Avoid intense exercise during a headache as it may worsen the pain."
    ],
    doctorAdvisory: "This is not a substitute for professional medical advice. Consult a doctor if headaches are severe, frequent, sudden, or accompanied by other symptoms like fever, stiff neck, confusion, or vision changes."
};

const acidity: OfflineAdvice = {
    differentialDiagnosis: [
        {
            condition: "Acidity / GERD (Gastroesophageal Reflux Disease)",
            confidence: "Medium",
            reasoning: "A burning sensation in the chest (heartburn), often after eating, along with bloating and gas are common signs of acidity, where stomach acid flows back into the esophagus."
        }
    ],
    potentialMedicines: [
        "Drink a glass of cold, low-fat milk for temporary relief.",
        "Chew on a few basil (tulsi) leaves or fennel seeds (saunf) after meals.",
        "Sip on cool water or coconut water.",
        "Over-the-counter antacids (like Digene, Gelusil) can neutralize stomach acid.",
    ],
    precautions: [
        "Avoid lying down immediately after meals. Wait at least 2-3 hours.",
        "Eat smaller, more frequent meals instead of large ones.",
        "Elevate the head of your bed by 6-8 inches while sleeping.",
        "Avoid smoking and alcohol as they can worsen acidity."
    ],
    diet: [
        "Avoid spicy, oily, and fried foods.",
        "Limit intake of citrus fruits, tomatoes, onions, coffee, and carbonated drinks.",
        "Include yogurt and bananas in your diet.",
        "Chew your food slowly and thoroughly."
    ],
    exercise: [
        "A gentle walk after meals can aid digestion.",
        "Avoid exercises that put pressure on your abdomen, like crunches or heavy lifting, shortly after eating."
    ],
    doctorAdvisory: "This is not a substitute for professional medical advice. Please consult a doctor for a proper diagnosis if symptoms are persistent, severe, or cause difficulty in swallowing."
};


const fever: OfflineAdvice = {
    differentialDiagnosis: [
        {
            condition: "Viral Fever",
            confidence: "Medium",
            reasoning: "Fever is the body's natural response to an infection, often viral. It's usually accompanied by body aches, weakness, and sometimes a headache or cold."
        }
    ],
    potentialMedicines: [
        "Take an over-the-counter fever reducer like Paracetamol (follow dosage instructions).",
        "Place a cool, damp cloth on your forehead and armpits (sponging).",
        "Drink plenty of fluids like water, soups, and Oral Rehydration Solution (ORS) to stay hydrated."
    ],
    precautions: [
        "Get plenty of rest to allow your body to fight the infection.",
        "Monitor your temperature regularly with a thermometer.",
        "Do not use heavy blankets if you have a high fever; use a light sheet instead."
    ],
    diet: [
        "Eat light, easily digestible foods like khichdi, dalia, toast, or clear soups.",
        "Avoid heavy, oily, and spicy foods.",
        "Include fruits rich in Vitamin C to boost immunity."
    ],
    exercise: [
        "Complete rest is advised until the fever subsides and you feel energetic again.",
        "Avoid any form of physical exertion as it can raise body temperature."
    ],
    doctorAdvisory: "This is not a substitute for professional medical advice. Please consult a doctor if the fever is very high (above 102°F), lasts more than 3 days, or is accompanied by other severe symptoms like severe headache, rash, or difficulty breathing."
};


const diarrhea: OfflineAdvice = {
    differentialDiagnosis: [
        {
            condition: "Acute Gastroenteritis (Stomach Flu)",
            confidence: "Medium",
            reasoning: "Loose, watery stools, often accompanied by stomach cramps and nausea, are commonly caused by a viral or bacterial infection."
        }
    ],
    potentialMedicines: [
        "The most important treatment is to prevent dehydration. Drink plenty of Oral Rehydration Solution (ORS) after every loose stool.",
        "Probiotic supplements (like Yakult or capsules) may help restore healthy gut bacteria.",
        "Loperamide (like Imodium) can be used for adults but should be avoided if there is fever or blood in the stool, as it can worsen some infections."
    ],
    precautions: [
        "Wash your hands thoroughly with soap and water, especially after using the toilet and before eating.",
        "Avoid preparing food for others if you are sick.",
        "Ensure food and water are clean and properly cooked."
    ],
    diet: [
        "Follow the BRAT diet: Bananas, Rice, Applesauce, and Toast.",
        "Yogurt (curd) with rice is also beneficial.",
        "Drink coconut water and lemon-salt-sugar solution.",
        "Avoid dairy products (except yogurt), fatty foods, and spicy foods until you recover."
    ],
    exercise: [
        "Rest as much as possible to conserve energy.",
        "Avoid exercise as it can worsen dehydration."
    ],
    doctorAdvisory: "This is not a substitute for professional medical advice. Consult a doctor if diarrhea is severe, contains blood or mucus, is accompanied by high fever or severe abdominal pain, or if you see signs of dehydration (like decreased urination, dry mouth, dizziness)."
};

const skinRash: OfflineAdvice = {
    differentialDiagnosis: [
        {
            condition: "Contact Dermatitis or Minor Allergy",
            confidence: "Low",
            reasoning: "A skin rash can have many causes, including allergies, insect bites, or infections. A localized itchy, red rash is often a reaction to something the skin touched."
        }
    ],
    potentialMedicines: [
        "Apply a cool compress or calamine lotion to soothe the itch.",
        "Oatmeal baths can also provide relief for widespread itching.",
        "Over-the-counter antihistamine creams or tablets (like Cetirizine) can help reduce itching.",
        "For dry, flaky rashes, use a gentle, fragrance-free moisturizer."
    ],
    precautions: [
        "Avoid scratching the rash, as this can lead to infection and scarring.",
        "Try to identify and avoid the substance that may have caused the rash (e.g., new soap, detergent, jewelry, plant).",
        "Wear loose-fitting cotton clothing to avoid irritation."
    ],
    diet: [
        "There is generally no specific diet for a simple rash, but staying hydrated is important for skin health.",
        "If you suspect a food allergy is the cause, avoid the potential trigger food and consult a doctor."
    ],
    exercise: [
        "Avoid activities that cause excessive sweating, as sweat can irritate the rash.",
        "Keep the rash area clean and dry. Pat dry gently after bathing."
    ],
    doctorAdvisory: "This is not a substitute for professional medical advice. A skin rash can be a sign of many different conditions. It is highly recommended to consult a doctor, especially a dermatologist, for a correct diagnosis if the rash is spreading, painful, or accompanied by fever."
};

const musclePain: OfflineAdvice = {
    differentialDiagnosis: [
        {
            condition: "Muscle Strain or Fatigue (DOMS)",
            confidence: "Medium",
            reasoning: "Soreness and pain in the muscles is often due to overexertion, unaccustomed exercise (Delayed Onset Muscle Soreness), or minor injury."
        }
    ],
    potentialMedicines: [
        "Rest the affected area and avoid activities that cause pain.",
        "Apply a hot water bag or take a warm bath to relax the muscles after 48 hours.",
        "For a new injury (first 48 hours), an ice pack can help reduce inflammation (apply for 15-20 mins at a time).",
        "Over-the-counter pain relief gels or sprays (like Volini, Moov) can be applied locally.",
        "Painkillers like Ibuprofen or Paracetamol can be taken for relief."
    ],
    precautions: [
        "Always warm up before exercising and cool down afterward with gentle stretches.",
        "Increase exercise intensity gradually.",
        "Stay well-hydrated, especially during physical activity, to prevent cramps."
    ],
    diet: [
        "Ensure your diet is rich in protein to help muscle repair and growth.",
        "Foods rich in magnesium and potassium, like bananas and leafy greens, can help prevent cramps.",
    ],
    exercise: [
        "Gentle stretching of the sore muscles can provide relief.",
        "Light activity like walking can increase blood flow and aid recovery.",
        "Avoid strenuous activity that involves the affected muscle until the pain subsides."
    ],
    doctorAdvisory: "This is not a substitute for professional medical advice. Please consult a doctor if the pain is severe, a result of a significant injury, doesn't improve with rest, or is accompanied by signs of infection like redness and swelling."
};

const constipation: OfflineAdvice = {
    differentialDiagnosis: [
        {
            condition: "Constipation",
            confidence: "Medium",
            reasoning: "Infrequent bowel movements or difficulty passing stools are common signs of constipation, often linked to diet and lifestyle."
        }
    ],
    potentialMedicines: [
        "Drink a glass of warm water or milk at night.",
        "Isabgol (Psyllium husk) is a natural, gentle laxative. Take it with a full glass of water.",
        "Some people find relief with stewed prunes or prune juice."
    ],
    precautions: [
        "Do not ignore the urge to have a bowel movement.",
        "Establish a regular time each day, such as after breakfast, to try to pass stools."
    ],
    diet: [
        "Gradually increase your intake of high-fiber foods like fruits (papaya, banana), vegetables (leafy greens), and whole grains (oats, brown rice).",
        "Drink plenty of water and other fluids (8-10 glasses a day).",
        "Include probiotics like yogurt (curd) in your diet."
    ],
    exercise: [
        "Regular physical activity, like a daily walk for 30 minutes, can help stimulate your intestines.",
        "Yoga poses that involve twisting the abdomen can also be helpful."
    ],
    doctorAdvisory: "This is not a substitute for professional medical advice. Consult a doctor if constipation is severe, lasts for more than two weeks, or is accompanied by abdominal pain or blood in the stool."
};

const dandruff: OfflineAdvice = {
    differentialDiagnosis: [
        {
            condition: "Dandruff (Seborrheic Dermatitis)",
            confidence: "Medium",
            reasoning: "Flaky, itchy scalp is a hallmark of dandruff, a common condition that isn't contagious or serious but can be embarrassing."
        }
    ],
    potentialMedicines: [
        "Use an over-the-counter anti-dandruff shampoo containing ingredients like Ketoconazole, Selenium sulfide, or Zinc pyrithione.",
        "A few drops of tea tree oil mixed with your regular shampoo may help.",
        "Applying a paste of curd (yogurt) to the scalp for 20-30 minutes before washing can be soothing."
    ],
    precautions: [
        "Shampoo regularly (every 2-3 days) to reduce oil and skin cell buildup.",
        "Manage stress, as it can trigger dandruff flare-ups.",
        "Avoid harsh hair styling products that can irritate your scalp."
    ],
    diet: [
        "A balanced diet rich in zinc and B vitamins can support scalp health.",
        "Limit sugary and processed foods, which can sometimes worsen inflammation."
    ],
    exercise: [
        "Regular exercise helps reduce stress, which can be a trigger for dandruff."
    ],
    doctorAdvisory: "This is not a substitute for professional medical advice. See a dermatologist if the condition doesn't improve with over-the-counter shampoos or if the scalp becomes very red or sore."
};

const minorCuts: OfflineAdvice = {
    differentialDiagnosis: [
        {
            condition: "Minor Cut or Scrape",
            confidence: "High",
            reasoning: "A break in the skin from a sharp object or a fall is a common minor injury that usually can be managed at home."
        }
    ],
    potentialMedicines: [
        "Clean the wound with clean water and gentle soap.",
        "Apply an antiseptic liquid (like Dettol or Savlon) to disinfect the area.",
        "Apply a thin layer of antibiotic ointment (like Neosporin or Cipladine).",
        "Cover with a sterile bandage (like Band-Aid) to keep it clean."
    ],
    precautions: [
        "Apply gentle pressure with a clean cloth to stop any bleeding.",
        "Change the bandage daily or whenever it gets wet or dirty.",
        "Watch for signs of infection: increased redness, swelling, pus, or fever."
    ],
    diet: ["A healthy diet helps the body heal faster."],
    exercise: ["Avoid activities that could strain or get the wound dirty until it has healed."],
    doctorAdvisory: "This is not a substitute for professional medical advice. Seek medical attention if the cut is deep, won't stop bleeding, was caused by a dirty or rusty object, or shows signs of infection."
};


// The main data map
export const offlineSymptomData: Record<string, { keywords: string[], data: OfflineAdvice }> = {
    // Primary Conditions
    'common_cold': {
        keywords: ['cold', 'cough', 'sneeze', 'runny nose', 'sore throat', 'zukham', 'khasi', 'jukaam', 'gale me kharash'],
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
        keywords: ['diarrhea', 'diarrhoea', 'loose motion', 'dast', 'pet kharab'],
        data: diarrhea
    },
    'skin_rash': {
        keywords: ['rash', 'itching', 'khujli', 'dane', 'skin problem', 'chakatte', 'eczema', 'hives'],
        data: skinRash
    },
    'muscle_pain': {
        keywords: ['muscle pain', 'body ache', 'sore muscle', 'badan dard', 'manspeshiyo me dard', 'backache', 'neck stiffness', 'sprain'],
        data: musclePain
    },
    'constipation': {
        keywords: ['constipation', 'qabz', 'pet saaf na hona'],
        data: constipation,
    },
    'dandruff': {
        keywords: ['dandruff', 'flaky scalp', 'rusi', 'scalp itch'],
        data: dandruff,
    },
    'minor_cuts': {
        keywords: ['cut', 'scrape', 'wound', 'chot', 'khat'],
        data: minorCuts
    },

    // Mapped to existing advice
    'acne': { keywords: ['acne', 'pimples', 'muhase'], data: skinRash },
    'allergic_rhinitis': { keywords: ['allergic rhinitis', 'hay fever', 'seasonal allergies', 'naak behna'], data: commonCold },
    'allergies': { keywords: ['allergies', 'allergy'], data: skinRash },
    'ankle_sprain': { keywords: ['ankle sprain', 'ankle injury', 'takne me moch'], data: musclePain },
    'arthritis': { keywords: ['arthritis', 'jodo ka dard'], data: musclePain },
    'back_pain': { keywords: ['back pain', 'kamar dard', 'back problems'], data: musclePain },
    'bronchitis': { keywords: ['bronchitis'], data: commonCold },
    'chest_infection': { keywords: ['chest infection'], data: commonCold },
    'concussion': { keywords: ['concussion', 'sar me chot'], data: headache },
    'conjunctivitis': { keywords: ['conjunctivitis', 'pink eye', 'aankh aana'], data: skinRash },
    'flu': { keywords: ['flu', 'influenza'], data: commonCold },
    'food_poisoning': { keywords: ['food poisoning'], data: diarrhea },
    'frozen_shoulder': { keywords: ['frozen shoulder'], data: musclePain },
    'gastroenteritis': { keywords: ['gastroenteritis', 'stomach flu'], data: diarrhea },
    'gord': { keywords: ['gord', 'gastro-oesophageal reflux disease'], data: acidity },
    'leg_cramps': { keywords: ['leg cramps', 'pairon me dard'], data: musclePain },

    // Serious Conditions - Generic Placeholder Advice
    'abdominal_aortic_aneurysm': { keywords: ['abdominal aortic aneurysm'], data: genericPlaceholderAdvice },
    'achilles_tendinopathy': { keywords: ['achilles tendinopathy'], data: genericPlaceholderAdvice },
    'acute_cholecystitis': { keywords: ['acute cholecystitis'], data: genericPlaceholderAdvice },
    'leukaemia': { keywords: ['leukaemia', 'leukemia'], data: genericPlaceholderAdvice },
    'pancreatitis': { keywords: ['pancreatitis'], data: genericPlaceholderAdvice },
    'addison_disease': { keywords: ['addison\'s disease'], data: genericPlaceholderAdvice },
    'adenomyosis': { keywords: ['adenomyosis'], data: genericPlaceholderAdvice },
    'liver_disease': { keywords: ['liver disease', 'cirrhosis'], data: genericPlaceholderAdvice },
    'alzheimer_disease': { keywords: ['alzheimer\'s disease', 'dementia'], data: genericPlaceholderAdvice },
    'anal_cancer': { keywords: ['anal cancer'], data: genericPlaceholderAdvice },
    'anaphylaxis': { keywords: ['anaphylaxis'], data: genericPlaceholderAdvice },
    'angina': { keywords: ['angina'], data: genericPlaceholderAdvice },
    'angioedema': { keywords: ['angioedema'], data: genericPlaceholderAdvice },
    'ankylosing_spondylitis': { keywords: ['ankylosing spondylitis'], data: genericPlaceholderAdvice },
    'anorexia_nervosa': { keywords: ['anorexia'], data: genericPlaceholderAdvice },
    'anxiety': { keywords: ['anxiety'], data: genericPlaceholderAdvice },
    'aplastic_anaemia': { keywords: ['aplastic anaemia'], data: genericPlaceholderAdvice },
    'appendicitis': { keywords: ['appendicitis'], data: genericPlaceholderAdvice },
    'arterial_thrombosis': { keywords: ['thrombosis'], data: genericPlaceholderAdvice },
    'asbestosis': { keywords: ['asbestosis'], data: genericPlaceholderAdvice },
    'asthma': { keywords: ['asthma'], data: genericPlaceholderAdvice },
    'ataxia': { keywords: ['ataxia'], data: genericPlaceholderAdvice },
    'atopic_eczema': { keywords: ['atopic eczema'], data: skinRash },
    'atrial_fibrillation': { keywords: ['atrial fibrillation'], data: genericPlaceholderAdvice },
    'adhd': { keywords: ['adhd', 'attention deficit hyperactivity disorder'], data: genericPlaceholderAdvice },
    'autism': { keywords: ['autism'], data: genericPlaceholderAdvice },
    'bacterial_vaginosis': { keywords: ['bacterial vaginosis'], data: genericPlaceholderAdvice },
    'benign_prostate_enlargement': { keywords: ['prostate enlargement'], data: genericPlaceholderAdvice },
    'bile_duct_cancer': { keywords: ['bile duct cancer', 'cholangiocarcinoma'], data: genericPlaceholderAdvice },
    'binge_eating_disorder': { keywords: ['eating disorder', 'binge eating'], data: genericPlaceholderAdvice },
    'bipolar_disorder': { keywords: ['bipolar disorder'], data: genericPlaceholderAdvice },
    'bladder_cancer': { keywords: ['bladder cancer'], data: genericPlaceholderAdvice },
    'sepsis': { keywords: ['sepsis', 'blood poisoning'], data: genericPlaceholderAdvice },
    'bone_cancer': { keywords: ['bone cancer'], data: genericPlaceholderAdvice },
    'bowel_cancer': { keywords: ['bowel cancer'], data: genericPlaceholderAdvice },
    'bowel_incontinence': { keywords: ['bowel incontinence'], data: genericPlaceholderAdvice },
    'bowel_polyps': { keywords: ['bowel polyps'], data: genericPlaceholderAdvice },
    'brain_tumours': { keywords: ['brain tumour'], data: genericPlaceholderAdvice },
    'breast_cancer': { keywords: ['breast cancer'], data: genericPlaceholderAdvice },
    'bulimia_nervosa': { keywords: ['bulimia'], data: genericPlaceholderAdvice },
    'bunion': { keywords: ['bunion'], data: genericPlaceholderAdvice },
    'cardiovascular_disease': { keywords: ['cardiovascular disease'], data: genericPlaceholderAdvice },
    'carpal_tunnel_syndrome': { keywords: ['carpal tunnel'], data: genericPlaceholderAdvice },
    'cellulitis': { keywords: ['cellulitis'], data: genericPlaceholderAdvice },
    'cerebral_palsy': { keywords: ['cerebral palsy'], data: genericPlaceholderAdvice },
    'cervical_cancer': { keywords: ['cervical cancer'], data: genericPlaceholderAdvice },
    'chickenpox': { keywords: ['chickenpox'], data: skinRash },
    'chlamydia': { keywords: ['chlamydia'], data: genericPlaceholderAdvice },
    'chronic_fatigue_syndrome': { keywords: ['chronic fatigue'], data: genericPlaceholderAdvice },
    'chronic_kidney_disease': { keywords: ['kidney disease'], data: genericPlaceholderAdvice },
    'copd': { keywords: ['copd', 'chronic obstructive pulmonary disease'], data: genericPlaceholderAdvice },
    'chronic_pain': { keywords: ['chronic pain'], data: musclePain },
    'coeliac_disease': { keywords: ['coeliac disease'], data: genericPlaceholderAdvice },
    'cold_sore': { keywords: ['cold sore'], data: skinRash },
    'coma': { keywords: ['coma'], data: genericPlaceholderAdvice },
    'congenital_heart_disease': { keywords: ['congenital heart disease'], data: genericPlaceholderAdvice },
    'coronavirus': { keywords: ['coronavirus', 'covid-19', 'long covid'], data: genericPlaceholderAdvice },
    'costochondritis': { keywords: ['costochondritis'], data: genericPlaceholderAdvice },
    'crohns_disease': { keywords: ['crohn\'s disease'], data: genericPlaceholderAdvice },
    'croup': { keywords: ['croup'], data: genericPlaceholderAdvice },
    'cystic_fibrosis': { keywords: ['cystic fibrosis'], data: genericPlaceholderAdvice },
    'cystitis': { keywords: ['cystitis'], data: genericPlaceholderAdvice },
    'deep_vein_thrombosis': { keywords: ['deep vein thrombosis', 'dvt'], data: genericPlaceholderAdvice },
    'dehydration': { keywords: ['dehydration'], data: genericPlaceholderAdvice },
    'delirium': { keywords: ['delirium'], data: genericPlaceholderAdvice },
    'dementia': { keywords: ['dementia'], data: genericPlaceholderAdvice },
    'dental_abscess': { keywords: ['dental abscess', 'tooth infection'], data: genericPlaceholderAdvice },
    'depression': { keywords: ['depression'], data: genericPlaceholderAdvice },
    'diabetic_ketoacidosis': { keywords: ['diabetic ketoacidosis', 'dka'], data: genericPlaceholderAdvice },
    'diverticulitis': { keywords: ['diverticulitis'], data: genericPlaceholderAdvice },
    'dizziness': { keywords: ['dizziness', 'lightheadedness', 'chakkar aana'], data: genericPlaceholderAdvice },
    'downs_syndrome': { keywords: ['down\'s syndrome'], data: genericPlaceholderAdvice },
    'dysphagia': { keywords: ['dysphagia', 'swallowing problems'], data: genericPlaceholderAdvice },
    'dystonia': { keywords: ['dystonia'], data: genericPlaceholderAdvice },
    'eating_disorders': { keywords: ['eating disorders'], data: genericPlaceholderAdvice },
    'earache': { keywords: ['earache', 'ear pain', 'kaan me dard'], data: genericPlaceholderAdvice },
    'ebola': { keywords: ['ebola'], data: genericPlaceholderAdvice },
    'ectopic_pregnancy': { keywords: ['ectopic pregnancy'], data: genericPlaceholderAdvice },
    'endometriosis': { keywords: ['endometriosis'], data: genericPlaceholderAdvice },
    'epilepsy': { keywords: ['epilepsy', 'seizure', 'daura padna'], data: genericPlaceholderAdvice },
    'erectile_dysfunction': { keywords: ['erectile dysfunction', 'impotence'], data: genericPlaceholderAdvice },
    'escherichia_coli': { keywords: ['e. coli'], data: genericPlaceholderAdvice },
    'eye_cancer': { keywords: ['eye cancer'], data: genericPlaceholderAdvice },
    'febrile_seizures': { keywords: ['febrile seizures'], data: genericPlaceholderAdvice },
    'fibroids': { keywords: ['fibroids'], data: genericPlaceholderAdvice },
    'fibromyalgia': { keywords: ['fibromyalgia'], data: genericPlaceholderAdvice },
    'food_allergy': { keywords: ['food allergy'], data: genericPlaceholderAdvice },
    'fungal_nail_infection': { keywords: ['fungal nail infection'], data: genericPlaceholderAdvice },
    'gallbladder_cancer': { keywords: ['gallbladder cancer'], data: genericPlaceholderAdvice },
    'gallstones': { keywords: ['gallstones'], data: genericPlaceholderAdvice },
    'ganglion_cyst': { keywords: ['ganglion cyst'], data: genericPlaceholderAdvice },
    'gad': { keywords: ['gad', 'generalised anxiety disorder'], data: genericPlaceholderAdvice },
    'genital_herpes': { keywords: ['genital herpes'], data: genericPlaceholderAdvice },
    'genital_warts': { keywords: ['genital warts'], data: genericPlaceholderAdvice },
    'glandular_fever': { keywords: ['glandular fever'], data: genericPlaceholderAdvice },
    'gonorrhoea': { keywords: ['gonorrhoea'], data: genericPlaceholderAdvice },
    'gout': { keywords: ['gout'], data: genericPlaceholderAdvice },
    'gum_disease': { keywords: ['gum disease', 'masoodo me sujan'], data: genericPlaceholderAdvice },
    'haemorrhoids': { keywords: ['haemorrhoids', 'piles', 'bawasir'], data: genericPlaceholderAdvice },
    'hand_foot_and_mouth_disease': { keywords: ['hand, foot and mouth disease'], data: genericPlaceholderAdvice },
    'hearing_loss': { keywords: ['hearing loss'], data: genericPlaceholderAdvice },
    'heart_attack': { keywords: ['heart attack'], data: genericPlaceholderAdvice },
    'heart_failure': { keywords: ['heart failure'], data: genericPlaceholderAdvice },
    'hepatitis': { keywords: ['hepatitis'], data: genericPlaceholderAdvice },
    'hiatus_hernia': { keywords: ['hiatus hernia'], data: genericPlaceholderAdvice },
    'high_blood_pressure': { keywords: ['high blood pressure', 'hypertension'], data: genericPlaceholderAdvice },
    'high_cholesterol': { keywords: ['high cholesterol'], data: genericPlaceholderAdvice },
    'hiv': { keywords: ['hiv'], data: genericPlaceholderAdvice },
    'hodgkin_lymphoma': { keywords: ['hodgkin lymphoma'], data: genericPlaceholderAdvice },
    'huntingtons_disease': { keywords: ['huntington\'s disease'], data: genericPlaceholderAdvice },
    'hydrocephalus': { keywords: ['hydrocephalus'], data: genericPlaceholderAdvice },
    'hyperglycaemia': { keywords: ['hyperglycaemia', 'high blood sugar'], data: genericPlaceholderAdvice },
    'hypoglycaemia': { keywords: ['hypoglycaemia', 'low blood sugar'], data: genericPlaceholderAdvice },
    'impetigo': { keywords: ['impetigo'], data: skinRash },
    'ingrown_toenail': { keywords: ['ingrown toenail'], data: genericPlaceholderAdvice },
    'infertility': { keywords: ['infertility'], data: genericPlaceholderAdvice },
    'ibd': { keywords: ['inflammatory bowel disease', 'ibd'], data: genericPlaceholderAdvice },
    'insomnia': { keywords: ['insomnia', 'sleeplessness', 'neend na aana'], data: genericPlaceholderAdvice },
    'iron_deficiency_anaemia': { keywords: ['anaemia', 'iron deficiency', 'khoon ki kami'], data: genericPlaceholderAdvice },
    'ibs': { keywords: ['irritable bowel syndrome', 'ibs'], data: genericPlaceholderAdvice },
    'joint_hypermobility': { keywords: ['joint hypermobility'], data: genericPlaceholderAdvice },
    'kidney_infection': { keywords: ['kidney infection'], data: genericPlaceholderAdvice },
    'kidney_stones': { keywords: ['kidney stones'], data: genericPlaceholderAdvice },
    'labyrinthitis': { keywords: ['labyrinthitis'], data: genericPlaceholderAdvice },
    'lactose_intolerance': { keywords: ['lactose intolerance'], data: genericPlaceholderAdvice },
    'laryngitis': { keywords: ['laryngitis'], data: genericPlaceholderAdvice },
    'lichen_planus': { keywords: ['lichen planus'], data: genericPlaceholderAdvice },
    'loss_of_libido': { keywords: ['loss of libido', 'low libido'], data: genericPlaceholderAdvice },
    'low_blood_pressure': { keywords: ['low blood pressure', 'hypotension'], data: genericPlaceholderAdvice },
    'lung_cancer': { keywords: ['lung cancer'], data: genericPlaceholderAdvice },
    'lupus': { keywords: ['lupus'], data: genericPlaceholderAdvice },
    'lyme_disease': { keywords: ['lyme disease'], data: genericPlaceholderAdvice },
    'lymphoedema': { keywords: ['lymphoedema'], data: genericPlaceholderAdvice },
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
