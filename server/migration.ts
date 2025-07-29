import { db } from "./db";
import { creditCards } from "@shared/schema";
import { randomUUID } from "crypto";

interface ParsedCreditCard {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  holderName: string;
  address?: string;
  phone?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  email?: string;
  country?: string;
  latitude?: string;
  longitude?: string;
  bankName?: string;
  binNumber?: string;
}

// Parse different formats of credit card data
export function parseCreditCardLine(line: string): ParsedCreditCard | null {
  if (!line.trim()) return null;
  
  const parts = line.split('|');
  
  // Format 1: Standard format with US data
  // 4000222283592972|04/25|755|Rahoul  Brown|707 Foxtail Drive|4432059366|Cambridge|MD|21613|brownrahoul@yahoo.com|US
  if (parts.length === 11) {
    const binNumber = parts[0].substring(0, 6);
    return {
      cardNumber: parts[0].trim(),
      expiryDate: parts[1].trim(),
      cvv: parts[2].trim(),
      holderName: parts[3].trim(),
      address: parts[4].trim(),
      phone: parts[5].trim(),
      city: parts[6].trim(),
      state: parts[7].trim(),
      zipCode: parts[8].trim(),
      email: parts[9].trim(),
      country: parts[10].trim(),
      binNumber: binNumber,
      bankName: 'Unknown Bank' // Will be resolved by BIN lookup
    };
  }
  
  // Format 2: International format with IP/User-Agent
  // 4367730071272919|04/25|332|Annette Garrod|14 Kanawa Street|Waikanae|NZ|5036|United States|0212615516|amgarrod@gmail.com|2407:7000:9ba4:2b00:79ba:cb88:145a:8d46
  if (parts.length === 12) {
    const binNumber = parts[0].substring(0, 6);
    return {
      cardNumber: parts[0].trim(),
      expiryDate: parts[1].trim(),
      cvv: parts[2].trim(),
      holderName: parts[3].trim(),
      address: parts[4].trim(),
      city: parts[5].trim(),
      country: parts[6].trim(),
      zipCode: parts[7].trim(),
      state: parts[8].trim() || 'Unknown',
      phone: parts[9].trim(),
      email: parts[10].trim(),
      binNumber: binNumber,
      bankName: 'Unknown Bank'
    };
  }
  
  // Format 3: Minimal format with browser info
  // 4147635808816903|11/25|429|Huangailing||||TW||kc.chen915@gmail.com|42.73.219.51|Mozilla/...
  if (parts.length >= 10) {
    const binNumber = parts[0].substring(0, 6);
    return {
      cardNumber: parts[0].trim(),
      expiryDate: parts[1].trim(),
      cvv: parts[2].trim(),
      holderName: parts[3].trim(),
      address: parts[4].trim() || undefined,
      city: parts[5].trim() || undefined,
      state: parts[6].trim() || undefined,
      country: parts[7].trim() || 'Unknown',
      zipCode: parts[8].trim() || undefined,
      email: parts[9].trim(),
      binNumber: binNumber,
      bankName: 'Unknown Bank'
    };
  }
  
  // Format 4: Standard US format without country
  // 4640182117050207|11/27|887|Kimberly Bovick|3517 South 107th Street|Omaha|NE|68124|United States|4023017059|kimkst@aol.com
  if (parts.length === 11 && !parts[10].includes('@')) {
    const binNumber = parts[0].substring(0, 6);
    return {
      cardNumber: parts[0].trim(),
      expiryDate: parts[1].trim(),
      cvv: parts[2].trim(),
      holderName: parts[3].trim(),
      address: parts[4].trim(),
      city: parts[5].trim(),
      state: parts[6].trim(),
      zipCode: parts[7].trim(),
      country: parts[8].trim(),
      phone: parts[9].trim(),
      email: parts[10].trim(),
      binNumber: binNumber,
      bankName: 'Unknown Bank'
    };
  }
  
  return null;
}

// Generate mock coordinates for demo purposes
function generateCoordinates(country: string, state?: string, city?: string): { latitude: string; longitude: string } {
  // Basic coordinate mapping for common countries/states
  const coordinates: Record<string, { lat: number; lng: number }> = {
    'US': { lat: 39.8283, lng: -98.5795 },
    'BR': { lat: -14.2350, lng: -51.9253 },
    'CA': { lat: 56.1304, lng: -106.3468 },
    'MX': { lat: 23.6345, lng: -102.5528 },
    'NZ': { lat: -40.9006, lng: 174.8860 },
    'TW': { lat: 23.6978, lng: 120.9605 },
    'GB': { lat: 55.3781, lng: -3.4360 }
  };

  const baseCoord = coordinates[country] || coordinates['US'];
  
  // Add some random variation to avoid exact duplicates
  const lat = baseCoord.lat + (Math.random() - 0.5) * 10;
  const lng = baseCoord.lng + (Math.random() - 0.5) * 10;
  
  return {
    latitude: lat.toFixed(6),
    longitude: lng.toFixed(6)
  };
}

export async function importCreditCardsFromText(textData: string): Promise<{ imported: number; errors: string[] }> {
  const lines = textData.split('\n').filter(line => line.trim());
  const errors: string[] = [];
  let imported = 0;
  
  for (const [index, line] of lines.entries()) {
    try {
      const parsed = parseCreditCardLine(line);
      if (!parsed) {
        errors.push(`Line ${index + 1}: Could not parse format`);
        continue;
      }
      
      // Generate coordinates if not provided
      const coords = generateCoordinates(parsed.country || 'US', parsed.state, parsed.city);
      
      const creditCard = {
        id: randomUUID(),
        cardNumber: parsed.cardNumber,
        expiryDate: parsed.expiryDate,
        cvv: parsed.cvv,
        holderName: parsed.holderName,
        address: parsed.address || '',
        phone: parsed.phone || '',
        city: parsed.city || '',
        state: parsed.state || '',
        zipCode: parsed.zipCode || '',
        email: parsed.email || '',
        country: parsed.country || 'US',
        latitude: coords.latitude,
        longitude: coords.longitude,
        bankName: parsed.bankName || 'Unknown Bank',
        binNumber: parsed.binNumber || parsed.cardNumber.substring(0, 6)
      };
      
      await db.insert(creditCards).values(creditCard);
      imported++;
      
    } catch (error) {
      errors.push(`Line ${index + 1}: Database error - ${error}`);
    }
  }
  
  return { imported, errors };
}