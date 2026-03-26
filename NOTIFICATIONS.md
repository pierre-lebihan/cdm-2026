# Notifications push (OneSignal + Supabase)

## Frontend

- **Installer l’app vs notifications** : sur **iPhone**, le push web ne marche en pratique qu’en **PWA** (ajout à l’écran d’accueil) — l’encart d’installation reste prioritaire ; la carte « Ne rate pas les matchs » explique cette étape sur iOS. Sur **Android / bureau**, les notifications peuvent fonctionner **sans** installation ; les deux encarts peuvent coexister (install en bas à droite, rappels matchs en bas à gauche sur grand écran).
- Variable **`VITE_ONESIGNAL_APP_ID`** : ID d’app OneSignal (dashboard → Settings → Keys & IDs).
- En production, ajoute la même variable dans les secrets GitHub du workflow de déploiement (`VITE_ONESIGNAL_APP_ID`).
- Le SDK est initialisé dans `src/lib/onesignal.ts` ; après connexion Google, l’**external_id** OneSignal = UUID Supabase (`OneSignal.login`), pour que les rappels match ciblent les bons abonnés.
- Le service worker PWA (`sw.js` généré par Vite) charge aussi le script OneSignal via `importScripts` dans `vite.config.ts`.

## Secrets des Edge Functions (Supabase)

Dans le dashboard Supabase → **Edge Functions** → **Secrets** (ou `supabase secrets set`) :

| Secret | Rôle |
|--------|------|
| `ONESIGNAL_APP_ID` | Même valeur que `VITE_ONESIGNAL_APP_ID` |
| `ONESIGNAL_REST_API_KEY` | Clé REST API (dashboard OneSignal → Keys & IDs, **pas** la clé du client web) |
| `PUBLIC_SITE_URL` | Optionnel. URL du site pour le lien dans les notifs (défaut : `https://makepronogreatagain.bzh/`) |
| `NOTIFY_BROADCAST_SECRET` | Mot de passe long et aléatoire pour protéger l’envoi manuel via la fonction `notify-broadcast` |

Les secrets `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont déjà fournis par l’hébergement des fonctions.

## Rappel automatique (~5 minutes avant le match)

- Migration `supabase/migrations/20260328140000_pre_match_reminder_and_notify_cron.sql` : colonne `matches.pre_match_reminder_sent_at` + job **pg_cron** qui appelle la fonction **`notify-pre-match`** chaque minute.
- Fenêtre : `date_time` du match strictement après **maintenant + 4 min** et inférieur ou égal à **maintenant + 5 min** (une seule exécution utile par match).
- Cibles : utilisateurs présents dans **`competition_profiles`** pour la compétition du match, **sans** pronostic complet (`bet_team_a` et `bet_team_b` renseignés) pour ce match. (En pratique, une ligne `competition_profiles` apparaît après un premier prono ou le choix du vainqueur : les comptes tout neufs sans aucune action ne sont pas dans ce périmètre.)
- Après traitement, `pre_match_reminder_sent_at` est renseigné pour ne pas renvoyer le même rappel.

Si tu changes d’URL de projet Supabase, mets à jour l’URL dans le `cron.schedule` de cette migration (comme pour `update-results`).

## Déploiement des fonctions

Le workflow GitHub Actions déploie `notify-pre-match` et `notify-broadcast` avec `update-results` / `update-odds`. En local :

```bash
supabase functions deploy notify-pre-match --no-verify-jwt
supabase functions deploy notify-broadcast --no-verify-jwt
```

---

## Envoi manuel à tous les abonnés

### 1. Dashboard OneSignal

**Messages** → **New push** → audience **Subscribed Users** (ou segment équivalent), rédige le titre / le message, envoi.

### 2. API OneSignal directe (curl)

Remplace `REST_API_KEY` et `APP_ID` (onglet Keys & IDs).

```bash
curl -sS -X POST "https://api.onesignal.com/notifications" \
  -H "Content-Type: application/json" \
  -H "Authorization: Key REST_API_KEY" \
  -d '{
    "app_id": "APP_ID",
    "target_channel": "push",
    "included_segments": ["Subscribed Users"],
    "headings": { "fr": "Titre", "en": "Title" },
    "contents": { "fr": "Corps du message", "en": "Message body" },
    "url": "https://makepronogreatagain.bzh/"
  }'
```

Le nom exact du segment peut varier selon la langue du dashboard ; en cas d’erreur, vérifie dans OneSignal **Audience** → **Segments**.

### 3. Edge Function `notify-broadcast`

Après avoir défini `NOTIFY_BROADCAST_SECRET` :

```bash
curl -sS -X POST \
  "https://TON_PROJECT.supabase.co/functions/v1/notify-broadcast" \
  -H "Content-Type: application/json" \
  -H "x-mpga-broadcast-secret: TON_SECRET" \
  -d '{"heading":"Titre","message":"Corps du message","url":"https://makepronogreatagain.bzh/matches"}'
```

- `heading` est optionnel (défaut : « Make Prono Great Again »).
- `url` est optionnel.
