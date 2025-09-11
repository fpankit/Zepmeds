

import { GeneratePrescriptionSummaryOutput } from "./ai/flows/generate-prescription-summary";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
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
    price: number;
    category: string;
    imageUrl?: string;
    uses?: string;
    stock?: number;
    isRx?: boolean;
    dataAiHint?: string;
    // Fields from verification that might not be on all products
    batch_no?: string;
    expiry_date?: string; 
    manufacturer?: string;
}
