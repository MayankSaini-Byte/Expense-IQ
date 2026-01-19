import { db } from "./db";
import { expenses, type Expense, type InsertExpense } from "@shared/schema";
import { eq, desc, and, sql, gte, lte } from "drizzle-orm";

export interface IStorage {
  createExpense(expense: InsertExpense): Promise<Expense>;
  getExpenses(userId: string, filters?: { category?: string; startDate?: string; endDate?: string }): Promise<Expense[]>;
  getExpense(id: number): Promise<Expense | undefined>;
  updateExpense(id: number, updates: Partial<InsertExpense>): Promise<Expense>;
  deleteExpense(id: number): Promise<void>;
  getStats(userId: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const [expense] = await db.insert(expenses).values(insertExpense).returning();
    return expense;
  }

  async getExpenses(userId: string, filters?: { category?: string; startDate?: string; endDate?: string }): Promise<Expense[]> {
    let conditions = [eq(expenses.userId, userId)];
    
    if (filters?.category) {
      conditions.push(eq(expenses.category, filters.category));
    }
    
    if (filters?.startDate) {
      conditions.push(gte(expenses.date, new Date(filters.startDate)));
    }
    
    if (filters?.endDate) {
      conditions.push(lte(expenses.date, new Date(filters.endDate)));
    }

    return await db.select()
      .from(expenses)
      .where(and(...conditions))
      .orderBy(desc(expenses.date));
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense;
  }

  async updateExpense(id: number, updates: Partial<InsertExpense>): Promise<Expense> {
    const [updated] = await db.update(expenses)
      .set(updates)
      .where(eq(expenses.id, id))
      .returning();
    return updated;
  }

  async deleteExpense(id: number): Promise<void> {
    await db.delete(expenses).where(eq(expenses.id, id));
  }

  async getStats(userId: string): Promise<any> {
    // Total spent
    const [totalResult] = await db.select({
      total: sql<number>`sum(${expenses.amount})`
    })
    .from(expenses)
    .where(eq(expenses.userId, userId));
    
    const totalSpent = Number(totalResult?.total) || 0;

    // Category stats
    const categoryStats = await db.select({
      category: expenses.category,
      total: sql<number>`sum(${expenses.amount})`
    })
    .from(expenses)
    .where(eq(expenses.userId, userId))
    .groupBy(expenses.category);

    const formattedCategoryStats = categoryStats.map(stat => ({
      category: stat.category,
      total: Number(stat.total),
      percentage: totalSpent > 0 ? (Number(stat.total) / totalSpent) * 100 : 0
    }));

    // Monthly stats (last 6 months)
    const monthlyStats = await db.select({
      month: sql<string>`to_char(${expenses.date}, 'Mon')`,
      total: sql<number>`sum(${expenses.amount})`
    })
    .from(expenses)
    .where(eq(expenses.userId, userId))
    .groupBy(sql`to_char(${expenses.date}, 'Mon')`, sql`extract(month from ${expenses.date})`)
    .orderBy(sql`extract(month from ${expenses.date})`);

    // Recent expenses
    const recentExpenses = await db.select()
      .from(expenses)
      .where(eq(expenses.userId, userId))
      .orderBy(desc(expenses.date))
      .limit(5);

    // Simple Insights Generation
    const insights = [];
    
    // 1. Detect impulsive spending (e.g. category 'Entertainment' > 30% of total)
    const entertainmentStat = formattedCategoryStats.find(s => s.category === 'Entertainment');
    if (entertainmentStat && entertainmentStat.percentage > 30) {
      insights.push({
        id: 'impulsive-entertainment',
        type: 'warning',
        message: `Your entertainment spending is ${entertainmentStat.percentage.toFixed(1)}% of your total expenses. Consider setting a limit.`,
      });
    }

    // 2. High food spending
    const foodStat = formattedCategoryStats.find(s => s.category === 'Food');
    if (foodStat && foodStat.percentage > 40) {
      insights.push({
        id: 'high-food',
        type: 'info',
        message: `You're spending a lot on Food (${foodStat.percentage.toFixed(1)}%). Try cooking more often!`,
      });
    }

    // 3. Weekend spending check (simple heuristic: if recent expenses were on weekend)
    // This is hard to do with just aggregates without more complex SQL, let's skip for now or do basic checks.

    if (insights.length === 0) {
      insights.push({
        id: 'good-job',
        type: 'success',
        message: "You're doing great! Keep tracking your expenses to get more insights.",
      });
    }

    return {
      totalSpent,
      categoryStats: formattedCategoryStats,
      monthlyStats: monthlyStats.map(s => ({ month: s.month, total: Number(s.total) })),
      recentExpenses,
      insights
    };
  }
}

export const storage = new DatabaseStorage();
