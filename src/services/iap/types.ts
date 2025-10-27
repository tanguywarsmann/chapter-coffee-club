// Types temporaires pour @capacitor-community/in-app-purchases
// Le package devra être installé manuellement

export interface IAPProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  priceMicros: number;
  currency: string;
  type: 'consumable' | 'non-consumable' | 'subscription';
}

export interface IAPPurchase {
  productId: string;
  transactionId: string;
  receipt: string;
  state: 'purchasing' | 'purchased' | 'approved' | 'verified' | 'finished' | 'failed' | 'cancelled';
  transactionDate: string;
}

export interface InAppPurchasesPlugin {
  connect(): Promise<{ value: boolean }>;
  register(options: { products: Array<{ id: string; type: string }> }): Promise<void>;
  getProducts(options: { productIds: string[] }): Promise<{ products: IAPProduct[] }>;
  purchase(options: { productId: string }): Promise<{ value: any }>;
  restorePurchases(): Promise<{ value: IAPPurchase[] }>;
  finish(options: { transactionId: string }): Promise<void>;
  addListener(event: 'purchaseUpdated', callback: (purchase: IAPPurchase) => void): void;
}

// Stub pour que ça compile sans le package
export const InAppPurchases: InAppPurchasesPlugin = {
  connect: async () => ({ value: false }),
  register: async () => {},
  getProducts: async () => ({ products: [] }),
  purchase: async () => ({ value: null }),
  restorePurchases: async () => ({ value: [] }),
  finish: async () => {},
  addListener: () => {}
};
