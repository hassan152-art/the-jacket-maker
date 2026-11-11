export interface BespokeConfig {
  silhouette: string;
  leatherType: string;
  hardware: string;
  lining: string;
  monogram?: string;
  isCustomSize?: boolean;
}

export const SILHOUETTE_PRICES: Record<string, number> = {
  'Cafe Racer': 54900,
  'Double Rider Biker': 59900,
  'Aviator Shearling': 79900,
  'Long Trench': 74900,
  'Varsity Bomber': 44900,
  'Tailored Blazer': 56900,
};

export const LEATHER_SURCHARGES: Record<string, number> = {
  'Full Grain Sheepskin': 0,
  'Hand-Distressed Cowhide': 4500,
  'Italian Velvet Goatskin Suede': 3000,
  'Merino Wool Shearling': 12000,
  'Featherweight Plonge Lambskin': 6000,
};

export const HARDWARE_SURCHARGES: Record<string, number> = {
  'Antiqued Brass': 0,
  'Polished Silver': 0,
  'Matte Gunmetal': 1500,
  'Black Oxide YKK': 2000,
};

export const LINING_SURCHARGES: Record<string, number> = {
  'Quilted Thermal Silk-Satin': 0,
  'Silky Crimson Satin': 1500,
  'Heritage Tartan Cotton Twill': 2500,
  'Genuine Merino Shearling Wool': 9500,
};

export const CURRENCY_RATES: Record<string, { symbol: string; rate: number; prefix: boolean }> = {
  PKR: { symbol: 'Rs. ', rate: 1, prefix: true },
  USD: { symbol: '$', rate: 0.0036, prefix: true },
  GBP: { symbol: '£', rate: 0.0028, prefix: true },
  EUR: { symbol: '€', rate: 0.0033, prefix: true },
  AED: { symbol: 'AED ', rate: 0.0132, prefix: true },
};

/**
 * Calculates the total bespoke atelier price in PKR
 */
export function calculateBespokePrice(config: BespokeConfig): number {
  const base = SILHOUETTE_PRICES[config.silhouette] || 54900;
  const leather = LEATHER_SURCHARGES[config.leatherType] || 0;
  const hardware = HARDWARE_SURCHARGES[config.hardware] || 0;
  const lining = LINING_SURCHARGES[config.lining] || 0;
  const monogramCost = config.monogram && config.monogram.trim().length > 0 ? 2500 : 0;
  return base + leather + hardware + lining + monogramCost;
}

/**
 * Converts price in PKR to target currency
 */
export function convertAndFormatPrice(amountPKR: number, currency: string = 'PKR'): string {
  const meta = CURRENCY_RATES[currency] || CURRENCY_RATES.PKR;
  const converted = Math.round(amountPKR * meta.rate);
  return `${meta.symbol}${converted.toLocaleString()}`;
}

/**
 * Calculates cart subtotal, discount, and grand total
 */
export function calculateCartSummary(
  items: Array<{ pricePKR: number; quantity: number }>,
  promoCode?: string
): { subtotal: number; discount: number; total: number; discountPercent: number } {
  const subtotal = items.reduce((acc, item) => acc + (item.pricePKR * (item.quantity || 1)), 0);
  let discountPercent = 0;

  if (promoCode) {
    const code = promoCode.trim().toUpperCase();
    if (code === 'JACKET10') discountPercent = 10;
    else if (code === 'BESPOKE15') discountPercent = 15;
    else if (code === 'ATELIER20') discountPercent = 20;
  }

  const discount = Math.round((subtotal * discountPercent) / 100);
  const total = Math.max(0, subtotal - discount);

  return { subtotal, discount, total, discountPercent };
}

/**
 * Admin role verification helper
 */
export function isAtelierAdmin(user: { role?: string; email?: string } | null | undefined): boolean {
  if (!user) return false;
  return user.role === 'admin' || user.email?.toLowerCase() === 'admin@thejacketmaker.pk';
}
