import { pgTable, text, serial, integer, boolean, timestamp, numeric, varchar, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Import auth tables to export them
import { users } from "./models/auth";
export * from "./models/auth";

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(), // Links to auth.users.id
  amount: numeric("amount").notNull(),
  category: text("category").notNull(), // Food, Travel, Academics, Entertainment, Essentials, Misc
  note: text("note"),
  paymentType: text("payment_type").default('manual'), // 'manual' | 'upi'
  date: timestamp("date").defaultNow().notNull(),
  rawMessage: text("raw_message"), // For UPI parsed expenses
  isImpulsive: boolean("is_impulsive").default(false), // Flag for insights
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true, userId: true });

// Base types
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

// Request types
export type CreateExpenseRequest = InsertExpense;
export type UpdateExpenseRequest = Partial<InsertExpense>;

// Response types
export type ExpenseResponse = Expense;
export type ExpensesListResponse = Expense[];

// Stats types
export interface CategoryStat {
  category: string;
  total: number;
  percentage: number;
}

export interface MonthlyStat {
  month: string;
  total: number;
}

export interface Insight {
  id: string;
  type: 'warning' | 'info' | 'success';
  message: string;
  relatedExpenseIds?: number[];
}

export interface DashboardStats {
  totalSpent: number;
  categoryStats: CategoryStat[];
  monthlyStats: MonthlyStat[];
  recentExpenses: Expense[];
  insights: Insight[];
}

// UPI Parse Request
export interface UPIParseRequest {
  message: string;
}

export interface UPIParseResponse {
  amount: number;
  category: string;
  note: string;
  date: string;
  originalMessage: string;
}
