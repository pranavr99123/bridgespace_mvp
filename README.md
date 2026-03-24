# Bridgespace MVP

Two-player couples communication game built with Next.js App Router.

## Features in this build

- Playable session flows: Pulse, Mirror, Forge
- Simultaneous reveal UI
- Vault and Signal pages
- Supabase auth/session middleware scaffolding
- Supabase-backed API routes for vault and signal queries
- Anthropic-backed AI endpoints for mirror feedback, forge referee, and signal observations
- Local fallback mode when env vars are not configured

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
copy .env.example .env.local
```

3. Fill `.env.local` with:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (optional for this MVP)
- `ANTHROPIC_API_KEY`

4. Run development server:

```bash
npm run dev
```

## Supabase SQL

Run these in Supabase SQL editor:

- `supabase/schema.sql`
- `supabase/rls.sql`

## API routes

- `POST /api/ai/mirror-feedback`
- `POST /api/ai/forge-referee`
- `POST /api/ai/signal`
- `GET /api/vault`
- `GET /api/signal`

If Anthropic env vars are missing, AI endpoints return safe mocked responses.
