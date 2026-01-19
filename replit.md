# Expense IQ

## Overview

Expense IQ is a smart, student-focused expense tracking web application designed to help college students understand their spending habits. Unlike basic expense trackers, it focuses on behavioral insights - tracking daily spending, categorizing expenses automatically, and identifying impulsive or unnecessary purchases.

Key capabilities:
- Manual expense entry with category, amount, notes, and payment type
- UPI transaction message parsing (regex-based auto-categorization)
- Visual dashboards with spending charts and breakdowns
- Behavioral insights to detect impulsive spending patterns
- Mobile-first responsive design optimized for student use

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens (vibrant violet theme)
- **Charts**: Recharts for data visualization (pie charts, bar charts)
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful endpoints under `/api/*`
- **Build**: Vite for frontend, esbuild for server bundling

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` for shared types between client/server
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple

### Authentication
- **Provider**: Replit Auth (OpenID Connect)
- **Session Management**: Express sessions with PostgreSQL store
- **Protected Routes**: Middleware-based authentication checks

### Project Structure
```
client/           # React frontend
  src/
    components/   # UI components (Charts, Forms, Layout)
    hooks/        # Custom React hooks (auth, expenses, stats)
    pages/        # Route pages (Dashboard, Expenses, Insights, Landing)
    lib/          # Utilities and query client
server/           # Express backend
  routes.ts       # API endpoint definitions
  storage.ts      # Database access layer
  db.ts           # Drizzle database connection
  replit_integrations/auth/  # Authentication logic
shared/           # Shared code between client/server
  schema.ts       # Drizzle schema definitions
  routes.ts       # API route type definitions
  models/         # Data models (auth)
```

### Key Design Decisions

1. **Shared Schema**: Database schema and API types defined in `shared/` directory for type safety across client and server
2. **UPI Parsing**: Regex-based parsing of UPI transaction messages with automatic category detection (Food, Travel, Entertainment, etc.)
3. **Expense Categories**: Fixed set of student-relevant categories (Food, Travel, Academics, Entertainment, Essentials, Shopping, Misc)
4. **Impulsive Spending Detection**: Expenses can be flagged as impulsive for behavioral insights

## External Dependencies

### Database
- **PostgreSQL**: Primary data store (connection via `DATABASE_URL` environment variable)
- **Drizzle ORM**: Type-safe database queries and migrations

### Authentication
- **Replit Auth**: OAuth/OIDC-based authentication
- **Required Environment Variables**: `ISSUER_URL`, `REPL_ID`, `SESSION_SECRET`, `DATABASE_URL`

### Frontend Libraries
- **Radix UI**: Accessible component primitives
- **Recharts**: Chart visualization
- **date-fns**: Date formatting and manipulation
- **Lucide React**: Icon library

### Build Tools
- **Vite**: Frontend development server and bundler
- **esbuild**: Server-side bundling for production
- **TypeScript**: Type checking across the codebase