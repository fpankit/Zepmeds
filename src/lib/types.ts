

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
    summary: any; // Allow any for now to avoid breaking changes
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
    manufacturer?: string;
    saltComposition?: string;
    keyInfo?: string;
    directions?: string;
    // Fields from verification that might not be on all products
    batch_no?: string;
    expiry_date?: string; 
}
