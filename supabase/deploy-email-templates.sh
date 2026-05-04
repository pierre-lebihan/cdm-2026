#!/usr/bin/env bash
set -euo pipefail

: "${SUPABASE_ACCESS_TOKEN:?Missing SUPABASE_ACCESS_TOKEN}"
: "${SUPABASE_PROJECT_ID:?Missing SUPABASE_PROJECT_ID}"

TEMPLATES_DIR="$(cd "$(dirname "$0")/email-templates" && pwd)"
SESSION_TIMEBOX_SECONDS=$((90 * 24 * 60 * 60))

read_template() {
  local file="$TEMPLATES_DIR/$1"
  if [ ! -f "$file" ]; then
    echo "ERROR: Template file not found: $file" >&2
    exit 1
  fi
  cat "$file"
}

MAGIC_LINK=$(read_template "magic-link.html")
CONFIRMATION=$(read_template "confirm-signup.html")
INVITE=$(read_template "invite-user.html")
RECOVERY=$(read_template "reset-password.html")
EMAIL_CHANGE=$(read_template "change-email.html")

PAYLOAD=$(jq -n \
  --arg magic_link_subject "⚽ Ton lien magique — Make Prono Great Again" \
  --arg magic_link_content "$MAGIC_LINK" \
  --arg confirmation_subject "⚽ Bienvenue sur Make Prono Great Again !" \
  --arg confirmation_content "$CONFIRMATION" \
  --arg invite_subject "⚽ Tu es invité sur Make Prono Great Again" \
  --arg invite_content "$INVITE" \
  --arg recovery_subject "Réinitialisation de ton mot de passe" \
  --arg recovery_content "$RECOVERY" \
  --arg email_change_subject "Confirme ta nouvelle adresse email" \
  --arg email_change_content "$EMAIL_CHANGE" \
  --argjson sessions_timebox "$SESSION_TIMEBOX_SECONDS" \
  '{
    sessions_timebox: $sessions_timebox,
    mailer_subjects_magic_link: $magic_link_subject,
    mailer_templates_magic_link_content: $magic_link_content,
    mailer_subjects_confirmation: $confirmation_subject,
    mailer_templates_confirmation_content: $confirmation_content,
    mailer_subjects_invite: $invite_subject,
    mailer_templates_invite_content: $invite_content,
    mailer_subjects_recovery: $recovery_subject,
    mailer_templates_recovery_content: $recovery_content,
    mailer_subjects_email_change: $email_change_subject,
    mailer_templates_email_change_content: $email_change_content
  }')

echo "Deploying auth config to project $SUPABASE_PROJECT_ID..."

HTTP_CODE=$(curl -s -o /tmp/supabase-auth-config-response.json -w "%{http_code}" \
  -X PATCH "https://api.supabase.com/v1/projects/$SUPABASE_PROJECT_ID/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  echo "Auth config deployed successfully (HTTP $HTTP_CODE)"
else
  echo "ERROR: Failed to deploy auth config (HTTP $HTTP_CODE)" >&2
  cat /tmp/supabase-auth-config-response.json >&2
  exit 1
fi
