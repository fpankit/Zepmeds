
import { HeartPulse, Flame, Droplets, HelpCircle } from "lucide-react";

export const firstAidCategories = [
    {
        slug: 'heart-attack',
        title: 'Heart Attack',
        description: 'Learn the signs and what to do.',
        icon: HeartPulse,
        steps: [
            "Call for emergency medical help immediately.",
            "Help the person sit down, rest, and try to keep them calm.",
            "Loosen any tight clothing.",
            "Ask if the person takes any chest pain medicine, such as nitroglycerin, and help them take it.",
            "If the person is unconscious and not breathing, begin CPR."
        ],
        videoUrl: 'https://www.youtube.com/embed/Oa9aWdcHIeI' // Example Video
    },
    {
        slug: 'burns',
        title: 'Minor Burns',
        description: 'How to treat minor burns at home.',
        icon: Flame,
        steps: [
            "Cool the burn. Hold the burned area under cool (not cold) running water for about 10 minutes.",
            "Remove rings or other tight items from the burned area.",
            "Don't break blisters. Fluid-filled blisters protect against infection.",
            "Apply lotion. Once a burn is completely cooled, apply a lotion, such as one with aloe vera.",
            "Bandage the burn. Cover the burn with a sterile gauze bandage (not fluffy cotton)."
        ],
        videoUrl: 'https://www.youtube.com/embed/yjh9-k2aTf0'
    },
    {
        slug: 'bleeding',
        title: 'Severe Bleeding',
        description: 'Steps to control severe bleeding.',
        icon: Droplets,
        steps: [
            "Remove any obvious debris from the wound. Don't remove large or deeply embedded objects.",
            "Apply continuous pressure with a clean cloth or bandage for at least 20 minutes without looking.",
            "If the bleeding spurts or continues after continuous pressure, add more gauze or a pad on top of the existing one and keep pressing.",
            "If possible, raise the injured limb above the level of the heart.",
            "Help the injured person lie down, preferably on a rug or blanket to prevent loss of body heat."
        ],
        videoUrl: 'https://www.youtube.com/embed/eYXQe24iV5s'
    },
    {
        slug: 'snake-bite',
        title: 'Snake Bite',
        description: 'Immediate actions for a snake bite.',
        icon: HelpCircle,
        steps: [
            "Call for emergency medical help right away.",
            "Stay calm and still. Movement can cause the venom to travel more quickly through the body.",
            "Keep the bite below the level of the heart.",
            "Cover the bite with a loose, sterile bandage.",
            "Do not cut the wound or attempt to suck out the venom. Do not apply a tourniquet or ice."
        ],
        videoUrl: 'https://www.youtube.com/embed/I_2C4wTRH1g'
    }
];

export type FirstAidTopic = typeof firstAidCategories[0];
