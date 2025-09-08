

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  dataAiHint?: string;
  description?: string;
};

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    oldPrice?: number;
    discount?: string;
    rating: number;
    category: string;
    image?: string; // Optional image field
    dataAiHint?: string;
}

// Types for Agora
declare global {
  interface Window {
    agora_token_builder: any;
  }
}

    