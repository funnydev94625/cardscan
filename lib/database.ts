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

export async function searchCards(searchTerm: string, recordCount: number, page: number) {
  const { data, error } = await supabase
    .rpc('search_cards', { search_term: searchTerm, limit_count: recordCount, offset_count: page });
  return { data, error };
}

// Fetch credit cards with filters
export async function fetchCreditCardsWithFilters(filters: {
  search?: string
  country?: string
  state?: string
  banks?: string[]
  page: number
  recordCount: number
}): Promise<{ data: CreditCardData[]; count: number }> {
  try {
    let query = supabase.from("card").select("*")

    // Apply search filter
    // if (filters.search) {
    //   query = query.or(
    //     `cardholder_name.ilike.%${filters.search}%,city.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`,
    //   )
    // }

    // // Apply country filter
    // if (filters.country && filters.country !== "all") {
    //   query = query.eq("country", filters.country)
    // }

    // // Apply state filter
    // if (filters.state && filters.state !== "all") {
    //   query = query.eq("state", filters.state)
    // }

    // // Apply bank filter
    // if (filters.banks && filters.banks.length > 0) {
    //   query = query.in("bank", filters.banks)
    // }

    // // Apply pagination
    if (filters.recordCount) {
      query = query.limit(filters.recordCount)
    }
    if (filters.page) {
      query = query.range(filters.page, filters.page + (filters.recordCount || 25) - 1)
    }

    // Order by created_at
    query = query.order("created_at", { ascending: false })
    console.log(query)
    const { data, error } = await query
    const { count: count} = await supabase.from('card').select('*', { count: 'exact', head: true})
    console.log(data, count)
    if (error) {
      console.error("Error fetching filtered credit card:", error)
      throw error
    }

    return {
      data: data ? data.map(transformDatabaseRecord) : [],
      count: count || 0,
    }
  } catch (error) {
    console.error("Database error:", error)
    return { data: [], count: 0 }
  }
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
