# Email Templates — Supabase Auth

Templates HTML pour les emails d'authentification, aux couleurs de Make Prono Great Again (navy #19194B + cream #f9f6ed).

## Comment appliquer

Dashboard Supabase : **Authentication** > **Emails** (sous Notifications)

Pour chaque template ci-dessous :
1. Copier le **subject** dans le champ "Subject"
2. Copier le contenu HTML du fichier dans le champ "Body"
3. Sauvegarder

## Templates

| Template | Fichier | Subject |
|----------|---------|---------|
| Magic Link | `magic-link.html` | `⚽ Ton lien magique — Make Prono Great Again` |
| Confirm signup | `confirm-signup.html` | `⚽ Bienvenue sur Make Prono Great Again !` |
| Invite user | `invite-user.html` | `⚽ Tu es invité sur Make Prono Great Again` |
| Reset Password | `reset-password.html` | `Réinitialisation de ton mot de passe` |
| Change Email | `change-email.html` | `Confirme ta nouvelle adresse email` |

## Variables Supabase

Les templates utilisent `{{ .ConfirmationURL }}` — c'est la variable Supabase standard injectee automatiquement.
