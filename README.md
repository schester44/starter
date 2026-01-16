# Flightplan

A modern full-stack starter template for kicking off new projects with authentication, organizations, and a clean dashboard UI.

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) - Full-stack React framework with file-based routing
- **Database**: [Prisma 7](https://www.prisma.io/) with PostgreSQL adapter (`@prisma/adapter-pg`)
- **Authentication**: [Better Auth](https://www.better-auth.com/) - Email/password + OAuth (GitHub, Google)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (New York style) with Tailwind CSS v4
- **Monorepo**: Turborepo with pnpm workspaces

## Features

- 🔐 **Authentication** - Email/password signup, social OAuth (GitHub, Google)
- 🏢 **Multi-org support** - Users can create and switch between organizations
- 👥 **Team management** - Organization members and roles
- 🔑 **API keys** - Per-organization API key management
- 📱 **Responsive sidebar** - Collapsible navigation with org switcher
- ⚡ **Server functions** - Type-safe server functions instead of middleware for auth checks

## Project Structure

```
apps/
  gateway/          # TanStack Start app (port 4444)
    src/
      components/   # React components (sidebar, org-switcher)
      lib/          # Auth config, session helpers
      routes/       # File-based routes
        _authed/    # Protected routes (requires login + org)
        api/        # API routes

packages/
  db/               # Prisma schema and database client
    src/
      prisma/       # Schema and migrations
      generated/    # Generated Prisma client
```

## Key Decisions

### Authentication Pattern

We use server functions (`createServerFn`) for session checks instead of middleware. The `/_authed` layout route handles:

1. Redirecting unauthenticated users to `/login`
2. Redirecting users without organizations to `/onboarding`
3. Auto-selecting an organization if none is active

### Organization Gating

All authenticated routes require an active organization. New users are guided through onboarding to create their first org.

### Database

Prisma 7 with the PostgreSQL adapter for better performance. The schema includes all Better Auth tables (users, sessions, accounts, organizations, members, invitations, api_keys).

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp apps/gateway/.env.example apps/gateway/.env

# Create and migrate database
cd packages/db
pnpm prisma migrate dev

# Start development server
pnpm dev
```

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user@localhost:5432/flightplan"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:4444"

# OAuth (optional)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```
