import { count } from "console"
import { supabase } from "./supabase.ts"
import type { CreditCardData, DatabaseCreditCard } from "./types"

// Transform database record to frontend format
function transformDatabaseRecord(record: DatabaseCreditCard): CreditCardData {
  return {
    id: record.id,
    cardNumber: record.card_number,
    // maskedCardNumber: record.masked_card_number,
    // bin: record.bin,
    expiry_month: record.expiry_month,
    expiry_year: record.expiry_year,
    cvv: record.cvv,
    cardholderName: record.name,
    address: record.address_line1,
    phone: record.phone,
    city: record.city,
    state: record.state,
    zipCode: record.zipcode,
    email: record.email,
    country: record.country,
    lat: record.lat | null,
    lng: record.lng | null,
    // bank: record.bank,
    // latitude: record.latitude,
    // longitude: record.longitude,
    createdAt: record.created_at,
    // updatedAt: record.updated_at,
  }
}

// Fetch all credit cards
export async function fetchCreditCards(): Promise<CreditCardData[]> {
  try {
    const { data, error } = await supabase.from("card").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching credit card:", error)
      throw error
    }
    console.log(data)

    return data.map(transformDatabaseRecord)
  } catch (error) {
    console.error("Database error:", error)
    return []
  }
}

type Filters = {
  search?: string;
  country?: string;
  state?: string;
  banks?: string[];
  page: number;
  recordCount: number;
  sortField?: string;
  sortDirection?: string;
  cardIds?: number[];
};

export async function searchCards(
  searchTerm: string,
  recordCount: number,
  page: number
): Promise<{ data: CreditCardData[]; error: any }> {
  const { data, error } = await supabase
    .rpc('search_cards', {
      search_term: searchTerm,
      limit_count: recordCount * 10,
      offset_count: page,
    });
  return { data, error };
}

export async function fetchCreditCardsWithFilters(
  filters: Filters
): Promise<{ data: CreditCardData[]; count: number }> {
  try {
    let selectFields = '*';
    let orderField = filters.sortField;
    let orderAscending = filters.sortDirection === 'asc';

    if (filters.sortField === 'expiry_year') {
      orderField = 'expiry_date';
    } else if (filters.sortField === 'address_line1') {
      orderField = 'location';
    }

    let query = supabase.from('test_card').select(selectFields);

    if (filters.cardIds && filters.cardIds.length > 0) {
      query = query.in('id', filters.cardIds);
    }

    if (filters.recordCount) {
      query = query.limit(filters.recordCount);
    }
    if (filters.page) {
      query = query.range(
        filters.page,
        filters.page + (filters.recordCount || 25) - 1
      );
    }
    if (filters.sortField && orderField) {
      query = query.order(orderField, {
        ascending: orderAscending,
        nullsFirst: orderAscending,
      });
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    const { count } = await supabase
      .from('test_card')
      .select('*', { count: 'exact', head: true });
    if (error) {
      console.error('Error fetching filtered credit card:', error);
      throw error;
    }

    return {
      data: data ? data.map(transformDatabaseRecord) : [],
      count: count || 0,
    };
  } catch (error) {
    console.error('Database error:', error);
    return { data: [], count: 0 };
  }
}

export async function getFilteredCardsWithSearch(
  filters: Filters
): Promise<{ data: CreditCardData[]; count: number; error?: any }> {
  const { data: searchData, error: searchError } = await searchCards(
    filters.search || '',
    filters.recordCount,
    filters.page
  );
  console.log(searchData)

  if (searchError) {
    return { data: [], count: 0, error: searchError };
  }

  const cardIds = searchData ? searchData.map((card) => card.id) : [];
  const filtersWithIds = { ...filters, cardIds };

  return await fetchCreditCardsWithFilters(filtersWithIds);
}


// Get statistics
export async function getCreditCardStats(): Promise<{
  total: number
  expiringSoon: number
  expired: number
  bankCounts: Record<string, number>
}> {
  try {
    // Get total count
    const { count: total } = await supabase.from("card").select("*", { count: "exact", head: true })

    // Get all card to calculate stats
    const { data: allCards } = await supabase.from("card").select("*")
    if (!allCards) {
      return { total: 0, expiringSoon: 0, expired: 0, bankCounts: {} }
    }

    const now = new Date()
    const threeMonthsLater = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate())

    let expiringSoon = 0
    let expired = 0
    const bankCounts: Record<string, number> = {}

    allCards.forEach((card) => {
      // Calculate expiry stats
    //   const [month, year] = card.expiry.split("/")
      const month = card.expiry_month
      const year = card.expiry_year
      const expiryDate = new Date(Number.parseInt(`20${year}`), Number.parseInt(month) - 1, 1)

      if (expiryDate < now) {
        expired++
      } else if (expiryDate <= threeMonthsLater) {
        expiringSoon++
      }

      // Count banks
      const bank = card.bank || "Unknown Bank"
      bankCounts[bank] = (bankCounts[bank] || 0) + 1
    })

    return {
      total: total || 0,
      expiringSoon,
      expired,
      bankCounts,
    }
  } catch (error) {
    console.error("Error getting stats:", error)
    return { total: 0, expiringSoon: 0, expired: 0, bankCounts: {} }
  }
}
