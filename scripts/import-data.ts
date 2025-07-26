import fs from 'fs';
import path from 'path';
import { db } from '../server/db';
import { creditCards } from '../shared/schema';

// Function to get bank name from BIN number (simplified lookup)
function getBankFromBIN(bin: string): string {
  const binMap: Record<string, string> = {
    '400022': 'Chase Bank',
    '400344': 'Bank of America', 
    '400898': 'Wells Fargo',
    '400899': 'Citibank',
    '401099': 'American Express',
    '401973': 'Discover',
    '402347': 'Capital One',
    '403163': 'US Bank',
    '403647': 'PNC Bank',
    '403690': 'TD Bank',
    '403766': 'SunTrust Bank',
    '403784': 'Regions Bank',
    '403905': 'Fifth Third Bank',
    '404601': 'BB&T',
    '405037': 'KeyBank',
    '406032': 'M&T Bank',
    '407166': 'Huntington Bank',
    '407993': 'Comerica Bank',
    '409451': 'Zions Bank',
    '410039': 'First Citizens Bank',
    '410793': 'Ally Bank',
    '412138': 'Union Bank',
    '412174': 'HSBC Bank',
    '412777': 'Citizens Bank',
    '413444': 'BMO Harris Bank',
    '414398': 'Synovus Bank',
    '414512': 'First National Bank',
    '414709': 'Associated Bank',
    '414718': 'Commerce Bank'
  };
  
  return binMap[bin] || 'Unknown Bank';
}

// Function to normalize state names
function normalizeState(state: string): string {
  const stateMap: Record<string, string> = {
    'Pennsylvania': 'PA',
    'California': 'CA',
    'Oregon': 'OR',
    'Georgia': 'GA',
    'Kansas': 'KS',
    'Ohio': 'OH',
    'Illinois': 'IL',
    'New Jersey': 'NJ',
    'Wisconsin': 'WI',
    'Colorado': 'CO',
    'Massachusetts': 'MA',
    'Rhode Island': 'RI',
    'Virginia': 'VA',
    'New York': 'NY',
    'Connecticut': 'CT',
    'Texas': 'TX',
    'Louisiana': 'LA',
    'Florida': 'FL',
    'Indiana': 'IN',
    'North Dakota': 'ND',
    'Alabama': 'AL',
    'Minnesota': 'MN',
    'Missouri': 'MO',
    'Nevada': 'NV',
    'Kentucky': 'KY',
    'Wyoming': 'WY',
    'Iowa': 'IA',
    'Arkansas': 'AR',
    'Washington': 'WA',
    'Utah': 'UT',
    'Michigan': 'MI',
    'Montana': 'MT',
    'Tennessee': 'TN',
    'Oklahoma': 'OK',
    'South Carolina': 'SC',
    'North Carolina': 'NC',
    'Arizona': 'AZ',
    'Delaware': 'DE',
    'Maryland': 'MD',
    'Vermont': 'VT',
    'New Hampshire': 'NH',
    'Maine': 'ME',
    'Hawaii': 'HI',
    'Alaska': 'AK',
    'West Virginia': 'WV',
    'Nebraska': 'NE',
    'Idaho': 'ID',
    'New Mexico': 'NM',
    'South Dakota': 'SD',
    'Mississippi': 'MS'
  };
  
  return stateMap[state] || state;
}

// Function to generate random coordinates for US states
function getStateCoordinates(state: string): { lat: number; lng: number } {
  const stateCoords: Record<string, { lat: number; lng: number }> = {
    'AL': { lat: 32.806671, lng: -86.791130 },
    'AK': { lat: 61.370716, lng: -152.404419 },
    'AZ': { lat: 33.729759, lng: -111.431221 },
    'AR': { lat: 34.969704, lng: -92.373123 },
    'CA': { lat: 36.116203, lng: -119.681564 },
    'CO': { lat: 39.059811, lng: -105.311104 },
    'CT': { lat: 41.767, lng: -72.677 },
    'DE': { lat: 39.161921, lng: -75.526755 },
    'FL': { lat: 27.4518, lng: -82.4501 },
    'GA': { lat: 33.76, lng: -84.39 },
    'HI': { lat: 21.30895, lng: -157.826182 },
    'ID': { lat: 44.240459, lng: -114.478828 },
    'IL': { lat: 40.349457, lng: -88.986137 },
    'IN': { lat: 39.790942, lng: -86.147685 },
    'IA': { lat: 42.590, lng: -93.620 },
    'KS': { lat: 38.5266, lng: -96.726486 },
    'KY': { lat: 37.669, lng: -84.670 },
    'LA': { lat: 31.1801, lng: -91.8749 },
    'ME': { lat: 44.323535, lng: -69.765261 },
    'MD': { lat: 39.063946, lng: -76.802101 },
    'MA': { lat: 42.230171, lng: -71.530106 },
    'MI': { lat: 43.326618, lng: -84.536095 },
    'MN': { lat: 45.7326, lng: -93.9196 },
    'MS': { lat: 32.776, lng: -89.6678 },
    'MO': { lat: 38.572954, lng: -92.189283 },
    'MT': { lat: 47.052, lng: -109.633 },
    'NE': { lat: 41.12537, lng: -98.268082 },
    'NV': { lat: 39.161921, lng: -117.1728 },
    'NH': { lat: 43.452492, lng: -71.563896 },
    'NJ': { lat: 40.314, lng: -74.756138 },
    'NM': { lat: 34.840515, lng: -106.248482 },
    'NY': { lat: 42.659829, lng: -75.615 },
    'NC': { lat: 35.771, lng: -78.638 },
    'ND': { lat: 47.617, lng: -101.002 },
    'OH': { lat: 40.367474, lng: -82.996216 },
    'OK': { lat: 35.482309, lng: -97.534994 },
    'OR': { lat: 44.931109, lng: -123.029159 },
    'PA': { lat: 40.269789, lng: -76.875613 },
    'RI': { lat: 41.82355, lng: -71.422132 },
    'SC': { lat: 33.76, lng: -80.771 },
    'SD': { lat: 44.367966, lng: -99.901813 },
    'TN': { lat: 35.771, lng: -86.25 },
    'TX': { lat: 31.106, lng: -97.6475 },
    'UT': { lat: 39.161921, lng: -111.892622 },
    'VT': { lat: 44.26639, lng: -72.580536 },
    'VA': { lat: 37.54, lng: -78.64 },
    'WA': { lat: 47.042418, lng: -122.893077 },
    'WV': { lat: 38.349497, lng: -81.633294 },
    'WI': { lat: 44.25, lng: -89.5 },
    'WY': { lat: 42.755, lng: -107.302 }
  };
  
  const baseCoords = stateCoords[state] || { lat: 39.8283, lng: -98.5795 }; // Center of US
  
  // Add small random offset for variety
  return {
    lat: baseCoords.lat + (Math.random() - 0.5) * 2,
    lng: baseCoords.lng + (Math.random() - 0.5) * 2
  };
}

async function importCreditCardData() {
  try {
    console.log('Starting credit card data import...');
    
    const filePath = path.join(process.cwd(), 'attached_assets', 'Pasted-4000222283592972-04-25-755-Rahoul-Brown-707-Foxtail-Drive-4432059366-Cambridge-MD-21613-brownrahoul-1753514926858_1753514926860.txt');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.trim().split('\n');
    
    console.log(`Found ${lines.length} records to import`);
    
    // Clear existing data
    await db.delete(creditCards);
    console.log('Cleared existing data');
    
    const records = [];
    
    for (const line of lines) {
      const parts = line.split('|');
      if (parts.length >= 11) {
        const [cardNumber, expiryDate, cvv, holderName, address, phone, city, state, zipCode, email, country] = parts;
        
        const binNumber = cardNumber.substring(0, 6);
        const bankName = getBankFromBIN(binNumber);
        const normalizedState = normalizeState(state.trim());
        const coords = getStateCoordinates(normalizedState);
        
        records.push({
          cardNumber: cardNumber.trim(),
          expiryDate: expiryDate.trim(),
          cvv: cvv.trim(),
          holderName: holderName.trim(),
          address: address.trim(),
          phone: phone.trim(),
          city: city.trim(),
          state: normalizedState,
          zipCode: zipCode.trim(),
          email: email.trim(),
          country: country.trim() || 'US',
          latitude: coords.lat.toString(),
          longitude: coords.lng.toString(),
          bankName: bankName,
          binNumber: binNumber
        });
      }
    }
    
    console.log(`Prepared ${records.length} records for insertion`);
    
    // Insert records in batches of 100
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await db.insert(creditCards).values(batch);
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(records.length / batchSize)}`);
    }
    
    console.log(`Successfully imported ${records.length} credit card records!`);
    
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
}

importCreditCardData().then(() => {
  console.log('Import completed');
  process.exit(0);
});