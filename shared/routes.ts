import { z } from 'zod';
import { insertExpenseSchema, expenses } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  expenses: {
    list: {
      method: 'GET' as const,
      path: '/api/expenses',
      input: z.object({
        category: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof expenses.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/expenses/:id',
      responses: {
        200: z.custom<typeof expenses.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/expenses',
      input: insertExpenseSchema,
      responses: {
        201: z.custom<typeof expenses.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/expenses/:id',
      input: insertExpenseSchema.partial(),
      responses: {
        200: z.custom<typeof expenses.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/expenses/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    parseUPI: {
      method: 'POST' as const,
      path: '/api/expenses/parse-upi',
      input: z.object({ message: z.string() }),
      responses: {
        200: z.object({
          amount: z.number(),
          category: z.string(),
          note: z.string(),
          date: z.string(),
          originalMessage: z.string(),
        }),
        400: errorSchemas.validation,
      },
    },
  },
  stats: {
    get: {
      method: 'GET' as const,
      path: '/api/stats',
      responses: {
        200: z.object({
          totalSpent: z.number(),
          categoryStats: z.array(z.object({
            category: z.string(),
            total: z.number(),
            percentage: z.number(),
          })),
          monthlyStats: z.array(z.object({
            month: z.string(),
            total: z.number(),
          })),
          recentExpenses: z.array(z.custom<typeof expenses.$inferSelect>()),
          insights: z.array(z.object({
            id: z.string(),
            type: z.enum(['warning', 'info', 'success']),
            message: z.string(),
            relatedExpenseIds: z.array(z.number()).optional(),
          })),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
