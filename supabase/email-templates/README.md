# Email Templates — Supabase Auth

Templates HTML pour les emails d'authentification, aux couleurs de Make Prono Great Again (navy #19194B + cream #f9f6ed).

## Deploiement automatique

Les templates sont deployes automatiquement a chaque push sur `main` via le workflow CI.
Le script `supabase/deploy-email-templates.sh` lit les fichiers HTML et les envoie a l'API Management Supabase.

## Templates

| Template       | Fichier               | Subject                                        |
| -------------- | --------------------- | ---------------------------------------------- |
| Magic Link     | `magic-link.html`     | `⚽ Ton lien magique — Make Prono Great Again` |
| Confirm signup | `confirm-signup.html` | `⚽ Bienvenue sur Make Prono Great Again !`    |
| Invite user    | `invite-user.html`    | `⚽ Tu es invité sur Make Prono Great Again`   |
| Reset Password | `reset-password.html` | `Réinitialisation de ton mot de passe`         |
| Change Email   | `change-email.html`   | `Confirme ta nouvelle adresse email`           |

## Modifier un template

1. Editer le fichier HTML correspondant
2. Push sur `main`
3. Le CI deploie automatiquement les templates via `supabase/deploy-email-templates.sh`

## Variables Supabase

- `{{ .ConfirmationURL }}` — lien de confirmation/connexion
- `{{ .Token }}` — code OTP
- `{{ .SiteURL }}` — URL du site
