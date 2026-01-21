import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  // Get current authenticated user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Onboarding endpoint - update user details
  app.post("/api/user/onboarding", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id; // Passport user object from googleAuth has .id
      const { age, occupation, monthlyBudget } = req.body;

      // Basic validation
      if (!age || !occupation || !monthlyBudget) {
        return res.status(400).json({ message: "All fields are required" });
      }

      await authStorage.upsertUser({
        id: userId,
        age: Number(age),
        occupation,
        monthlyBudget: String(monthlyBudget), // numeric field is usually string in JS/Drizzle
      });

      res.json({ message: "Onboarding complete" });
    } catch (error) {
      console.error("Onboarding error:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });
}
