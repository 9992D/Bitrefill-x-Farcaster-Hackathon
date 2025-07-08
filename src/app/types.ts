export type BitrefillPackage = {
  id: string;
  value: number;
  price: number; // in satoshis (BTC × 10^8)
};

export type BitrefillProduct = {
  id: string;
  name: string;
  packages: BitrefillPackage[];
};
