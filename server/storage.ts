import { type CreditCard, type InsertCreditCard, type CreditCardFilters, type CreditCardStats, creditCards } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, ilike, and, gte, lte, inArray, sql, count, desc } from "drizzle-orm";

// Mock data for demonstration - in production this would connect to a real database
const mockCreditCards: CreditCard[] = [
  {
    id: randomUUID(),
    cardNumber: "4000222283592972",
    expiryDate: "04/25",
    cvv: "755",
    holderName: "Rahoul Brown",
    address: "707 Foxtail Drive",
    phone: "4432059366",
    city: "Cambridge",
    state: "MD",
    zipCode: "21613",
    email: "brownrahoul@yahoo.com",
    country: "US",
    latitude: "39.2904",
    longitude: "-76.6122",
    bankName: "Chase Bank",
    binNumber: "400022",
  },
  {
    id: randomUUID(),
    cardNumber: "4000222588496689",
    expiryDate: "07/26",
    cvv: "823",
    holderName: "Zion Gordon",
    address: "5807 Winkie Ln",
    phone: "+1 843 259 5401",
    city: "Ravenel",
    state: "SC",
    zipCode: "29470",
    email: "Ziongordon4944@gmail.com",
    country: "US",
    latitude: "32.7767",
    longitude: "-80.0866",
    bankName: "Bank of America",
    binNumber: "400022",
  },
  {
    id: randomUUID(),
    cardNumber: "4000222769987878",
    expiryDate: "03/27",
    cvv: "520",
    holderName: "Betty Williams",
    address: "1435 Holbrook St Ne Apt 4",
    phone: "(202) 549-6009",
    city: "Washington",
    state: "DC",
    zipCode: "20002",
    email: "slickysexyboo7@yahoo.com",
    country: "US",
    latitude: "38.9072",
    longitude: "-77.0369",
    bankName: "Wells Fargo",
    binNumber: "400022",
  },
  {
    id: randomUUID(),
    cardNumber: "4003447779318049",
    expiryDate: "04/26",
    cvv: "154",
    holderName: "Molly Sullivan",
    address: "315 E. High Dr.",
    phone: "2066177665",
    city: "Spokane",
    state: "WA",
    zipCode: "99203",
    email: "mollysully@msn.com",
    country: "US",
    latitude: "47.6587",
    longitude: "-117.4260",
    bankName: "Citibank",
    binNumber: "400344",
  },
  {
    id: randomUUID(),
    cardNumber: "4003447780177046",
    expiryDate: "09/27",
    cvv: "719",
    holderName: "Jacqueline Mack",
    address: "140 Forrest Way",
    phone: "13154719607",
    city: "Camillus",
    state: "NY",
    zipCode: "13031-1314",
    email: "jacqueline.mack1@gmail.com",
    country: "US",
    latitude: "43.0481",
    longitude: "-76.1474",
    bankName: "American Express",
    binNumber: "400344",
  },
];

export interface IStorage {
  getCreditCards(filters: CreditCardFilters): Promise<{ cards: CreditCard[]; total: number }>;
  getCreditCard(id: string): Promise<CreditCard | undefined>;
  createCreditCard(card: InsertCreditCard): Promise<CreditCard>;
  getCreditCardStats(): Promise<CreditCardStats>;
  getMapData(): Promise<Array<{ lat: number; lng: number; count: number }>>;
  getBankList(): Promise<string[]>;
  getStateList(): Promise<Array<{ state: string; count: number }>>;
  exportCreditCards(filters: CreditCardFilters): Promise<CreditCard[]>;
}

export class MemStorage implements IStorage {
  private creditCards: Map<string, CreditCard>;

  constructor() {
    this.creditCards = new Map();
    
    // Initialize with mock data
    mockCreditCards.forEach(card => {
      this.creditCards.set(card.id, card);
    });
  }

  async getCreditCards(filters: CreditCardFilters): Promise<{ cards: CreditCard[]; total: number }> {
    let cards = Array.from(this.creditCards.values());

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      cards = cards.filter(card => 
        card.holderName.toLowerCase().includes(searchLower) ||
        card.cardNumber.includes(searchLower) ||
        card.city.toLowerCase().includes(searchLower) ||
        card.email.toLowerCase().includes(searchLower) ||
        card.bankName?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.state) {
      cards = cards.filter(card => card.state === filters.state);
    }

    if (filters.city) {
      cards = cards.filter(card => card.city.toLowerCase().includes(filters.city!.toLowerCase()));
    }

    if (filters.country) {
      cards = cards.filter(card => card.country === filters.country);
    }

    if (filters.banks && filters.banks.length > 0) {
      cards = cards.filter(card => filters.banks!.includes(card.bankName || ''));
    }

    if (filters.expiryFrom || filters.expiryTo) {
      cards = cards.filter(card => {
        const [month, year] = card.expiryDate.split('/');
        const cardExpiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
        const fromDate = filters.expiryFrom ? new Date(filters.expiryFrom) : new Date(0);
        const toDate = filters.expiryTo ? new Date(filters.expiryTo) : new Date('2099-12-31');
        return cardExpiry >= fromDate && cardExpiry <= toDate;
      });
    }

    const total = cards.length;

    // Apply sorting
    if (filters.sortBy) {
      cards.sort((a, b) => {
        const aVal = a[filters.sortBy!];
        const bVal = b[filters.sortBy!];
        const order = filters.sortOrder === 'desc' ? -1 : 1;
        return aVal && bVal ? (aVal < bVal ? -order : order) : 0;
      });
    }

    // Apply pagination
    const offset = (filters.page - 1) * filters.limit;
    cards = cards.slice(offset, offset + filters.limit);

    return { cards, total };
  }

  async getCreditCard(id: string): Promise<CreditCard | undefined> {
    return this.creditCards.get(id);
  }

  async createCreditCard(insertCard: InsertCreditCard): Promise<CreditCard> {
    const id = randomUUID();
    const card: CreditCard = { 
      ...insertCard, 
      id,
      country: insertCard.country || 'US',
      latitude: null,
      longitude: null,
      bankName: null,
    };
    this.creditCards.set(id, card);
    return card;
  }

  async getCreditCardStats(): Promise<CreditCardStats> {
    const cards = Array.from(this.creditCards.values());
    const totalRecords = cards.length;

    // Bank distribution
    const bankCounts = new Map<string, number>();
    cards.forEach(card => {
      if (card.bankName) {
        bankCounts.set(card.bankName, (bankCounts.get(card.bankName) || 0) + 1);
      }
    });
    const bankDistribution = Array.from(bankCounts.entries())
      .map(([bankName, count]) => ({ bankName, count }))
      .sort((a, b) => b.count - a.count);

    // State distribution
    const stateCounts = new Map<string, number>();
    cards.forEach(card => {
      stateCounts.set(card.state, (stateCounts.get(card.state) || 0) + 1);
    });
    const stateDistribution = Array.from(stateCounts.entries())
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count);

    // Expiring cards (within 6 months)
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    const expiringCards = cards.filter(card => {
      const [month, year] = card.expiryDate.split('/');
      const cardExpiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      return cardExpiry <= sixMonthsFromNow;
    }).length;

    return {
      totalRecords,
      bankDistribution,
      stateDistribution,
      expiringCards,
    };
  }

  async getMapData(): Promise<Array<{ lat: number; lng: number; count: number }>> {
    const cards = Array.from(this.creditCards.values());
    const locationCounts = new Map<string, { lat: number; lng: number; count: number }>();

    cards.forEach(card => {
      if (card.latitude && card.longitude) {
        const key = `${card.latitude},${card.longitude}`;
        const existing = locationCounts.get(key);
        if (existing) {
          existing.count++;
        } else {
          locationCounts.set(key, {
            lat: parseFloat(card.latitude),
            lng: parseFloat(card.longitude),
            count: 1,
          });
        }
      }
    });

    return Array.from(locationCounts.values());
  }

  async getBankList(): Promise<string[]> {
    const banks = new Set<string>();
    Array.from(this.creditCards.values()).forEach(card => {
      if (card.bankName) {
        banks.add(card.bankName);
      }
    });
    return Array.from(banks).sort();
  }

  async getStateList(): Promise<Array<{ state: string; count: number }>> {
    const stateCounts = new Map<string, number>();
    Array.from(this.creditCards.values()).forEach(card => {
      stateCounts.set(card.state, (stateCounts.get(card.state) || 0) + 1);
    });
    
    return Array.from(stateCounts.entries())
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count);
  }

  async exportCreditCards(filters: CreditCardFilters): Promise<CreditCard[]> {
    const { cards } = await this.getCreditCards({ ...filters, page: 1, limit: 1000000 });
    return cards;
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  async getCreditCards(filters: CreditCardFilters): Promise<{ cards: CreditCard[]; total: number }> {
    const conditions = [];

    // Apply filters
    if (filters.search) {
      const searchLower = `%${filters.search.toLowerCase()}%`;
      conditions.push(
        sql`(
          LOWER(${creditCards.holderName}) LIKE ${searchLower} OR
          ${creditCards.cardNumber} LIKE ${searchLower} OR
          LOWER(${creditCards.city}) LIKE ${searchLower} OR
          LOWER(${creditCards.email}) LIKE ${searchLower} OR
          LOWER(${creditCards.bankName}) LIKE ${searchLower}
        )`
      );
    }

    if (filters.state) {
      conditions.push(eq(creditCards.state, filters.state));
    }

    if (filters.city) {
      conditions.push(ilike(creditCards.city, `%${filters.city}%`));
    }

    if (filters.country) {
      conditions.push(eq(creditCards.country, filters.country));
    }

    if (filters.banks && filters.banks.length > 0) {
      conditions.push(inArray(creditCards.bankName, filters.banks));
    }

    if (filters.expiryFrom || filters.expiryTo) {
      if (filters.expiryFrom) {
        const fromDate = new Date(filters.expiryFrom);
        conditions.push(gte(sql`TO_DATE('20' || SPLIT_PART(${creditCards.expiryDate}, '/', 2) || '-' || SPLIT_PART(${creditCards.expiryDate}, '/', 1) || '-01', 'YYYY-MM-DD')`, fromDate));
      }
      if (filters.expiryTo) {
        const toDate = new Date(filters.expiryTo);
        conditions.push(lte(sql`TO_DATE('20' || SPLIT_PART(${creditCards.expiryDate}, '/', 2) || '-' || SPLIT_PART(${creditCards.expiryDate}, '/', 1) || '-01', 'YYYY-MM-DD')`, toDate));
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(creditCards)
      .where(whereClause);
    
    const total = totalResult[0]?.count || 0;

    // Build order by clause
    let orderByClause;
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'holderName':
          orderByClause = filters.sortOrder === 'desc' ? desc(creditCards.holderName) : creditCards.holderName;
          break;
        case 'city':
          orderByClause = filters.sortOrder === 'desc' ? desc(creditCards.city) : creditCards.city;
          break;
        case 'state':
          orderByClause = filters.sortOrder === 'desc' ? desc(creditCards.state) : creditCards.state;
          break;
        case 'expiryDate':
          orderByClause = filters.sortOrder === 'desc' ? desc(creditCards.expiryDate) : creditCards.expiryDate;
          break;
        case 'bankName':
          orderByClause = filters.sortOrder === 'desc' ? desc(creditCards.bankName) : creditCards.bankName;
          break;
        default:
          orderByClause = creditCards.holderName;
      }
    } else {
      orderByClause = creditCards.holderName;
    }

    // Get paginated results
    const cards = await db
      .select()
      .from(creditCards)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit);

    return { cards, total };
  }

  async getCreditCard(id: string): Promise<CreditCard | undefined> {
    const result = await db
      .select()
      .from(creditCards)
      .where(eq(creditCards.id, id))
      .limit(1);
    
    return result[0] || undefined;
  }

  async createCreditCard(insertCard: InsertCreditCard): Promise<CreditCard> {
    const result = await db
      .insert(creditCards)
      .values({
        ...insertCard,
        country: insertCard.country || 'US',
      })
      .returning();
    
    return result[0];
  }

  async getCreditCardStats(): Promise<CreditCardStats> {
    // Get total records
    const totalResult = await db
      .select({ count: count() })
      .from(creditCards);
    const totalRecords = totalResult[0]?.count || 0;

    // Get bank distribution
    const bankDistributionResult = await db
      .select({
        bankName: creditCards.bankName,
        count: count()
      })
      .from(creditCards)
      .where(sql`${creditCards.bankName} IS NOT NULL`)
      .groupBy(creditCards.bankName)
      .orderBy(desc(count()));

    const bankDistribution = bankDistributionResult.map(row => ({
      bankName: row.bankName || 'Unknown',
      count: Number(row.count)
    }));

    // Get state distribution
    const stateDistributionResult = await db
      .select({
        state: creditCards.state,
        count: count()
      })
      .from(creditCards)
      .groupBy(creditCards.state)
      .orderBy(desc(count()));

    const stateDistribution = stateDistributionResult.map(row => ({
      state: row.state,
      count: Number(row.count)
    }));

    // Get expiring cards (within 6 months)
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    
    const expiringResult = await db
      .select({ count: count() })
      .from(creditCards)
      .where(
        lte(
          sql`TO_DATE('20' || SPLIT_PART(${creditCards.expiryDate}, '/', 2) || '-' || SPLIT_PART(${creditCards.expiryDate}, '/', 1) || '-01', 'YYYY-MM-DD')`,
          sixMonthsFromNow
        )
      );

    const expiringCards = Number(expiringResult[0]?.count || 0);

    return {
      totalRecords,
      bankDistribution,
      stateDistribution,
      expiringCards,
    };
  }

  async getMapData(): Promise<Array<{ lat: number; lng: number; count: number }>> {
    const result = await db
      .select({
        latitude: creditCards.latitude,
        longitude: creditCards.longitude,
        count: count()
      })
      .from(creditCards)
      .where(
        and(
          sql`${creditCards.latitude} IS NOT NULL`,
          sql`${creditCards.longitude} IS NOT NULL`
        )
      )
      .groupBy(creditCards.latitude, creditCards.longitude);

    return result.map(row => ({
      lat: parseFloat(row.latitude || '0'),
      lng: parseFloat(row.longitude || '0'),
      count: Number(row.count)
    }));
  }

  async getBankList(): Promise<string[]> {
    const result = await db
      .selectDistinct({ bankName: creditCards.bankName })
      .from(creditCards)
      .where(sql`${creditCards.bankName} IS NOT NULL`)
      .orderBy(creditCards.bankName);

    return result.map(row => row.bankName || '').filter(Boolean);
  }

  async getStateList(): Promise<Array<{ state: string; count: number }>> {
    const result = await db
      .select({
        state: creditCards.state,
        count: count()
      })
      .from(creditCards)
      .groupBy(creditCards.state)
      .orderBy(desc(count()));

    return result.map(row => ({
      state: row.state,
      count: Number(row.count)
    }));
  }

  async exportCreditCards(filters: CreditCardFilters): Promise<CreditCard[]> {
    const { cards } = await this.getCreditCards({ ...filters, page: 1, limit: 1000000 });
    return cards;
  }
}

export const storage = new DatabaseStorage();
