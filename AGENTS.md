# AGENTS.md — Make Prono Great Again

Instructions pour les agents IA travaillant sur ce projet.

## Apercu du projet

Application PWA de pronostics entre amis pour la Coupe du Monde 2026. Les utilisateurs se connectent via Google, parient sur les matchs, rejoignent des "tribus" (groupes), et suivent un classement en temps reel.

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 19, React Router 7, TypeScript 5 |
| Styling | Tailwind CSS 3 (utility-first, pas de CSS custom) |
| Backend | Supabase (Auth + PostgreSQL) |
| Edge Functions | Deno (Supabase Edge Functions) |
| Build | Vite 6, vite-plugin-pwa |
| Hosting | GitHub Pages (deploy automatique via GitHub Actions) |
| Icons | lucide-react |
| Dates | date-fns |
| Toasts | react-hot-toast |

## Structure du projet

```
src/
├── assets/          # Images, drapeaux SVG
├── components/      # Composants partages (Avatar, Flag, InstallPrompt, prompts PWA/push)
├── contexts/        # AuthContext (session, profil, auth Google)
├── hooks/           # Hooks de donnees (useMatches, useBet, useTeams, useGroups, etc.)
├── lib/             # Client Supabase (supabase.ts) + types DB generes (database.types.ts)
├── screens/         # Pages de l'app (HomePage, Matches, Ranking, Groups, Profile, etc.)
├── index.css        # Tailwind directives + reset minimal (13 lignes)
└── main.tsx         # Point d'entree

supabase/
├── functions/       # Edge Functions (update-results, notify-pre-match)
└── migrations/      # Migrations SQL (schema, RLS, triggers, vues, cron)

populate/            # Scripts admin
```

## Conventions de code

### Nommage
- **Composants** : PascalCase (`InstallPrompt.tsx`)
- **Hooks** : prefix `use` (`useMatches`, `useBet`, `useIsUserAdmin`)
- **Screens** : PascalCase (`HomePage`, `MatchesPage`)
- **Tables/colonnes DB** : snake_case (`bet_team_a`, `display_name`)

### Organisation des fichiers
- **Pas de barrel index.tsx** : ne jamais creer de fichier `index.tsx` qui ne fait que re-exporter un composant. Les imports doivent pointer directement vers le fichier (ex: `import App from './App/App'`, pas `import App from './App'`)
- **Pas de dossier a fichier unique** : si un dossier ne contient qu'un seul fichier, remonter le fichier au niveau du parent
- **Composants** : fichiers plats dans `components/` (ex: `Avatar.tsx`, `Flag.tsx`)
- **Screens** : fichiers plats dans `screens/` pour les ecrans simples (ex: `Admin.tsx`). Dossiers reserves aux ecrans complexes avec sous-composants
- **Hooks** : fichiers plats dans `hooks/`
- **Contexts** : fichiers plats dans `contexts/`

### Styling (Tailwind)
- **Tout en utility classes** : ne pas creer de classes CSS custom dans `index.css`. Toute la mise en forme passe par des classes Tailwind directement dans le JSX
- **index.css** : ne contient que les directives `@tailwind`, le reset body/html, et le background `#root`. Ne rien y ajouter
- **Couleurs brand** : utiliser `text-navy`, `bg-cream`, `text-navy-light`, `bg-cream-dark` (definies dans `tailwind.config.js`)
- **Ombres** : utiliser `shadow-card` et `shadow-card-hover` (definies dans `tailwind.config.js`)
- **Pas de MUI** : le projet n'utilise plus Material-UI. Utiliser des elements HTML natifs styles avec Tailwind
- **Icones** : utiliser `lucide-react` exclusivement
- **Toasts** : utiliser `react-hot-toast` (pas notistack)

### Style de code
- Prettier : `semi: false`, `trailingComma: "all"`, `singleQuote: true`
- TypeScript : `strict: false`, `noImplicitAny: false`
- `baseUrl: "src"` dans tsconfig — les imports depuis `src/` sont absolus (ex: `import { useAuth } from 'contexts/AuthContext'`)
- Aliases Vite : `components`, `hooks`, `utils` resolvent vers `src/`
- Langue de l'UI : francais

### Regles strictes
- Ne jamais utiliser d'assertions de type TypeScript (comme `as const`, `as Type`, `as any`). Privilégier un typage explicite (ex: `const foo: Record<string, string> = ...`) ou des méthodes qui infèrent correctement (comme `flatMap` au lieu de `filter(Boolean) as Type[]`).
- Ne jamais coder de fonction d'une seule ligne (privilegier la duplication)
- Ne jamais definir une fonction a l'interieur d'une autre fonction — utiliser un fichier helper ou service dedie
- Ne jamais ajouter de commentaires narratifs evidents

## Base de donnees (Supabase PostgreSQL)

### Tables principales
| Table | Role |
|-------|------|
| `profiles` | Profils utilisateurs (lie a `auth.users`) — sans score ni vainqueur |
| `competition_profiles` | Score + vainqueur final par compétition (`competition_id`, `user_id`) |
| `teams` | Equipes (code, nom, groupe, cotes) |
| `matches` | Matchs (equipes, scores, cotes, phase, termine) |
| `bets` | Paris des utilisateurs par match |
| `competitions` | Config de la competition (dates) |
| `groups` | Tribus avec membres |
| `group_apply` | Demandes d'adhesion aux tribus |

### Vues
- `matches_with_teams` — matchs + noms/codes des equipes
- `bets_with_profiles` — paris + display_name/avatar
- `ranking` — classement par `competition_id` (score et vainqueur depuis `competition_profiles`)

### Triggers importants
- `calculate_match_scores` — recalcule les points des paris quand un score de match est mis a jour
- `handle_group_apply` — auto-valide et met a jour les groupes a l'insertion
- `prevent_role_escalation` — empeche un non-admin de changer les roles

### RLS (Row Level Security)
- Toutes les tables ont RLS active
- Fonction helper `is_admin()` (SECURITY DEFINER) pour verifier le role admin
- Les vues utilisent `security_invoker = true`
- Les Edge Functions utilisent `service_role` key (bypass RLS)

## Edge Functions (Deno)

| Fonction | Role | Cron |
|----------|------|------|
| `update-results` | Recupere les resultats via Gemini + Google Search, met a jour `matches` | Toutes les 5 min |
| `notify-pre-match` | Push OneSignal aux joueurs sans prono ~5 min avant coup d'envoi | Chaque minute (pg_cron) |

Les cotes (`odds_a`, `odds_b`, `odds_draw`) ne viennent plus d'un bookmaker : elles sont recalculées automatiquement par un trigger DB à chaque INSERT/UPDATE/DELETE sur `bets` (tant que le match n'a pas démarré), selon la popularité des pronostics.

Variables d'environnement requises : `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

## Variables d'environnement

### Frontend (prefixe `VITE_`)
- `VITE_SUPABASE_URL` — URL du projet Supabase
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Cle anon Supabase
- `VITE_ONESIGNAL_APP_ID` — App ID OneSignal (push web ; voir `NOTIFICATIONS.md`)

### Edge Functions / Populate
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, optionnel `GEMINI_MODEL`
- Push (rappels auto) : `ONESIGNAL_APP_ID`, `ONESIGNAL_REST_API_KEY`, optionnel `PUBLIC_SITE_URL` (voir `NOTIFICATIONS.md`). Les envois manuels à tout le monde se font depuis le dashboard OneSignal.

Ne jamais commiter de fichiers `.env`, credentials, ou cles d'API.

## Scripts npm

| Script | Description |
|--------|-------------|
| `npm run dev` | Serveur de dev Vite (port 3000) |
| `npm run build` | Type-check (`tsc --noEmit`) + build dans `build/` |
| `npm run preview` | Preview du build de production |
| `npm run lint` | ESLint sur `src/` |
| `npm run prettier:check` | Verification du formatage |
| `npm run prettier:write` | Formatage automatique |

## Deploiement

**Toujours commit + push immédiatement après chaque changement**, sans demander confirmation. Ne jamais attendre que l'utilisateur demande de push.

Push sur `main` declenche le workflow `.github/workflows/deploy.yml` :
1. `supabase db push` (migrations)
2. Deploy des Edge Functions (`update-results`, `notify-pre-match`)
3. Build frontend + deploy sur GitHub Pages

## Points d'attention

- Les types DB sont generes dans `src/lib/database.types.ts` — les regenerer apres toute modification de schema
- Le dossier `populate/` contient des scripts de reference pour la migration vers Supabase
- L'app est une PWA avec Service Worker (vite-plugin-pwa), manifest genere dans `vite.config.ts`
- Theme couleur : `navy` (#19194B), `cream` (#f9f6ed) — definis dans `tailwind.config.js`
- Police principale : Inter (fallback Roboto, system-ui)

## Cursor Cloud specific instructions

### Service overview

This is a frontend-only React SPA. The only local process is the **Vite dev server** (`npm run dev` on port 3000). The backend is hosted Supabase — no local database or Docker is required.

### Environment variables

The following secrets must be injected as environment variables (and written to `.env` at the repo root) for the app to work:

- `VITE_SUPABASE_URL` — required
- `VITE_SUPABASE_PUBLISHABLE_KEY` — required
- `VITE_OPENROUTER_KEY` — optional (AI predictions feature)

### Running the dev server

```bash
npm run dev
```

Serves on `http://localhost:3000/`. Vite HMR is active; changes to `src/` are reflected immediately.

### Build & type-check

```bash
npm run build   # runs tsc --noEmit then vite build → output in build/
```

### Linting & formatting

- `npm run lint` — ESLint is referenced in scripts but **not installed** as a devDependency (pre-existing gap). This command will fail.
- `npm run prettier:check` / `npm run prettier:write` — Prettier works correctly.

### Node.js version

`package.json` requires `node >= 24`. The update script uses nvm to ensure Node 24 is active. Always source nvm before running npm commands:

```bash
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm use 24
```

### Authentication

Google OAuth is the only auth method. Testing authenticated flows requires signing in via the Desktop pane — the agent cannot complete Google OAuth programmatically.
