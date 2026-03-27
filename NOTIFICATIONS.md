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

Les secrets `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont déjà fournis par l’hébergement des fonctions.

## Rappel automatique (~5 minutes avant le match)

- Migration `supabase/migrations/20260328140000_pre_match_reminder_and_notify_cron.sql` : colonne `matches.pre_match_reminder_sent_at` + job **pg_cron** qui appelle la fonction **`notify-pre-match`** chaque minute.
- Fenêtre : `date_time` du match strictement après **maintenant + 4 min** et inférieur ou égal à **maintenant + 5 min** (une seule exécution utile par match).
- Cibles : utilisateurs présents dans **`competition_profiles`** pour la compétition du match, **sans** pronostic complet (`bet_team_a` et `bet_team_b` renseignés) pour ce match. (En pratique, une ligne `competition_profiles` apparaît après un premier prono ou le choix du vainqueur : les comptes tout neufs sans aucune action ne sont pas dans ce périmètre.)
- Après traitement, `pre_match_reminder_sent_at` est renseigné pour ne pas renvoyer le même rappel.

Si tu changes d’URL de projet Supabase, mets à jour l’URL dans le `cron.schedule` de cette migration (comme pour `update-results`).

## Déploiement des fonctions

Le workflow GitHub Actions déploie `notify-pre-match` avec `update-results` / `update-odds`. En local :

```bash
supabase functions deploy notify-pre-match --no-verify-jwt
```

---

## Messages manuels à tous les abonnés

Depuis **OneSignal** : **Messages** (ou **Push**) → créer un message → audience du type **Subscribed users** / abonnés web push, puis envoi. Aucune Edge Function ni secret dédié côté Supabase.
