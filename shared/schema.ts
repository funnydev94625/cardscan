import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const creditCards = pgTable("credit_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cardNumber: varchar("card_number", { length: 16 }).notNull(),
  expiryDate: varchar("expiry_date", { length: 5 }).notNull(), // MM/YY format
  cvv: varchar("cvv", { length: 4 }).notNull(),
  holderName: text("holder_name").notNull(),
  address: text("address").notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  city: text("city").notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  zipCode: varchar("zip_code", { length: 10 }).notNull(),
  email: text("email").notNull(),
  country: varchar("country", { length: 2 }).notNull().default("US"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  bankName: text("bank_name"),
  binNumber: varchar("bin_number", { length: 6 }).notNull(),
}, (table) => ({
  stateIdx: index("state_idx").on(table.state),
  cityIdx: index("city_idx").on(table.city),
  binIdx: index("bin_idx").on(table.binNumber),
  bankIdx: index("bank_idx").on(table.bankName),
}));

export const insertCreditCardSchema = createInsertSchema(creditCards).omit({
  id: true,
  latitude: true,
  longitude: true,
  bankName: true,
});

export type InsertCreditCard = z.infer<typeof insertCreditCardSchema>;
export type CreditCard = typeof creditCards.$inferSelect;

// Filter schemas
export const creditCardFiltersSchema = z.object({
  search: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  banks: z.array(z.string()).optional(),
  expiryFrom: z.string().optional(),
  expiryTo: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(25),
  sortBy: z.enum(['holderName', 'city', 'state', 'expiryDate', 'bankName']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type CreditCardFilters = z.infer<typeof creditCardFiltersSchema>;

export interface CreditCardStats {
  totalRecords: number;
  bankDistribution: { bankName: string; count: number }[];
  stateDistribution: { state: string; count: number }[];
  expiringCards: number;
}
