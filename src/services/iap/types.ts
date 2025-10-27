// Types pour RevenueCat Capacitor SDK
// Documentation: https://www.revenuecat.com/docs/getting-started/installation/capacitor

export interface RevenueCatProduct {
  identifier: string;
  description: string;
  title: string;
  price: number;
  priceString: string;
  currencyCode: string;
}

export interface RevenueCatPackage {
  identifier: string;
  packageType: string;
  product: RevenueCatProduct;
  offeringIdentifier: string;
}
