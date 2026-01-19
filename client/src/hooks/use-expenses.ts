import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateExpenseRequest, type UpdateExpenseRequest, type UPIParseRequest } from "@shared/routes";
import { z } from "zod";

export function useExpenses(filters?: { category?: string; startDate?: string; endDate?: string }) {
  const queryKey = [api.expenses.list.path, filters];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      let url = api.expenses.list.path;
      if (filters) {
        const params = new URLSearchParams();
        if (filters.category) params.append("category", filters.category);
        if (filters.startDate) params.append("startDate", filters.startDate);
        if (filters.endDate) params.append("endDate", filters.endDate);
        if (params.toString()) url += `?${params.toString()}`;
      }
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch expenses");
      return api.expenses.list.responses[200].parse(await res.json());
    },
  });
}

export function useExpense(id: number) {
  return useQuery({
    queryKey: [api.expenses.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.expenses.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch expense");
      return api.expenses.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateExpenseRequest) => {
      const validated = api.expenses.create.input.parse(data);
      const res = await fetch(api.expenses.create.path, {
        method: api.expenses.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.expenses.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create expense");
      }
      return api.expenses.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.expenses.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateExpenseRequest) => {
      const validated = api.expenses.update.input.parse(updates);
      const url = buildUrl(api.expenses.update.path, { id });
      const res = await fetch(url, {
        method: api.expenses.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.expenses.update.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        if (res.status === 404) throw new Error("Expense not found");
        throw new Error("Failed to update expense");
      }
      return api.expenses.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.expenses.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.expenses.delete.path, { id });
      const res = await fetch(url, {
        method: api.expenses.delete.method,
        credentials: "include",
      });
      
      if (res.status === 404) throw new Error("Expense not found");
      if (!res.ok) throw new Error("Failed to delete expense");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.expenses.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
    },
  });
}

export function useParseUPI() {
  return useMutation({
    mutationFn: async (data: UPIParseRequest) => {
      const validated = api.expenses.parseUPI.input.parse(data);
      const res = await fetch(api.expenses.parseUPI.path, {
        method: api.expenses.parseUPI.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.expenses.parseUPI.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to parse UPI message");
      }
      
      return api.expenses.parseUPI.responses[200].parse(await res.json());
    },
  });
}
