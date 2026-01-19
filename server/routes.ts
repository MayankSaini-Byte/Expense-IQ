import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

// Simple regex-based UPI parser
function parseUPIMessage(message: string) {
  // Regex patterns for common UPI messages
  // "Paid Rs. 150.00 to Zomato for Food"
  // "Sent Rs 500 to Amit via UPI"
  // "Debited Rs 1200 for Netflix"
  // "Amt: 150.00, to Zomato, ref: 123..."
  
  const amountRegex = /(?:Rs\.?|INR|Amt:)\s*([\d,]+(?:\.\d{1,2})?)/i;
  const merchantRegex = /(?:to|at|paid|Ref:)\s+([a-zA-Z0-9\s\&\-\.]+?)(?:\s+(?:for|via|on|ref|@)|$|\.|\,)/i;
  
  const amountMatch = message.match(amountRegex);
  const merchantMatch = message.match(merchantRegex);
  
  let amount = 0;
  if (amountMatch) {
    const cleanAmount = amountMatch[1].replace(/,/g, '');
    amount = parseFloat(cleanAmount);
  }

  let merchant = "Unknown";
  if (merchantMatch && merchantMatch[1]) {
    merchant = merchantMatch[1].trim();
  }
  
  // Robust fallback search for merchant names
  const lowerMsg = message.toLowerCase();
  const commonMerchants = [
    "zomato", "swiggy", "uber", "ola", "amazon", "flipkart", "netflix", 
    "spotify", "jio", "airtel", "google", "blinkit", "zepto", "starbucks", 
    "mcdonalds", "kfc", "paytm", "phonepe"
  ];
  
  if (merchant === "Unknown" || merchant.length < 2) {
    for (const m of commonMerchants) {
      if (lowerMsg.includes(m)) {
        merchant = m.charAt(0).toUpperCase() + m.slice(1);
        break;
      }
    }
  }

  // Auto-categorize based on keywords in merchant/message
  let category = "Misc";
  // lowerMsg is already defined above
  
  if (lowerMsg.includes("zomato") || lowerMsg.includes("swiggy") || lowerMsg.includes("food") || lowerMsg.includes("restaurant") || lowerMsg.includes("cafe") || lowerMsg.includes("eat") || lowerMsg.includes("lunch") || lowerMsg.includes("dinner")) {
    category = "Food";
  } else if (lowerMsg.includes("uber") || lowerMsg.includes("ola") || lowerMsg.includes("travel") || lowerMsg.includes("fuel") || lowerMsg.includes("petrol") || lowerMsg.includes("auto") || lowerMsg.includes("taxi")) {
    category = "Travel";
  } else if (lowerMsg.includes("amazon") || lowerMsg.includes("flipkart") || lowerMsg.includes("shopping") || lowerMsg.includes("blinkit") || lowerMsg.includes("zepto") || lowerMsg.includes("grocery")) {
    category = "Essentials";
  } else if (lowerMsg.includes("netflix") || lowerMsg.includes("movie") || lowerMsg.includes("cinema") || lowerMsg.includes("spotify") || lowerMsg.includes("game") || lowerMsg.includes("prime")) {
    category = "Entertainment";
  } else if (lowerMsg.includes("fees") || lowerMsg.includes("books") || lowerMsg.includes("course") || lowerMsg.includes("exam") || lowerMsg.includes("library")) {
    category = "Academics";
  }

  return {
    amount,
    category,
    note: merchant !== "Unknown" ? `Paid to ${merchant}` : "UPI Payment",
    date: new Date().toISOString(),
    originalMessage: message
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup Auth first
  await setupAuth(app);
  registerAuthRoutes(app);

  // Expense Routes - Protected

  app.get(api.expenses.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const filters = req.query;
    const expenses = await storage.getExpenses(userId, filters);
    res.json(expenses);
  });

  app.get(api.expenses.get.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const expense = await storage.getExpense(Number(req.params.id));
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    // Security check: ensure user owns expense
    if (expense.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(expense);
  });

  app.post(api.expenses.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // Force userId from auth
      const input = api.expenses.create.input.parse({ ...req.body, userId });
      
      const expense = await storage.createExpense(input);
      res.status(201).json(expense);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.put(api.expenses.update.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const id = Number(req.params.id);
      
      const existing = await storage.getExpense(id);
      if (!existing) return res.status(404).json({ message: 'Expense not found' });
      if (existing.userId !== userId) return res.status(403).json({ message: 'Forbidden' });

      const input = api.expenses.update.input.parse(req.body);
      const updated = await storage.updateExpense(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.delete(api.expenses.delete.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const id = Number(req.params.id);
    
    const existing = await storage.getExpense(id);
    if (!existing) return res.status(404).json({ message: 'Expense not found' });
    if (existing.userId !== userId) return res.status(403).json({ message: 'Forbidden' });

    await storage.deleteExpense(id);
    res.status(204).send();
  });

  app.post(api.expenses.parseUPI.path, isAuthenticated, async (req, res) => {
    try {
      const { message } = req.body;
      const result = parseUPIMessage(message);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: "Failed to parse message" });
    }
  });

  app.get(api.stats.get.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const stats = await storage.getStats(userId);
    res.json(stats);
  });

  return httpServer;
}
