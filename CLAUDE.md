# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Make Prono Great Again** — a PWA for football match betting between friends, built for the 2026 World Cup (and other competitions like the Champions League). Users sign in via Google, place bets on matches, join "tribes" (groups), and track a live leaderboard.

**Stack**: React 19, React Router 7, TypeScript 5, Supabase (Auth + PostgreSQL), Tailwind CSS 3, Vite 6, vite-plugin-pwa. Hosted on GitHub Pages. UI language is **French**.

## Commands

```bash
# Setup
cp .env.example .env   # fill VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY
npm install

# Dev server (port 3000, HMR active)
npm run dev

# Type-check + production build → build/
npm run build

# Formatting
npm run prettier:check
npm run prettier:write
```

> **Node requirement**: `>=24`. Use nvm if needed:
> ```bash
> export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use 24
> ```

> **`npm run lint`** references ESLint but ESLint is not installed — this command will fail.

## Git Workflow

**Push directly to `main` — no pull requests.** After every change, **always commit and push immediately** without waiting for the user to ask:
```bash
git add -A && git commit -m "message" && git push origin HEAD:main
```

Never ask "should I push?" — just do it. CI/CD automation (`.github/workflows/deploy.yml`) handles all testing, building, and deployment to production automatically upon push. This workflow bypasses review overhead for this small team.

## Architecture

### Frontend Data Flow

All data fetching is done via custom hooks in `src/hooks/`, which call Supabase directly from the client. There is no custom API layer — the hooks are the data layer.

Two global React Contexts wrap the entire app:
- `AuthContext` (`src/contexts/AuthContext.tsx`) — Supabase session, user, profile, Google OAuth
- `CompetitionContext` (`src/contexts/CompetitionContext.tsx`) — active competition; admins can switch between competitions

The active competition ID flows from `CompetitionContext` into hooks (e.g. `useBet`, `useAllUserBets`) to scope all queries to the current competition.

### Multi-Competition Support

The app supports multiple concurrent competitions (e.g. CDM 2026 + Champions League). The `competitions` table has an `active` boolean column; only one is active at a time for regular users. Admins can switch the viewed competition via `setActiveCompetitionId`. Scores and winner picks per user live in `competition_profiles` (not `profiles`).

### Scoring System (`src/lib/scoring.ts`)

`computeScoringBreakdown()` is the source of truth for point calculation. Points are composed of:
- `resultat` (2pts): correct outcome (win/draw/loss)
- `gagnant` (8pts): correct winner (handles `knockout_decider` format for playoff matches with tie-break)
- `proximite` (0–3pts): score closeness
- `ecart` (0–3pts): margin accuracy
- `bonus` (4pts): exact score

Final points = `(base * winningOdds * phaseMultiplier)`, rounded to integer. Phase multipliers: `group`×0.75, `round_of_16`×1, `round_of_8`×1.5, `quarter_final`×3, `semi_final`×6, `third_place`×8, `final`×12.

### Odds System

Odds (`odds_a`, `odds_b`, `odds_draw`) are **not** from a bookmaker. They are computed dynamically by a DB trigger on `bets` INSERT/UPDATE/DELETE (as long as the match hasn't started), based on prediction popularity with `exp(-p^(1/2) * 2) * 10` clamped to `[1, 10]`. `src/lib/bettingOdds.ts` contains the frontend mirror of this logic used for live preview.

### Match Bet Formats

Two bet formats exist (`src/lib/matchEnums.ts`):
- `regulation_1x2`: standard group match — 1X2 outcome
- `knockout_decider`: knockout match — user also picks a `betPlayoffWinner` ('A' or 'B') when they bet a draw

### DB Views Used by Frontend

- `matches_with_teams` — joins `matches` + team names/codes; used everywhere matches are displayed
- `bets_with_profiles` — joins `bets` + `display_name`/`avatar_url`; used in match detail views
- `ranking` — aggregates `competition_profiles` scores with rank; scoped by `competition_id`

### Edge Functions (Deno, `supabase/functions/`)

| Function | Schedule | Role |
|---|---|---|
| `update-results` | Every 5 min | Fetches results through Gemini + Google Search, updates `matches` |
| `notify-pre-match` | Every minute (pg_cron) | Sends OneSignal push to users without a bet ~5 min before kickoff |

Edge Functions use the `service_role` key (bypasses RLS). Required secrets: `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ONESIGNAL_APP_ID`, `ONESIGNAL_REST_API_KEY`. `GEMINI_MODEL` is optional.

### PWA / Service Worker

The Service Worker filename is defined in `src/serviceWorkerName.ts` and must align with OneSignal's expected filename (`OneSignalSDKWorker.js`). The SW imports the OneSignal SDK via `importScripts` in `vite.config.ts`. `public/OneSignalSDKUpdaterWorker.js` is a static file to avoid 404s from OneSignal's sync.

OneSignal is **only initialized** when `window.location.origin` matches `VITE_WEBSITE_URL`. It is intentionally disabled on localhost.

## Code Conventions

### File Organization
- **No barrel `index.tsx` re-exports**: imports must point directly to the file (e.g. `import App from './App/App'`, not `import App from './App'`)
- **No single-file folders**: promote the file to its parent directory
- `src/components/` — flat shared components (Avatar, Flag, install/update/push prompts, etc.)
- `src/screens/` — flat files for simple pages; subfolders only for complex screens with sub-components
- `src/hooks/` — flat files, all data hooks
- `src/lib/` — Supabase client, generated DB types, pure business logic

### Imports

`tsconfig.json` sets `baseUrl: "src"` — imports from `src/` are absolute:
```ts
import { useAuth } from 'contexts/AuthContext'
import { supabase } from 'lib/supabase'
```
Vite aliases (`components`, `hooks`, `utils`) also resolve to `src/`.

### Styling
- Utility classes only — no custom CSS in `index.css` (only Tailwind directives + minimal body reset)
- Brand colors: `text-navy`, `bg-cream`, `text-navy-light`, `bg-cream-dark`
- Shadows: `shadow-card`, `shadow-card-hover`
- Icons: `lucide-react` exclusively
- Toasts: `react-hot-toast` exclusively

### TypeScript / Code Style
- Prettier: `semi: false`, `singleQuote: true`, `trailingComma: "all"`
- **No type assertions** (`as Type`, `as any`, `as const`). Use explicit annotation (`const foo: Record<string, string> = ...`) or inference (`flatMap` instead of `filter(Boolean) as Type[]`)
- **No single-line functions** — prefer duplication over abstraction
- **No functions defined inside other functions** — extract to a helper file/module

### DB Types
`src/lib/database.types.ts` is generated from the Supabase schema. Regenerate it after any schema change:
```bash
supabase gen types typescript --project-id <ref> > src/lib/database.types.ts
```
Use `Tables<'table_name'>` for row types throughout the codebase.

## Database Schema Key Points

- `profiles`: user identity (no score, no winner pick)
- `competition_profiles`: `(user_id, competition_id)` — score + winner team per competition
- `bets`: bet per `(match_id, user_id)`, id is `${match_id}_${user_id}`; includes `outcome_status` enum (`rate` / `good_result` / `perfect_score`) set by DB trigger
- `matches`: includes `bet_format`, `tournament_phase`, `visible_to_users` (controls admin-only visibility), `playoff_winner`
- `teams`: includes `unveiled` (for teams not yet revealed in knockout brackets) and `elimination`

### RLS Notes
- `is_admin()` SECURITY DEFINER function — use this for admin checks to avoid RLS recursion
- Views use `security_invoker = true` — they respect RLS of underlying tables
- `prevent_role_escalation` trigger — users cannot change their own `role`
- To make a user admin: `UPDATE profiles SET role = 'admin' WHERE id = '<uuid>';`

## Deployment

Push to `main` triggers `.github/workflows/deploy.yml`:
1. Applies DB migrations (`supabase db push --include-all`)
2. Deploys Edge Functions
3. Builds frontend (requires `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_OPENROUTER_KEY`, `VITE_ONESIGNAL_APP_ID`, `VITE_WEBSITE_URL` secrets)
4. Deploys to GitHub Pages

## AI Bet Feature

`src/lib/openrouter.ts` + `src/screens/App/AiBetModal.tsx` — optional feature using OpenRouter (GPT-4o-mini, DeepSeek, Mistral) to auto-generate predictions. Requires `VITE_OPENROUTER_KEY`. The modal bulk-saves bets via `saveBatchBets()` in `src/hooks/bets.ts`.

## Authentication

Google OAuth only. `AuthContext` handles session init, profile fetch-or-create on first login, and connection count updates. The redirect URL in `signInWithGoogle()` is hardcoded to `https://makepronogreatagain.bzh/` in production — update this if the domain changes.
