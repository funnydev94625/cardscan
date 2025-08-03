// Filters for loadFilteredData
export type CardFilter = {
  bankName?: string;
  cardName?: string;
  cardNumber?: string;
  expiryStart?: string;
  expiryEnd?: string;
  country?: string;
  state?: string;
  recordCount: number;
  page: number;
  sortField: string,
  sortDirection: "asc" | "desc";
};
export interface CreditCardData {
  id: string
  cardNumber: string
  // masked_card_number: string
  // bin: string
  expiry_month: string
  expiry_year: string
  cvv: string
  cardholderName: string
  address: string
  // address_line2: string
  phone: string
  city: string
  state: string
  zipCode: string
  email: string
  country: string
  // bank: string | null
  lat: number | null
  lng: number | null
  createdAt: string
  // updated_at: string
}

export interface DatabaseCreditCard {
  id: string
  card_number: string
  // masked_card_number: string
  // bin: string
  expiry_month: string
  expiry_year: string
  cvv: string
  name: string
  address_line1: string
  address_line2: string
  phone: string
  city: string
  state: string
  zipcode: string
  email: string
  country: string
  lat: number | null
  lng: number | null
  // bank: string | null
  // latitude: number | null
  // longitude: number | null
  created_at: string
  updated_at: string
}
