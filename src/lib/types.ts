

import { GeneratePrescriptionSummaryOutput } from "./ai/flows/generate-prescription-summary";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  dataAiHint?: string;
  description?: string;
  isRx?: boolean;
};

export interface PrescriptionDetails {
    summary: GeneratePrescriptionSummaryOutput;
    dataUri: string;
}


export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    oldPrice?: number;
    discount?: string;
    rating: number;
    category: string;
    isRx?: boolean;
    image?: string; // Optional image field
    dataAiHint?: string;
}

// Types for Agora
declare global {
  interface Window {
    agora_token_builder: any;
  }
}

    