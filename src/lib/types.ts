
export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  dataAiHint?: string;
  description?: string;
};

// Types for Agora
declare global {
  interface Window {
    agora_token_builder: any;
  }
}
