
import { HeartPulse, Flame, Droplets, HelpCircle, Siren, Bone, Zap, Eye, Brain, Wind, Waves, Sun, Snowflake, Ambulance, AlertTriangle, GitCommitVertical, Baby } from "lucide-react";
import { GiScorpion, GiDogHouse, GiMonkey } from "lucide-react";
import { FaStomach } from "react-icons/fa";
import { PiSyringe } from "react-icons/pi";


export const firstAidCategories = [
    // Animal / Insect Related
    {
        slug: 'snake-bite',
        title: 'Snake Bite',
        description: 'Do\'s and don\'ts for snake bites.',
        icon: HelpCircle,
        steps: [
            "Call for emergency medical help (112 or 108) right away.",
            "Stay calm and still. Movement can cause the venom to travel more quickly through the body.",
            "Keep the bite below the level of the heart.",
            "Cover the bite with a loose, sterile bandage.",
            "Do not cut the wound, attempt to suck out the venom, apply a tourniquet, or use ice packs."
        ],
        videoUrl: 'https://www.youtube.com/embed/I_2C4gTRH1g'
    },
    {
        slug: 'dog-bite',
        title: 'Dog Bite',
        description: 'Rabies prevention and wound care.',
        icon: HelpCircle,
        steps: [
            "Wash the wound gently with soap and warm water for 5-10 minutes.",
            "Apply a clean cloth to the wound to stop any bleeding.",
            "Apply antibiotic ointment to the wound.",
            "Cover the wound with a sterile bandage.",
            "See a doctor as soon as possible, especially if the bite is deep or you're unsure of the dog's vaccination status.",
            "Avoid taping the wound tightly, as this can trap bacteria."
        ],
        videoUrl: 'https://www.youtube.com/embed/h6fP7TXlA0s'
    },
    {
        slug: 'bee-scorpion-sting',
        title: 'Bee & Scorpion Sting',
        description: 'Treatment for common stings.',
        icon: HelpCircle,
        steps: [
            "For a bee sting, gently scrape the stinger out with a fingernail or credit card.",
            "Wash the area with soap and water.",
            "Apply a cold pack to reduce swelling and pain.",
            "For a scorpion sting, clean the area and apply a cool compress. Keep the affected limb still.",
            "Seek medical help immediately (call 112) for severe reactions like difficulty breathing, or if a scorpion sting occurred in a child.",
            "Do not squeeze the stinger, as this can release more venom."
        ],
        videoUrl: 'https://www.youtube.com/embed/R1-E-r1_g8U'
    },
    {
        slug: 'monkey-bite',
        title: 'Monkey Bite',
        description: 'Handling bites from wild animals.',
        icon: HelpCircle,
        steps: [
            "Immediately wash the wound with soap and water for at least 15 minutes.",
            "Apply an antiseptic solution after washing.",
            "Consult a doctor immediately for post-exposure prophylaxis (PEP) for rabies and tetanus.",
            "Try to identify the animal for observation if it's safe to do so.",
            "Do not stitch or close the wound until a doctor has assessed it for rabies risk."
        ],
        videoUrl: 'https://www.youtube.com/embed/K8G2uG45q_s'
    },

    // Injury & Trauma
    {
        slug: 'road-accident',
        title: 'Road Accident',
        description: 'Handling fractures & bleeding.',
        icon: Siren,
        steps: [
            "Ensure the scene is safe before approaching. Call for an ambulance (108 or 112).",
            "Control severe bleeding by applying direct pressure with a clean cloth.",
            "For suspected fractures, immobilize the injured area.",
            "Keep the person warm and as comfortable as possible until help arrives.",
            "Do not move the injured person unless they are in immediate danger, and do not try to realign a broken bone."
        ],
        videoUrl: 'https://www.youtube.com/embed/I5a2y7H1m_M'
    },
    {
        slug: 'electric-shock',
        title: 'Electric Shock',
        description: 'What to do before a doctor arrives.',
        icon: Zap,
        steps: [
            "Turn off the source of electricity if possible. If not, move the source away using a dry, non-conducting object (wood, plastic).",
            "Check for signs of circulation (breathing, coughing, movement). If absent, begin CPR.",
            "Prevent shock by laying the person down with their head slightly lower than the trunk and legs elevated.",
            "Cover any burned areas with a sterile gauze bandage.",
            "Do not touch the person if they are still in contact with the electrical source."
        ],
        videoUrl: 'https://www.youtube.com/embed/N4XlZbS_S5U'
    },
    {
        slug: 'burns',
        title: 'Minor & Severe Burns',
        description: 'Cooling, dressing, and when to get help.',
        icon: Flame,
        steps: [
            "For minor burns, cool the burn with cool (not cold) running water for 10-20 minutes.",
            "For severe burns, call emergency services (112). Do not immerse large severe burns in water.",
            "Cover the burn with a sterile, non-fluffy dressing or clean cloth.",
            "Remove jewelry and tight clothing from the burn area before it swells.",
            "Do not apply ointments, butter, ice, or break any blisters that form."
        ],
        videoUrl: 'https://www.youtube.com/embed/yjh9-k2aTf0'
    },
    {
        slug: 'eye-injury',
        title: 'Eye Injury',
        description: 'For chemical entry or dust particles.',
        icon: Eye,
        steps: [
            "For dust/debris, try to let tears wash it out or use an eyewash.",
            "For a chemical splash, flush the eye with clean, lukewarm water for at least 20 minutes.",
            "For a cut or blow to the eye, gently place a protective cover over it without pressure.",
            "See a doctor for any eye injury.",
            "Do not rub the eye or try to remove an object that is embedded in the eye."
        ],
        videoUrl: 'https://www.youtube.com/embed/A3yQ5niiX-4'
    },
    {
        slug: 'head-injury',
        title: 'Head Injury',
        description: 'Red flags to watch for after a fall/accident.',
        icon: Brain,
        steps: [
            "Apply a cold pack to the injured area for 20 minutes to reduce swelling.",
            "Observe the person for 24 hours for any red flags.",
            "Red Flags: Severe headache, repeated vomiting, confusion, drowsiness, vision changes, or unequal pupils.",
            "If the person is unconscious or has any red flags, call for an ambulance (108 or 112) immediately.",
            "Do not leave the person alone for the first 24 hours, and avoid giving them any medication without a doctor's advice."
        ],
        videoUrl: 'https://www.youtube.com/embed/5_gP81F6rG8'
    },

    // Health Emergencies
    {
        slug: 'heart-attack',
        title: 'Heart Attack',
        description: 'Recognizing symptoms and giving immediate help.',
        icon: HeartPulse,
        steps: [
            "Call for an ambulance (108 or 112) immediately.",
            "Help the person sit down and rest. Keep them calm.",
            "Loosen any tight clothing around their neck.",
            "If they take medication for angina (like nitroglycerin), help them take it.",
            "If the person is unresponsive and not breathing, start CPR if you are trained.",
            "Do not leave the person alone or wait to see if the symptoms go away."
        ],
        videoUrl: 'https://www.youtube.com/embed/Oa9aWdcHIeI'
    },
    {
        slug: 'stroke',
        title: 'Stroke (Lakwa)',
        description: 'Use the F.A.S.T. test and act quickly.',
        icon: Brain,
        steps: [
            "Use the F.A.S.T. test: Face (is one side drooping?), Arms (can they raise both?), Speech (is it slurred?), Time (call for help now).",
            "Call for an ambulance (108 or 112) immediately. Note the time the first symptoms appeared.",
            "If the person is conscious, help them into a comfortable position, preferably lying on their side.",
            "Keep them calm and reassured until help arrives.",
            "Do not give the person anything to eat or drink, as their ability to swallow may be affected."
        ],
        videoUrl: 'https://www.youtube.com/embed/yX03i94bJ2w'
    },
    {
        slug: 'seizures',
        title: 'Seizures / Epilepsy',
        description: 'How to keep someone safe during an attack.',
        icon: GitCommitVertical,
        steps: [
            "Ease the person to the floor and turn them gently onto one side to help them breathe.",
            "Clear the area of hard or sharp objects.",
            "Put something soft under their head and remove eyeglasses.",
            "Time the seizure. Call for help (112) if it lasts longer than 5 minutes.",
            "Do not hold the person down or put anything in their mouth."
        ],
        videoUrl: 'https://www.youtube.com/embed/H7w5pW_o5a8'
    },
    {
        slug: 'fainting',
        title: 'Fainting / Unconsciousness',
        description: 'Using the recovery position.',
        icon: Wind,
        steps: [
            "If you feel faint, lie down or sit with your head between your knees.",
            "If someone else faints, position them on their back. If they are breathing, raise their legs above heart level.",
            "Check for breathing. If they aren't breathing, call for help (112) and start CPR.",
            "If they are unconscious but breathing, place them in the recovery position (on their side).",
            "Avoid letting the person get up too quickly after fainting."
        ],
        videoUrl: 'https://www.youtube.com/embed/G39f-b-5n3A'
    },
    {
        slug: 'severe-bleeding',
        title: 'Severe Bleeding',
        description: 'How to control bleeding with a cloth/bandage.',
        icon: Droplets,
        steps: [
            "Remove any obvious debris from the wound.",
            "Apply firm, direct pressure on the wound with a clean cloth or bandage.",
            "If blood soaks through, add more cloth on top.",
            "If possible, raise the injured limb above the level of the heart.",
            "Do not remove the original cloth and avoid using a tourniquet unless you are trained."
        ],
        videoUrl: 'https://www.youtube.com/embed/eYXQe24iV5s'
    },

    // Rural-Specific Cases
    {
        slug: 'pesticide-poisoning',
        title: 'Pesticide Poisoning',
        description: 'Immediate actions to take.',
        icon: AlertTriangle,
        steps: [
            "If the person is unconscious or has trouble breathing, call an ambulance (108 or 112) first.",
            "Remove the person from the area to get fresh air.",
            "Remove any contaminated clothing.",
            "Wash the skin and hair thoroughly with soap and water.",
            "If pesticide is in the eyes, flush with clean water for 15 minutes. Take the pesticide container to the doctor.",
            "Do not induce vomiting unless instructed by a medical professional."
        ],
        videoUrl: 'https://www.youtube.com/embed/J7x5sZ9x4oA'
    },
    {
        slug: 'drowning',
        title: 'Drowning Resuscitation',
        description: 'What to do for a near-drowning victim.',
        icon: Waves,
        steps: [
            "Get the person out of the water. Call for help (112).",
            "Check for breathing. Tilt their head back to open the airway.",
            "If they are not breathing, give 5 rescue breaths, then start CPR (30 chest compressions, 2 breaths).",
            "If they are breathing, place them in the recovery position (on their side).",
            "Keep them warm. All drowning victims should see a doctor.",
            "Do not assume the person is fine even if they seem to recover quickly."
        ],
        videoUrl: 'https://www.youtube.com/embed/z3p6K-y7s6k'
    },
    {
        slug: 'heat-stroke',
        title: 'Heat Stroke',
        description: 'Handling heat stroke for farmers in fields.',
        icon: Sun,
        steps: [
            "Move the person to a cooler place, preferably in the shade.",
            "Call for emergency medical assistance (112 or 108).",
            "Cool the person's entire body by sponging or spraying with cool water.",
            "Apply ice packs to the neck, groin, and armpits.",
            "Do not give the person sugary drinks or medication unless directed by a doctor."
        ],
        videoUrl: 'https://www.youtube.com/embed/gS-w8m_gS_Q'
    },
    {
        slug: 'hypothermia',
        title: 'Hypothermia / Cold Exposure',
        description: 'First aid for cold exposure in winters.',
        icon: Snowflake,
        steps: [
            "Move the person to a warm, dry place. Remove any wet clothing.",
            "Warm the center of the body first—chest, neck, head, and groin.",
            "Use an electric blanket, if available. Or use skin-to-skin contact under loose, dry layers of blankets.",
            "Give warm, non-alcoholic drinks.",
            "Avoid warming the person too quickly, such as with a hot bath, as this can cause heart problems."
        ],
        videoUrl: 'https://www.youtube.com/embed/ZzCqM-a_i2s'
    },
    {
        slug: 'food-poisoning',
        title: 'Food Poisoning',
        description: 'Managing stomach upsets at home.',
        icon: HelpCircle,
        steps:
        [
            "Let the stomach settle. Avoid eating and drinking for a few hours.",
            "Drink small sips of water or clear fluids (like ORS) to prevent dehydration.",
            "Gradually begin to eat bland, low-fat, easy-to-digest foods, such as soda crackers, toast, gelatin, bananas, and rice.",
            "Rest as much as possible.",
            "Avoid dairy, caffeine, alcohol, and fatty or highly seasoned foods until you feel better."
        ],
        videoUrl: 'https://www.youtube.com/embed/d3_a_m3m3jA'
    },
    {
        slug: 'delivery-emergency',
        title: 'Delivery Emergency',
        description: 'Handling until a midwife or doctor arrives.',
        icon: Baby,
        steps: [
            "Call for an ambulance or trained medical help (102 or 112) immediately.",
            "Help the mother find a comfortable position, often lying on her back with pillows.",
            "Wash your hands thoroughly with soap and water.",
            "Provide clean, dry towels or sheets to place under the mother.",
            "Encourage the mother to breathe and push with her contractions.",
            "Do not pull on the baby's head or the umbilical cord."
        ],
        videoUrl: 'https://www.youtube.com/embed/4yZ4t4a_g0E'
    }
];


export type FirstAidTopic = typeof firstAidCategories[0];
