# Make Prono Great Again - Coupe du Monde 2026

Application de pronostics entre amis pour la Coupe du Monde 2026.

**Stack** : React 19, Vite 6, TypeScript 5, Supabase (Auth + PostgreSQL), Tailwind CSS 3.

---

## Prérequis

- Node.js >= 20
- Un compte [Supabase](https://supabase.com) (plan gratuit suffisant pour le PoC)

---

## Setup Supabase

### 1. Créer un projet

Rendez-vous sur [app.supabase.com](https://app.supabase.com) et créez un nouveau projet.
Notez l'**URL du projet** et la **clé anon (publique)** depuis `Settings > API`.

### 2. Activer l'authentification Google

1. **Google Cloud Console** :
   - Aller sur [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
   - Créer un projet (ou en sélectionner un existant)
   - `Create Credentials > OAuth Client ID` → Application type: **Web application**
   - **Authorized redirect URIs** : ajouter `https://<votre-projet-ref>.supabase.co/auth/v1/callback`
   - Copier le **Client ID** et le **Client Secret**

2. **Dashboard Supabase** :
   - Aller dans `Authentication > Providers > Google`
   - Activer le provider
   - Coller le **Client ID** et **Client Secret**
   - Sauvegarder

3. **Redirect URL** (si GitHub Pages) :
   - Dans `Authentication > URL Configuration`, ajouter votre domaine dans **Redirect URLs** :
     - `https://<username>.github.io/euro-2024/`
     - `http://localhost:3000/euro-2024/` (pour le dev local)

### 3. Créer le schéma de base de données

Le schéma est versionné dans `supabase/migrations/`. **Source de vérité** : appliquer les migrations sur le projet Supabase (CLI ou CI).

```bash
# Depuis la racine du repo, avec le CLI Supabase installé et le projet lié
supabase db push
```

Ne pas recréer le schéma à la main dans le SQL Editor : les fichiers SQL du repo incluent tables, vues (`ranking`, `matches_with_teams`, …), triggers et RLS. Les scores et le vainqueur final par compétition sont dans `competition_profiles`, pas dans `profiles`.

### 4. Row Level Security (RLS)

Les RLS policies sont définies dans `supabase/migrations/20260312140000_enable_rls_policies.sql`.

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| **profiles** | authenticated | own (`id = auth.uid()`) | own | admin |
| **teams** | public | admin | admin | admin |
| **matches** | public | admin | admin | admin |
| **bets** | authenticated | own (`user_id`) | own (`user_id`) | admin |
| **competitions** | public | admin | admin | admin |
| **groups** | authenticated | own (`created_by`) | creator ou admin | creator ou admin |
| **group_apply** | authenticated | own (`user_id`) | own (`user_id`) | admin |

**Points clés :**
- Fonction helper `is_admin()` (SECURITY DEFINER) pour vérifier le rôle admin sans récursion RLS.
- Trigger `prevent_role_escalation` empêche un utilisateur de modifier son propre rôle.
- Les vues (`matches_with_teams`, `bets_with_profiles`, `ranking`) utilisent `security_invoker = true` pour respecter les RLS des tables sous-jacentes.
- Les Edge Functions utilisent le `service_role` key qui bypass les RLS.
- Les fonctions trigger (`calculate_match_scores`, `handle_group_apply`) sont SECURITY DEFINER.

Pour rendre un utilisateur admin :
```sql
UPDATE profiles SET role = 'admin' WHERE id = '<user-uuid>';
```

---

## Installation locale

```bash
# Cloner le projet
git clone <url-du-repo>
cd euro-2024

# Copier le fichier d'environnement
cp .env.example .env

# Remplir les variables dans .env :
# VITE_SUPABASE_URL=https://xxxxx.supabase.co
# VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...

# Installer les dépendances
npm install

# Lancer le serveur de dev
npm run dev
```

L'app tourne sur [http://localhost:3000/euro-2024/](http://localhost:3000/euro-2024/).

---

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement (Vite) |
| `npm run build` | Type-check + build de production dans `/build` |
| `npm run preview` | Prévisualiser le build de production |
| `npm run prettier:write` | Formater le code |

---

## Déploiement GitHub Pages

Le projet est configuré pour se déployer automatiquement sur GitHub Pages via GitHub Actions.

1. Aller dans `Settings > Pages` du repo GitHub
2. Source : **GitHub Actions**
3. Ajouter les secrets du repo (`Settings > Secrets > Actions`) :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. Pusher sur `main` → déploiement automatique

---

## Structure du projet

```
src/
├── assets/          # Images, icônes, drapeaux
├── components/      # Composants partagés (Avatar, Flag, Placeholder)
├── contexts/        # AuthContext (Supabase Auth)
├── hooks/           # Hooks de données TypeScript (bets, matches, teams, groups)
├── lib/             # Client Supabase + types DB générés
│   ├── supabase.ts
│   └── database.types.ts
├── screens/         # Pages de l'application
│   ├── App/         # Layout principal + routing
│   ├── FAQ/
│   ├── Groups/      # Gestion des tribus
│   ├── HomePage/    # Page d'accueil + vainqueur final
│   ├── Matches/     # Pronostics et résultats
│   ├── Profile/
│   ├── Ranking/     # Classement par tribu
│   ├── Rules/
│   └── User/        # Profil d'un joueur
├── index.css        # Tailwind + styles globaux
└── main.tsx         # Entry point React 19
```

---

## Ce qui reste à faire (hors PoC)

- ~~**Row Level Security**~~ : ✅ RLS policies configurées
- **Edge Functions** : Migrer les Cloud Functions (cron scores, cotes, notifications)
- **Notifications push** : Remplacer Firebase Cloud Messaging
- **Populate scripts** : Scripts dans `populate/` (service role) — alignés sur `competition_profiles`
- **Tests** : Réécrire les tests unitaires
- **Code splitting** : Optimiser le bundle size (actuellement ~1MB)

---

## Dossiers annexes

- `supabase/functions/` : Edge Functions (cron résultats / cotes).
- `populate/` : scripts admin (service role) pour classements et contrôles.
