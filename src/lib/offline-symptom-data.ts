

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

// =============================================
// MENTAL HEALTH & EMERGENCY SECTION
// =============================================

const urgeToDie: OfflineAdvice = {
    differentialDiagnosis: [
        { condition: "Mental Health Crisis", confidence: "High", reasoning: "Expressing an urge to die is a sign of a serious mental health crisis that requires immediate professional help. The reasons can be complex, including depression, anxiety, or other underlying issues." }
    ],
    potentialMedicines: [
        "Do NOT self-medicate. This is a medical emergency.",
        "Please reach out for help immediately. You are not alone."
    ],
    precautions: [
        "Talk to someone you trust right now - a friend, family member, or a helpline professional.",
        "Remove any means of self-harm from your immediate surroundings.",
        "Do not be alone. Find someone to be with you until help arrives."
    ],
    diet: ["Your immediate safety is the priority. Nutritional advice is secondary."],
    exercise: ["Physical activity is not the immediate priority. Please seek help first."],
    doctorAdvisory: "This is a medical emergency. Please do not wait. Call a helpline or go to the nearest hospital. Your life is valuable and help is available. Kiran Helpline (1800-599-0019), Ambulance (102/108), Police (112/100)."
};

const sexualHealthConcerns: OfflineAdvice = {
    differentialDiagnosis: [
        { condition: "High Libido or Sexual Health Question", confidence: "Low", reasoning: "A strong urge for sex can be a normal part of human sexuality. However, if it is causing distress, interfering with daily life, or involves unsafe practices, it's a good idea to speak with a professional." }
    ],
    potentialMedicines: ["There is no 'medicine' for a high sex drive, as it's not typically an illness. Focus on understanding and managing it in a healthy way."],
    precautions: [
        "Ensure all sexual activity is consensual and uses protection (like condoms) to prevent STDs and unintended pregnancy.",
        "Channel energy into other activities like exercise, hobbies, or creative pursuits.",
        "If these urges are causing problems in your life, relationships, or work, it is a valid reason to seek help."
    ],
    diet: ["A balanced diet contributes to overall well-being, including hormonal balance."],
    exercise: ["Regular exercise is a healthy way to manage stress and physical energy."],
    doctorAdvisory: "This is not medical advice. If your sexual urges feel out of control, cause you distress, or lead to risky behavior, please consult a doctor, a sexologist, or a mental health therapist. They can provide a safe, non-judgmental space to discuss your concerns."
};


const consultDoctorAdvisory = "This is not medical advice. Nutritional deficiencies require a proper diagnosis from a healthcare professional. Please consult a doctor for blood tests and an appropriate treatment plan.";

const ironDeficiency: OfflineAdvice = {
    differentialDiagnosis: [{ condition: "Iron-Deficiency Anemia", confidence: "Low", reasoning: "Fatigue, pale skin, shortness of breath, and brittle nails are common signs of iron deficiency, which leads to reduced red blood cell production." }],
    potentialMedicines: ["Over-the-counter iron supplements can be taken, but only after consulting a doctor to determine the correct dosage.", "Do not self-prescribe iron supplements as overload can be toxic."],
    precautions: ["Take iron supplements with Vitamin C (like orange juice) to increase absorption.", "Avoid taking iron with milk or calcium supplements, as they can hinder absorption."],
    diet: ["Eat iron-rich foods like spinach (palak), lentils (dal), chickpeas (chana), tofu, and beetroot."],
    exercise: ["Light to moderate exercise is okay, but avoid strenuous activity if you feel very weak or breathless."],
    doctorAdvisory: consultDoctorAdvisory
};

const vitaminDDeficiency: OfflineAdvice = {
    differentialDiagnosis: [{ condition: "Vitamin D Deficiency", confidence: "Low", reasoning: "Bone pain, muscle weakness, fatigue, and frequent infections can indicate a lack of Vitamin D, which is crucial for bone health and immune function." }],
    potentialMedicines: ["Vitamin D3 supplements are commonly prescribed.", "The dosage varies greatly depending on the level of deficiency."],
    precautions: ["Get regular, safe sun exposure (15-20 minutes on arms and legs in the early morning or late afternoon).", "Be careful with high-dose supplements without medical supervision."],
    diet: ["Include foods like fortified milk, mushrooms, egg yolks, and fatty fish in your diet."],
    exercise: ["Weight-bearing exercises like walking and light strength training are beneficial for bone health."],
    doctorAdvisory: consultDoctorAdvisory
};

const vitaminB12Deficiency: OfflineAdvice = {
    differentialDiagnosis: [{ condition: "Vitamin B12 Deficiency", confidence: "Low", reasoning: "Tingling or numbness in hands and feet, fatigue, weakness, mouth ulcers, and memory problems point towards B12 deficiency, which affects nerve function and red blood cell formation." }],
    potentialMedicines: ["B12 supplements (oral or injections) are the primary treatment."],
    precautions: ["Especially important for vegetarians and vegans, as B12 is mainly found in animal products.", "Regular check-ups are recommended for at-risk groups."],
    diet: ["Include dairy products, fortified cereals, and nutritional yeast. Non-vegetarians can eat eggs, meat, and fish."],
    exercise: ["Regular exercise is fine, but listen to your body if you feel fatigued or have balance issues."],
    doctorAdvisory: consultDoctorAdvisory
};

const calciumDeficiency: OfflineAdvice = {
    differentialDiagnosis: [{ condition: "Hypocalcemia (Calcium Deficiency)", confidence: "Low", reasoning: "Muscle cramps, brittle nails, dry skin, and in severe cases, numbness or tingling, can be due to low calcium levels, which are vital for bones, muscles, and nerves." }],
    potentialMedicines: ["Calcium supplements, often combined with Vitamin D for better absorption."],
    precautions: ["Avoid excessive intake of caffeine and alcohol, which can interfere with calcium absorption."],
    diet: ["Consume calcium-rich foods like milk, yogurt, cheese, ragi, spinach, almonds, and sesame seeds."],
    exercise: ["Weight-bearing exercises like walking, jogging, and dancing help maintain bone density."],
    doctorAdvisory: consultDoctorAdvisory
};

const magnesiumDeficiency: OfflineAdvice = {
    differentialDiagnosis: [{ condition: "Magnesium Deficiency", confidence: "Low", reasoning: "Muscle twitches or cramps, fatigue, weakness, and irregular heartbeat can be signs of low magnesium, an essential mineral for muscle and nerve function." }],
    potentialMedicines: ["Magnesium supplements are available but should be taken under medical guidance."],
    precautions: ["High levels of stress can deplete magnesium levels.", "Certain medications can affect magnesium absorption."],
    diet: ["Eat foods rich in magnesium, such as almonds, pumpkin seeds, spinach, bananas, and whole grains."],
    exercise: ["Moderate exercise is beneficial."],
    doctorAdvisory: consultDoctorAdvisory
};

const vitaminCDeficiency: OfflineAdvice = {
    differentialDiagnosis: [{ condition: "Scurvy (Vitamin C Deficiency)", confidence: "Low", reasoning: "Bleeding gums, frequent bruising, slow wound healing, and joint pain are classic signs of a lack of Vitamin C, which is vital for collagen production and immune health." }],
    potentialMedicines: ["Vitamin C supplements (like Limcee) are effective."],
    precautions: ["Smoking depletes Vitamin C, so quitting is highly recommended.", "Most people can get enough from their diet."],
    diet: ["Eat plenty of Vitamin C-rich foods like amla (gooseberry), guava, oranges, lemons, bell peppers (capsicum), and broccoli."],
    exercise: ["General exercise is fine."],
    doctorAdvisory: consultDoctorAdvisory
};

const iodineDeficiency: OfflineAdvice = {
    differentialDiagnosis: [{ condition: "Iodine Deficiency", confidence: "Low", reasoning: "Swelling in the neck (goiter), fatigue, weight gain, and feeling cold are symptoms related to an underactive thyroid, often caused by iodine deficiency." }],
    potentialMedicines: ["Treatment usually involves using iodized salt or, in some cases, supplements."],
    precautions: ["This is a serious condition that must be managed by a doctor."],
    diet: ["Use iodized salt for cooking. Seaweed, fish, and dairy products are also good sources of iodine."],
    exercise: ["Exercise can help manage symptoms like weight gain, but the underlying deficiency must be treated."],
    doctorAdvisory: consultDoctorAdvisory
};

const zincDeficiency: OfflineAdvice = {
    differentialDiagnosis: [{ condition: "Zinc Deficiency", confidence: "Low", reasoning: "Hair loss, slow wound healing, loss of appetite, and frequent infections can suggest a zinc deficiency, as it's important for immunity and cell growth." }],
    potentialMedicines: ["Zinc supplements may be required if deficiency is confirmed by a blood test."],
    precautions: ["Excessive zinc can interfere with copper absorption, so do not self-medicate."],
    diet: ["Include zinc-rich foods like lentils, chickpeas, seeds (pumpkin, sesame), nuts, and whole grains."],
    exercise: ["General exercise is fine."],
    doctorAdvisory: consultDoctorAdvisory
};

const vitaminADeficiency: OfflineAdvice = {
    differentialDiagnosis: [{ condition: "Vitamin A Deficiency", confidence: "Low", reasoning: "Difficulty seeing in low light (night blindness), dry eyes, and frequent infections are key signs of Vitamin A deficiency." }],
    potentialMedicines: ["Vitamin A supplements, but high doses can be toxic and must be supervised by a doctor."],
    precautions: ["Night blindness is a serious symptom that requires immediate medical attention."],
    diet: ["Eat foods rich in Vitamin A and beta-carotene, such as carrots, sweet potatoes, mangoes, papaya, and leafy green vegetables like spinach."],
    exercise: ["General exercise is fine."],
    doctorAdvisory: consultDoctorAdvisory
};

const vitaminKDeficiency: OfflineAdvice = {
    differentialDiagnosis: [{ condition: "Vitamin K Deficiency", confidence: "Low", reasoning: "Excessive bleeding from wounds, easy bruising, or heavy menstrual periods can be a sign of Vitamin K deficiency, which is crucial for blood clotting." }],
    potentialMedicines: ["Vitamin K supplements (oral or injection) are given if a deficiency is diagnosed."],
    precautions: ["This is uncommon in adults but can occur in newborns or people with certain medical conditions."],
    diet: ["Include green leafy vegetables like spinach, kale, cabbage, and broccoli in your diet."],
    exercise: ["Be cautious with activities that have a high risk of injury if you know you have a clotting issue."],
    doctorAdvisory: consultDoctorAdvisory
};

const vitaminB1Deficiency: OfflineAdvice = {
    differentialDiagnosis: [{ condition: "Thiamine (B1) Deficiency", confidence: "Low", reasoning: "Symptoms can include weakness, tingling in limbs, and fatigue. In severe cases (Beriberi), it can affect the heart and nervous system." }],
    potentialMedicines: ["Thiamine supplements are used for treatment."],
    diet: ["Eat whole grains, legumes, nuts, and pork."],
    exercise: ["Listen to your body; avoid overexertion if feeling weak."],
    doctorAdvisory: consultDoctorAdvisory
};

const vitaminB2Deficiency: OfflineAdvice = {
    differentialDiagnosis: [{ condition: "Riboflavin (B2) Deficiency", confidence: "Low", reasoning: "Cracks at the corners of the mouth, sore throat, and a swollen tongue are common signs." }],
    potentialMedicines: ["Riboflavin supplements or a multivitamin."],
    diet: ["Consume dairy products, eggs, lean meats, and green vegetables."],
    exercise: ["General exercise is fine."],
    doctorAdvisory: consultDoctorAdvisory
};

const vitaminB3Deficiency: OfflineAdvice = {
    differentialDiagnosis: [{ condition: "Niacin (B3) Deficiency (Pellagra)", confidence: "Low", reasoning: "Severe deficiency can cause dermatitis (skin rash), diarrhea, and dementia." }],
    potentialMedicines: ["Niacin supplements under medical supervision."],
    diet: ["Eat meat, fish, eggs, and fortified grains."],
    exercise: ["General exercise is fine."],
    doctorAdvisory: consultDoctorAdvisory
};

const vitaminB6Deficiency: OfflineAdvice = {
    differentialDiagnosis: [{ condition: "Vitamin B6 Deficiency", confidence: "Low", reasoning: "Can cause skin rashes, a weakened immune system, and confusion." }],
    potentialMedicines: ["Vitamin B6 supplements."],
    diet: ["Include chickpeas, fish, poultry, potatoes, and bananas in your diet."],
    exercise: ["General exercise is fine."],
    doctorAdvisory: consultDoctorAdvisory
};

const folateDeficiency: OfflineAdvice = {
    differentialDiagnosis: [{ condition: "Folate (B9) Deficiency", confidence: "Low", reasoning: "Fatigue, weakness, and mouth sores are common. It's particularly important for pregnant women to prevent birth defects." }],
    potentialMedicines: ["Folic acid supplements."],
    diet: ["Eat leafy green vegetables, beans, lentils, and fortified cereals."],
    exercise: ["General exercise is fine."],
    doctorAdvisory: consultDoctorAdvisory
};

const potassiumDeficiency: OfflineAdvice = {
    differentialDiagnosis: [{ condition: "Hypokalemia (Potassium Deficiency)", confidence: "Low", reasoning: "Muscle weakness, cramps, and constipation can occur with low potassium levels." }],
    potentialMedicines: ["Potassium supplements may be needed in severe cases, often in a hospital setting."],
    diet: ["Consume potassium-rich foods like bananas, oranges, potatoes, and spinach."],
    exercise: ["Be cautious, as severe deficiency can affect heart rhythm."],
    doctorAdvisory: consultDoctorAdvisory
};

const seleniumDeficiency: OfflineAdvice = {
    differentialDiagnosis: [{ condition: "Selenium Deficiency", confidence: "Low", reasoning: "Can lead to weakened immune function and fatigue." }],
    potentialMedicines: ["Selenium supplements, but toxicity is a risk, so medical guidance is essential."],
    diet: ["Brazil nuts are an excellent source. Fish, meat, and eggs also contain selenium."],
    exercise: ["General exercise is fine."],
    doctorAdvisory: consultDoctorAdvisory
};

const omega3Deficiency: OfflineAdvice = {
    differentialDiagnosis: [{ condition: "Omega-3 Fatty Acid Deficiency", confidence: "Low", reasoning: "Dry skin, brittle hair, and poor concentration can be linked to a lack of omega-3s." }],
    potentialMedicines: ["Fish oil or algae-based omega-3 supplements."],
    diet: ["Eat fatty fish (like salmon), walnuts, flaxseeds, and chia seeds."],
    exercise: ["General exercise is fine."],
    doctorAdvisory: consultDoctorAdvisory
};

const fiberDeficiency: OfflineAdvice = {
    differentialDiagnosis: [{ condition: "Dietary Fiber Deficiency", confidence: "Low", reasoning: "Constipation is the most common symptom of a low-fiber diet." }],
    potentialMedicines: ["Fiber supplements like Isabgol (psyllium husk)."],
    diet: ["Gradually increase intake of fruits, vegetables, whole grains, and legumes."],
    exercise: ["Regular physical activity helps promote regular bowel movements."],
    doctorAdvisory: consultDoctorAdvisory
};

const proteinDeficiency: OfflineAdvice = {
    differentialDiagnosis: [{ condition: "Protein Deficiency", confidence: "Low", reasoning: "Muscle loss, weakness, and swelling (edema) can be signs of inadequate protein intake." }],
    potentialMedicines: ["Protein powders can supplement the diet if needed."],
    diet: ["Ensure adequate protein from sources like lentils, beans, tofu, dairy, eggs, and meat."],
    exercise: ["Strength training is important to maintain muscle mass, but should be paired with adequate protein intake."],
    doctorAdvisory: consultDoctorAdvisory
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

const acne: OfflineAdvice = {
    differentialDiagnosis: [
        {
            condition: "Acne Vulgaris",
            confidence: "Medium",
            reasoning: "Pimples, blackheads, or whiteheads on the face, neck, and back are signs of acne, a common skin condition caused by clogged hair follicles."
        }
    ],
    potentialMedicines: [
        "Wash your face twice a day with a gentle, non-comedogenic cleanser.",
        "Apply an over-the-counter cream containing Benzoyl Peroxide or Salicylic Acid.",
        "A paste of turmeric (haldi) and sandalwood (chandan) can have anti-inflammatory effects.",
        "Multani mitti (Fuller's earth) face packs can help absorb excess oil."
    ],
    precautions: [
        "Avoid popping or squeezing pimples, as it can cause scarring and infection.",
        "Keep your hair clean and away from your face.",
        "Use oil-free or non-comedogenic makeup and skincare products."
    ],
    diet: [
        "Drink plenty of water to keep your skin hydrated.",
        "Some people find that limiting dairy and high-glycemic foods (like sugar and white bread) helps.",
        "Eat a balanced diet rich in fruits and vegetables."
    ],
    exercise: ["Regular exercise can improve circulation and reduce stress, which may help with acne."],
    doctorAdvisory: "This is not a substitute for professional medical advice. Consult a dermatologist if acne is severe, painful (cystic), or not responding to over-the-counter treatments."
};

const menstrualCramps: OfflineAdvice = {
    differentialDiagnosis: [
        {
            condition: "Dysmenorrhea (Menstrual Cramps)",
            confidence: "High",
            reasoning: "Throbbing or cramping pain in the lower abdomen before or during a menstrual period is very common and known as dysmenorrhea."
        }
    ],
    potentialMedicines: [
        "Apply a hot water bag or take a warm bath to relax the abdominal muscles.",
        "Drink warm ginger tea or ajwain (carom seeds) water.",
        "Over-the-counter pain relievers like Meftal-Spas (Mefenamic Acid) or Ibuprofen are effective."
    ],
    precautions: [
        "Get adequate rest during your period.",
        "Avoid stress as much as possible."
    ],
    diet: [
        "Avoid salty foods, caffeine, and carbonated drinks, which can cause bloating and discomfort.",
        "Include iron-rich foods in your diet to compensate for blood loss.",
        "Eat light and healthy meals."
    ],
    exercise: [
        "Gentle exercises like walking, yoga, or light stretching can help reduce pain.",
        "Avoid high-intensity workouts during heavy flow days if they cause discomfort."
    ],
    doctorAdvisory: "This is not a substitute for professional medical advice. See a gynecologist if the pain is severe, debilitating, or gets worse over time, as it could be a sign of an underlying condition."
};

const insomnia: OfflineAdvice = {
    differentialDiagnosis: [
        {
            condition: "Insomnia / Poor Sleep Hygiene",
            confidence: "Medium",
            reasoning: "Difficulty falling asleep, staying asleep, or waking up too early are signs of insomnia, often related to stress, anxiety, or poor sleep habits."
        }
    ],
    potentialMedicines: [
        "Drink a glass of warm milk with a pinch of turmeric or nutmeg before bed.",
        "Chamomile tea is known for its calming effects and can promote sleep.",
        "Over-the-counter sleep aids should be used with caution and only for a short term. Consulting a doctor is better."
    ],
    precautions: [
        "Create a relaxing bedtime routine, such as reading a book, listening to calm music, or taking a warm bath.",
        "Avoid screens (phone, TV, laptop) for at least an hour before bed as the blue light can interfere with sleep.",
        "Ensure your bedroom is dark, quiet, and cool."
    ],
    diet: [
        "Avoid heavy meals, caffeine, and alcohol close to bedtime.",
        "A light, healthy snack an hour before bed is okay if you're hungry."
    ],
    exercise: [
        "Regular physical activity during the day can improve sleep quality.",
        "Avoid intense exercise within 2-3 hours of your bedtime."
    ],
    doctorAdvisory: "This is not a substitute for professional medical advice. If insomnia is chronic (lasts for more than a month), significantly affects your daily life, or is related to a mental health condition, please consult a doctor."
};

const dryEyes: OfflineAdvice = {
    differentialDiagnosis: [
        {
            condition: "Dry Eye Syndrome",
            confidence: "Medium",
            reasoning: "A feeling of dryness, scratchiness, or burning in the eyes, often worsened by screen use or dry environments, is a classic sign of dry eyes."
        }
    ],
    potentialMedicines: [
        "Use over-the-counter lubricating eye drops (artificial tears) frequently throughout the day.",
        "A warm compress on the eyes for a few minutes can help stimulate tear production."
    ],
    precautions: [
        "Remember to blink regularly, especially when using digital screens.",
        "Follow the 20-20-20 rule: Every 20 minutes, look away from your screen at something 20 feet away for at least 20 seconds.",
        "Avoid direct wind from fans or ACs blowing into your eyes."
    ],
    diet: [
        "Stay hydrated by drinking plenty of water.",
        "Foods rich in Omega-3 fatty acids (like fish, walnuts, and flaxseeds) may help improve tear quality."
    ],
    exercise: ["General exercise is not directly related, but reducing screen time is a key lifestyle change."],
    doctorAdvisory: "This is not a substitute for professional medical advice. Consult an ophthalmologist (eye doctor) if symptoms are severe, persistent, or accompanied by pain or vision changes."
};

const cankerSores: OfflineAdvice = {
    differentialDiagnosis: [
        {
            condition: "Aphthous Ulcer (Canker Sore)",
            confidence: "High",
            reasoning: "Small, painful, round or oval sores inside the mouth are known as canker sores. They are common and usually heal on their own."
        }
    ],
    potentialMedicines: [
        "Rinse your mouth with salt water (1/2 teaspoon of salt in a glass of warm water).",
        "Apply a small amount of honey or coconut oil to the sore.",
        "Over-the-counter oral gels (like Dologel-CT or Orajel) can provide temporary pain relief."
    ],
    precautions: [
        "Avoid spicy, acidic, or rough foods that can irritate the sore.",
        "Use a soft-bristled toothbrush to avoid injuring the sore."
    ],
    diet: [
        "Eat soft, bland foods.",
        "Ensure you have adequate Vitamin B12, zinc, and iron in your diet, as deficiencies can sometimes trigger canker sores."
    ],
    exercise: ["No specific exercise recommendations."],
    doctorAdvisory: "This is not a substitute for professional medical advice. See a doctor or dentist if the sores are unusually large, last longer than two weeks, or are accompanied by a fever."
};

const motionSickness: OfflineAdvice = {
    differentialDiagnosis: [
        {
            condition: "Motion Sickness",
            confidence: "High",
            reasoning: "Nausea, dizziness, and vomiting during travel (car, bus, boat) are classic symptoms of motion sickness, caused by mixed signals sent to the brain."
        }
    ],
    potentialMedicines: [
        "Chew on ginger candy or sip ginger tea.",
        "Suck on a lemon wedge or smell it.",
        "Over-the-counter tablets like Avomine can be taken about 30-60 minutes before starting your journey."
    ],
    precautions: [
        "Try to sit in the front seat of a car or in the middle of a boat where motion is least felt.",
        "Look at a stable point on the horizon.",
        "Avoid reading or using your phone while traveling.",
        "Ensure fresh air circulation."
    ],
    diet: ["Avoid heavy, greasy, or acidic meals before and during travel."],
    exercise: ["No specific exercise recommendations."],
    doctorAdvisory: "This is not a substitute for professional medical advice. If motion sickness is severe and not managed by simple measures, a doctor can prescribe stronger medication."
};


const nauseaVomiting: OfflineAdvice = {
    differentialDiagnosis: [
        { condition: "Gastroenteritis or Indigestion", confidence: "Medium", reasoning: "Nausea and vomiting are common symptoms of stomach infections or a reaction to food. It's the body's way of getting rid of something harmful." }
    ],
    potentialMedicines: [
        "Sip on clear fluids like water, ORS, or coconut water to avoid dehydration.",
        "Chew on ginger or drink ginger tea to calm the stomach.",
        "Over-the-counter medicine like Ondansetron can help control vomiting, but consult a doctor first, especially for children."
    ],
    precautions: ["Avoid solid food until vomiting stops.", "Get plenty of rest.", "Wash hands frequently to prevent spreading infection."],
    diet: ["Once you can eat, start with bland foods like bananas, rice, or toast (BRAT diet).", "Avoid oily, spicy, and heavy foods for a day or two."],
    exercise: ["Rest is most important. Avoid all forms of exercise until you feel completely better."],
    doctorAdvisory: "This is not a substitute for professional medical advice. See a doctor if vomiting is severe, lasts more than 24 hours, you see blood, or are unable to keep any fluids down, as this can lead to severe dehydration."
};


const soreThroat: OfflineAdvice = {
    differentialDiagnosis: [
        { condition: "Pharyngitis (Viral or Bacterial)", confidence: "Medium", reasoning: "A sore, scratchy, or painful throat is a primary symptom of pharyngitis, which is most often caused by a virus (like the common cold) but can also be bacterial (strep throat)." }
    ],
    potentialMedicines: [
        "Gargle with warm salt water every few hours.",
        "Suck on throat lozenges or hard candies to keep the throat moist.",
        "Drink warm liquids like herbal tea with honey and lemon, or clear soups."
    ],
    precautions: ["Rest your voice as much as possible.", "Use a humidifier to add moisture to the air.", "Avoid smoking and secondhand smoke."],
    diet: ["Eat soft foods that are easy to swallow.", "Avoid spicy or acidic foods that can irritate your throat.", "Stay well-hydrated with warm fluids."],
    exercise: ["Avoid strenuous exercise. Rest allows your body to fight the infection."],
    doctorAdvisory: "This is not a substitute for professional medical advice. You should see a doctor if your sore throat is severe, lasts longer than a week, is accompanied by a high fever, rash, or difficulty breathing, as it could be a sign of a bacterial infection like strep throat that requires antibiotics."
};

const fatigue: OfflineAdvice = {
    differentialDiagnosis: [
        { condition: "General Fatigue / Overexertion", confidence: "Low", reasoning: "Fatigue is a very general symptom that can be caused by many things, including lack of sleep, stress, poor diet, or as a symptom of another illness." }
    ],
    potentialMedicines: [
        "There is no specific medicine for general fatigue. Focus on lifestyle changes.",
        "Ensure you are properly hydrated by drinking plenty of water.",
        "Consider a balanced diet to ensure you're not missing any key nutrients."
    ],
    precautions: ["Prioritize getting 7-9 hours of quality sleep per night.", "Try to reduce and manage stress through relaxation techniques.", "Listen to your body and rest when you feel tired."],
    diet: ["Eat a balanced diet with whole grains, lean protein, fruits, and vegetables.", "Avoid excessive sugar and processed foods, which can cause energy crashes.", "Ensure adequate iron intake, as deficiency can cause fatigue."],
    exercise: ["Regular, moderate exercise can actually boost your energy levels in the long run.", "Start with short walks and gradually increase the duration and intensity.", "Avoid over-exercising, which can make fatigue worse."],
    doctorAdvisory: "This is not a substitute for professional medical advice. If fatigue is persistent, severe, and unexplained by lifestyle factors, it's very important to see a doctor to rule out underlying medical conditions like anemia, thyroid issues, or chronic fatigue syndrome."
};

const toothache: OfflineAdvice = {
    differentialDiagnosis: [
        { condition: "Dental Caries (Cavity) or Gum Inflammation", confidence: "Low", reasoning: "Tooth pain is most commonly caused by a cavity, but it can also result from gum disease, an abscess, or teeth grinding. A professional dental exam is needed to know the exact cause." }
    ],
    potentialMedicines: [
        "Rinse your mouth with warm salt water.",
        "Over-the-counter pain relievers like Ibuprofen or Paracetamol can help manage the pain temporarily.",
        "Applying clove oil (eugenol) on a cotton swab to the affected tooth can provide temporary relief."
    ],
    precautions: ["Avoid very hot, cold, or sugary foods and drinks that can trigger pain.", "Try to chew on the opposite side of your mouth.", "Maintain good oral hygiene by brushing and flossing gently."],
    diet: ["Stick to soft foods if chewing is painful."],
    exercise: ["No specific recommendations, but avoid clenching your jaw during exercise."],
    doctorAdvisory: "This is not a substitute for professional medical advice. You must see a dentist as soon as possible. A toothache is a sign of a problem that will likely get worse without professional treatment. Do not ignore it."
};

// CROSS-SYMPTOM ENTRIES
const feverAndHeadache: OfflineAdvice = {
    differentialDiagnosis: [
        { condition: "Viral Fever or Influenza", confidence: "Medium", reasoning: "The combination of fever and headache is very common with viral infections like the flu, where the body's immune response causes inflammation and pain." },
        { condition: "Sinusitis", confidence: "Low", reasoning: "If the headache is concentrated around the front of the face and accompanied by facial pressure or a stuffy nose, it could be a sinus infection."}
    ],
    potentialMedicines: [
        "Take Paracetamol or Ibuprofen to manage both fever and headache.",
        "Apply a cool, damp cloth to your forehead.",
        "Rest in a quiet, dark room to ease headache sensitivity."
    ],
    precautions: ["Drink plenty of fluids (water, ORS, soup) to stay hydrated, which is crucial during a fever.", "Get as much rest as possible.", "Monitor your temperature."],
    diet: ["Eat light and nutritious food like soups or khichdi.", "Avoid heavy, oily foods and alcohol."],
    exercise: ["Complete rest is necessary. Do not exercise with a fever."],
    doctorAdvisory: "This is not a substitute for professional medical advice. See a doctor if the headache is severe, the fever is high (over 102°F), or if you develop a stiff neck, rash, or confusion. These could be signs of a more serious condition like meningitis."
};

const diarrheaAndVomiting: OfflineAdvice = {
    differentialDiagnosis: [
        { condition: "Gastroenteritis (Stomach Flu)", confidence: "High", reasoning: "The simultaneous occurrence of diarrhea and vomiting is a classic sign of gastroenteritis, an inflammation of the stomach and intestines, usually caused by a virus or bacteria from contaminated food or water." }
    ],
    potentialMedicines: [
        "The absolute priority is to prevent dehydration. Sip an Oral Rehydration Solution (ORS) continuously throughout the day.",
        "Avoid solid food for several hours to let your stomach rest.",
        "Medicines to stop vomiting (like Ondansetron) or diarrhea (like Loperamide) should only be taken after consulting a doctor, as they can sometimes trap the infection."
    ],
    precautions: ["Rest is essential.", "Wash your hands thoroughly and frequently.", "Do not handle or prepare food for others to prevent spreading the illness."],
    diet: ["Once vomiting subsides, slowly introduce the BRAT diet (Bananas, Rice, Applesauce, Toast).", "Probiotic yogurt (curd) can be beneficial.", "Strictly avoid dairy, spicy, oily, and sugary foods."],
    exercise: ["Do not exercise. Your body needs to conserve all its energy and fluids to fight the infection."],
    doctorAdvisory: "This is not a substitute for professional medical advice. Seek immediate medical attention if you cannot keep any fluids down for more than a few hours, notice blood in your vomit or stool, have a high fever, or show signs of severe dehydration (dizziness, no urination, extreme weakness)."
};

const coughAndFever: OfflineAdvice = {
    differentialDiagnosis: [
        { condition: "Bronchitis or Influenza (Flu)", confidence: "Medium", reasoning: "A cough combined with fever suggests an infection in the respiratory tract. It could be bronchitis (inflammation of the airways) or a more systemic viral illness like the flu." }
    ],
    potentialMedicines: [
        "Use Paracetamol to control the fever and relieve body aches.",
        "For a dry cough, honey and lemon in warm water can be soothing. Over-the-counter cough suppressants can be used at night.",
        "For a wet cough (with phlegm), a mucolytic cough syrup can help loosen mucus. Steam inhalation is also very effective."
    ],
    precautions: ["Get plenty of rest.", "Drink lots of warm fluids to soothe the throat and thin mucus.", "Use a humidifier in your room."],
    diet: ["Have warm soups and broths.", "Avoid cold drinks and foods.", "Turmeric milk (haldi doodh) has anti-inflammatory properties that may help."],
    exercise: ["Avoid exercise completely. Rest is crucial for recovery from a respiratory infection."],
    doctorAdvisory: "This is not a substitute for professional medical advice. Consult a doctor if the fever is high, the cough is severe or produces colored phlegm, or if you experience shortness of breath or chest pain. This could indicate a more serious infection like pneumonia."
};


const hypertension: OfflineAdvice = {
    differentialDiagnosis: [{ condition: "Hypertension (High Blood Pressure)", confidence: "Low", reasoning: "Hypertension is often asymptomatic ('the silent killer'). Symptoms like headaches or dizziness only occur when it's very high. A diagnosis can only be made with a BP monitor." }],
    potentialMedicines: ["Do NOT self-medicate. BP medicines like Amlodipine or Telmisartan must be prescribed and monitored by a doctor."],
    precautions: ["Regularly monitor your blood pressure.", "Reduce stress through yoga and meditation.", "Quit smoking and limit alcohol intake."],
    diet: ["Reduce salt (sodium) intake significantly. Avoid pickles, papad, and processed foods.", "Eat more fruits, vegetables, and whole grains (DASH diet)."],
    exercise: ["Engage in at least 30 minutes of moderate aerobic exercise (like brisk walking, jogging, or cycling) most days of the week."],
    doctorAdvisory: "This is not medical advice. High blood pressure is a serious condition that requires management by a doctor. Please consult a physician for a proper diagnosis and treatment plan."
};

const diabetes: OfflineAdvice = {
    differentialDiagnosis: [{ condition: "Diabetes Mellitus", confidence: "Low", reasoning: "Symptoms like frequent urination, excessive thirst, unexplained weight loss, and fatigue can indicate high blood sugar. A blood test is required for diagnosis." }],
    potentialMedicines: ["Do NOT self-medicate. Diabetes medication (like Metformin or Insulin) is prescribed and adjusted by a doctor based on your blood sugar levels."],
    precautions: ["Regularly monitor your blood sugar levels as advised by your doctor.", "Take proper care of your feet; inspect them daily for any cuts or sores.", "Carry a source of sugar in case of hypoglycemia (low blood sugar)."],
    diet: ["Avoid sugar, sweets, and refined carbohydrates (maida, white bread).", "Eat a balanced diet with controlled portions of whole grains, proteins, and vegetables.", "Distribute meals throughout the day to avoid sugar spikes."],
    exercise: ["Regular physical activity (at least 150 minutes per week) is crucial for managing blood sugar.", "Both aerobic exercise and strength training are beneficial."],
    doctorAdvisory: "This is not medical advice. Diabetes requires lifelong management under the guidance of a doctor (General Physician or Endocrinologist). Please consult one for accurate diagnosis and treatment."
};

const uti: OfflineAdvice = {
    differentialDiagnosis: [{ condition: "Urinary Tract Infection (UTI)", confidence: "Medium", reasoning: "A burning sensation during urination, frequent urge to urinate, and cloudy or strong-smelling urine are classic signs of a UTI, a bacterial infection of the urinary system." }],
    potentialMedicines: ["UTIs require antibiotics prescribed by a doctor. Do not self-medicate.", "Over-the-counter urine alkalizers (like Cital) can help relieve burning but do not cure the infection."],
    precautions: ["Drink plenty of water (2-3 liters a day) to help flush out bacteria.", "Do not hold your urine; go to the bathroom as soon as you feel the urge.", "Wipe from front to back after using the toilet."],
    diet: ["Cranberry juice (unsweetened) may help prevent UTIs, but is not a cure.", "Avoid caffeine and alcohol as they can irritate the bladder."],
    exercise: ["General exercise is fine, but ensure you stay well-hydrated."],
    doctorAdvisory: "This is not a substitute for professional medical advice. It is important to see a doctor for a UTI to get the right antibiotics. An untreated UTI can lead to a serious kidney infection. Call Ambulance (102/108) if you have a high fever, back pain, or are vomiting."
};

const dehydration: OfflineAdvice = {
    differentialDiagnosis: [{ condition: "Dehydration", confidence: "Medium", reasoning: "Symptoms like thirst, dark yellow urine, dizziness, fatigue, and a dry mouth indicate dehydration, which occurs when you lose more fluid than you take in." }],
    potentialMedicines: ["Oral Rehydration Solution (ORS) is the best way to rehydrate. It contains the right balance of salt, sugar, and water."],
    precautions: ["Drink fluids proactively, even before you feel thirsty, especially in hot weather or during exercise.", "Monitor the color of your urine; it should be a pale, straw-like color."],
    diet: ["Drink plenty of water.", "Eat water-rich fruits and vegetables like watermelon, cucumber, and oranges.", "Avoid caffeine and alcohol, which can increase fluid loss."],
    exercise: ["Avoid strenuous exercise, especially in the heat, until you are fully rehydrated.", "Drink water before, during, and after exercise."],
    doctorAdvisory: "This is not a substitute for professional medical advice. Seek immediate medical help (Call Ambulance - 102/108) for severe dehydration, which can cause confusion, fainting, or lack of urination. It is a medical emergency."
};

const sunburn: OfflineAdvice = {
    differentialDiagnosis: [{ condition: "Sunburn", confidence: "High", reasoning: "Red, painful skin that feels hot to the touch after sun exposure is a clear sign of sunburn." }],
    potentialMedicines: ["Apply cool compresses or take a cool bath to soothe the skin.", "Apply aloe vera gel or a gentle, fragrance-free moisturizer.", "Over-the-counter pain relievers like Ibuprofen can help with pain and inflammation."],
    precautions: ["Avoid further sun exposure until the skin has healed.", "Do not peel the skin or break any blisters, as this can lead to infection.", "Wear loose, soft clothing that covers the sunburned skin."],
    diet: ["Drink extra water to prevent dehydration, which can occur with sunburn."],
    exercise: ["Avoid exercise that causes friction or sweating on the sunburned area."],
    doctorAdvisory: "This is not a substitute for professional medical advice. See a doctor if the sunburn is severe, covers a large area, has extensive blistering, or is accompanied by fever or chills. Call Ambulance (102/108) for signs of heatstroke."
};


// The main data map
export const offlineSymptomData: Record<string, { keywords: string[], data: OfflineAdvice }> = {
    // MENTAL HEALTH (HIGH PRIORITY)
    'urge_to_die': { keywords: ['urge to die', 'suicide', 'kill myself', 'end my life', 'marne ka mann', 'jeena nahi'], data: urgeToDie },
    'sexual_health_concerns': { keywords: ['sex', 'sexual', 'libido'], data: sexualHealthConcerns },

    // Nutrition Deficiencies
    'iron_deficiency': { keywords: ['iron deficiency', 'anemia', 'pale skin', 'brittle nails'], data: ironDeficiency },
    'vitamin_d_deficiency': { keywords: ['vitamin d deficiency', 'bone pain', 'muscle weakness'], data: vitaminDDeficiency },
    'vitamin_b12_deficiency': { keywords: ['vitamin b12 deficiency', 'tingling in hands', 'numbness in feet', 'mouth ulcers'], data: vitaminB12Deficiency },
    'calcium_deficiency': { keywords: ['calcium deficiency', 'muscle cramps', 'dry skin'], data: calciumDeficiency },
    'magnesium_deficiency': { keywords: ['magnesium deficiency', 'muscle twitches'], data: magnesiumDeficiency },
    'vitamin_c_deficiency': { keywords: ['vitamin c deficiency', 'bleeding gums', 'scurvy', 'slow wound healing'], data: vitaminCDeficiency },
    'iodine_deficiency': { keywords: ['iodine deficiency', 'goiter', 'neck swelling'], data: iodineDeficiency },
    'zinc_deficiency': { keywords: ['zinc deficiency', 'hair loss', 'loss of appetite'], data: zincDeficiency },
    'vitamin_a_deficiency': { keywords: ['vitamin a deficiency', 'night blindness', 'dry eyes'], data: vitaminADeficiency },
    'vitamin_k_deficiency': { keywords: ['vitamin k deficiency', 'easy bruising', 'excessive bleeding'], data: vitaminKDeficiency },
    'vitamin_b1_deficiency': { keywords: ['vitamin b1 deficiency', 'thiamine', 'beriberi'], data: vitaminB1Deficiency },
    'vitamin_b2_deficiency': { keywords: ['vitamin b2 deficiency', 'riboflavin', 'cracks in mouth'], data: vitaminB2Deficiency },
    'vitamin_b3_deficiency': { keywords: ['vitamin b3 deficiency', 'niacin', 'pellagra'], data: vitaminB3Deficiency },
    'vitamin_b6_deficiency': { keywords: ['vitamin b66 deficiency'], data: vitaminB6Deficiency },
    'folate_deficiency': { keywords: ['folate deficiency', 'folic acid', 'vitamin b9'], data: folateDeficiency },
    'potassium_deficiency': { keywords: ['potassium deficiency', 'hypokalemia'], data: potassiumDeficiency },
    'selenium_deficiency': { keywords: ['selenium deficiency'], data: seleniumDeficiency },
    'omega_3_deficiency': { keywords: ['omega-3 deficiency', 'omega 3'], data: omega3Deficiency },
    'fiber_deficiency': { keywords: ['fiber deficiency', 'low fiber'], data: fiberDeficiency },
    'protein_deficiency': { keywords: ['protein deficiency', 'muscle loss'], data: proteinDeficiency },

    // Cross-Symptom Entries (Higher Priority)
    'diarrhea_and_vomiting': { keywords: ['diarrhea and vomiting', 'dast aur ulti', 'loose motion and vomiting'], data: diarrheaAndVomiting },
    'cough_and_fever': { keywords: ['cough and fever', 'khasi aur bukhar', 'fever with cough'], data: coughAndFever },
    'fever_and_headache': { keywords: ['fever and headache', 'bukhar aur sar dard', 'headache with fever'], data: feverAndHeadache },

    // Individual Conditions
    'common_cold': {
        keywords: ['cold', 'sneeze', 'runny nose', 'zukham', 'jukaam'],
        data: commonCold,
    },
     'sore_throat': { keywords: ['sore throat', 'gale me kharash', 'throat pain', 'gala dukhna'], data: soreThroat },
     'cough': { keywords: ['cough', 'khasi'], data: commonCold }, // Fallback to common cold if just cough
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
     'nausea_vomiting': { keywords: ['nausea', 'vomiting', 'ji machalna', 'ulti', 'matli'], data: nauseaVomiting },
    'skin_rash': {
        keywords: ['rash', 'itching', 'khujli', 'dane', 'skin problem', 'chakatte', 'eczema', 'hives'],
        data: skinRash
    },
    'muscle_pain': {
        keywords: ['muscle pain', 'body ache', 'sore muscle', 'badan dard', 'manspeshiyo me dard', 'backache', 'neck stiffness', 'sprain'],
        data: musclePain
    },
    'fatigue': { keywords: ['fatigue', 'weakness', 'tiredness', 'thakaan', 'kamzori'], data: fatigue },
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
     'acne': { 
        keywords: ['acne', 'pimples', 'muhase'], 
        data: acne 
    },
    'menstrual_cramps': {
        keywords: ['menstrual cramps', 'period pain', 'mahine ka dard'],
        data: menstrualCramps
    },
    'insomnia': {
        keywords: ['insomnia', 'sleeplessness', 'neend na aana'],
        data: insomnia
    },
    'dry_eyes': {
        keywords: ['dry eyes', 'aankhon me jalan', 'aankhon me sookha'],
        data: dryEyes
    },
    'canker_sores': {
        keywords: ['canker sore', 'mouth ulcer', 'muh me chhale'],
        data: cankerSores
    },
    'motion_sickness': {
        keywords: ['motion sickness', 'travel sickness', 'safar me ulti'],
        data: motionSickness
    },
    'toothache': { keywords: ['toothache', 'daant me dard', 'tooth pain'], data: toothache },

    // New Entries
    'hypertension': { keywords: ['hypertension', 'high blood pressure', 'high bp', 'bp high'], data: hypertension },
    'diabetes': { keywords: ['diabetes', 'sugar', 'madhumeh'], data: diabetes },
    'uti': { keywords: ['urinary tract infection', 'uti', 'urine infection', 'peshab me jalan'], data: uti },
    'dehydration': { keywords: ['dehydration', 'paani ki kami'], data: dehydration },
    'sunburn': { keywords: ['sunburn', 'dhoop se jalna'], data: sunburn },

    // Mapped to existing advice for wider coverage
    'allergic_rhinitis': { keywords: ['allergic rhinitis', 'hay fever', 'seasonal allergies', 'naak behna'], data: commonCold },
    'allergies': { keywords: ['allergies', 'allergy'], data: skinRash },
    'ankle_sprain': { keywords: ['ankle sprain', 'ankle injury', 'takne me moch'], data: musclePain },
    'arthritis': { keywords: ['arthritis', 'jodo ka dard'], data: musclePain },
    'back_pain': { keywords: ['back pain', 'kamar dard', 'back problems'], data: musclePain },
    'bronchitis': { keywords: ['bronchitis'], data: coughAndFever },
    'concussion': { keywords: ['concussion', 'sar me chot'], data: headache },
    'conjunctivitis': { keywords: ['conjunctivitis', 'pink eye', 'aankh aana'], data: dryEyes }, // Simple mapping for now
    'flu': { keywords: ['flu', 'influenza'], data: coughAndFever },
    'food_poisoning': { keywords: ['food poisoning'], data: diarrheaAndVomiting },
    'frozen_shoulder': { keywords: ['frozen shoulder'], data: musclePain },
    'gastroenteritis': { keywords: ['gastroenteritis', 'stomach flu'], data: diarrheaAndVomiting },
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
    'heart_attack': { keywords: ['heart attack'], data: genericPlaceholderAdvice },
    'heart_failure': { keywords: ['heart failure'], data: genericPlaceholderAdvice },
    'hepatitis': { keywords: ['hepatitis'], data: genericPlaceholderAdvice },
    'hiatus_hernia': { keywords: ['hiatus hernia'], data: genericPlaceholderAdvice },
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
 * It now prioritizes multi-symptom matches.
 * @param symptoms The user's symptom description.
 * @returns An `AiSymptomCheckerOutput`-like object or null if no match is found.
 */
export function findOfflineMatch(symptoms: string, targetLanguage: string): AiSymptomCheckerOutput | null {
    const lowercasedSymptoms = symptoms.toLowerCase();
    
    // Create a list of all keywords from the symptom map to search for multi-word matches first
    const allSymptomKeys = Object.keys(offlineSymptomData);

    // Prioritize cross-symptom matches (which have ' and ' in their keywords)
    const crossSymptomKeys = allSymptomKeys.filter(k => offlineSymptomData[k].keywords.some(kw => kw.includes(' and ')));
    const singleSymptomKeys = allSymptomKeys.filter(k => !crossSymptomKeys.includes(k));

    // Search for cross-symptoms first
    for (const key of crossSymptomKeys) {
        const entry = offlineSymptomData[key];
        for (const keyword of entry.keywords) {
            const multiKeywords = keyword.split(' and ');
            const allKeywordsPresent = multiKeywords.every(kw => lowercasedSymptoms.includes(kw.trim()));
            if (allKeywordsPresent) {
                return entry.data;
            }
        }
    }

    // Then search for single symptoms
    for (const key of singleSymptomKeys) {
        const entry = offlineSymptomData[key];
        for (const keyword of entry.keywords) {
            if (lowercasedSymptoms.includes(keyword)) {
                return entry.data;
            }
        }
    }
    
    // No match found
    return null;
}

