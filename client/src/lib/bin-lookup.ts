// BIN (Bank Identification Number) lookup utilities
export interface BinLookupResult {
  bank: string;
  logo?: string;
  type?: string;
  brand?: string;
  country?: string;
}

// Mock BIN database - in production this would call a real BIN API
const binDatabase: Record<string, BinLookupResult> = {
  "400022": { 
    bank: "Chase Bank", 
    logo: "https://logos-world.net/wp-content/uploads/2021/03/Chase-Logo.png",
    type: "debit",
    brand: "visa",
    country: "US"
  },
  "400344": { 
    bank: "Citibank", 
    logo: "https://logos-world.net/wp-content/uploads/2020/08/Citibank-Logo.png",
    type: "credit",
    brand: "visa",
    country: "US"
  },
  "411111": { 
    bank: "Bank of America", 
    logo: "https://logos-world.net/wp-content/uploads/2020/04/Bank-of-America-Logo.png",
    type: "credit",
    brand: "visa",
    country: "US"
  },
  "424242": { 
    bank: "Wells Fargo", 
    logo: "https://logos-world.net/wp-content/uploads/2020/03/Wells-Fargo-Logo.png",
    type: "credit",
    brand: "visa",
    country: "US"
  },
  "374245": { 
    bank: "American Express", 
    logo: "https://logos-world.net/wp-content/uploads/2020/04/American-Express-Logo.png",
    type: "credit",
    brand: "amex",
    country: "US"
  },
};

export async function lookupBin(bin: string): Promise<BinLookupResult | null> {
  if (bin.length !== 6) {
    throw new Error('BIN must be 6 digits');
  }

  // In production, this would make an API call to a BIN lookup service
  // such as binlist.net, binbase.com, or a commercial service
  const result = binDatabase[bin];
  
  if (result) {
    return result;
  }

  // Fallback for unknown BINs
  return {
    bank: "Unknown Bank",
    type: "unknown",
    brand: "unknown",
    country: "US"
  };
}

export function extractBin(cardNumber: string): string {
  return cardNumber.substring(0, 6);
}

export function getBrandFromBin(bin: string): string {
  const firstDigit = bin.charAt(0);
  
  switch (firstDigit) {
    case '4':
      return 'visa';
    case '5':
      return 'mastercard';
    case '3':
      if (bin.startsWith('34') || bin.startsWith('37')) {
        return 'amex';
      }
      return 'diners';
    case '6':
      return 'discover';
    default:
      return 'unknown';
  }
}
