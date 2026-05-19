import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DEFAULT_SITE_URL = 'https://makepronogreatagain.bzh'

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email)
}

function getRequestEmail(body: unknown): string {
  if (!body || typeof body !== 'object') {
    return ''
  }

  if (!('email' in body) || typeof body.email !== 'string') {
    return ''
  }

  return normalizeEmail(body.email)
}

function getSiteUrl(): string {
  const configuredUrl = Deno.env.get('PUBLIC_SITE_URL')
  if (configuredUrl) {
    return configuredUrl
  }

  return DEFAULT_SITE_URL
}

function getPasswordSetupRedirectUrl(): string {
  return new URL('/auth/set-password', getSiteUrl()).toString()
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !serviceKey) {
    return jsonResponse({ error: 'Missing Supabase env' }, 500)
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }

  const email = getRequestEmail(body)
  if (!isValidEmail(email)) {
    return jsonResponse({ error: 'Invalid email' }, 400)
  }

  const supabase = createClient(supabaseUrl, serviceKey)
  const { data: exists, error: existsError } = await supabase.rpc(
    'auth_email_exists',
    { p_email: email },
  )

  if (existsError) {
    return jsonResponse({ error: existsError.message }, 500)
  }

  if (exists === true) {
    return jsonResponse({ error: 'Email already exists' }, 409)
  }

  const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
    email,
    { redirectTo: getPasswordSetupRedirectUrl() },
  )

  if (inviteError) {
    return jsonResponse({ error: inviteError.message }, 500)
  }

  return jsonResponse({ status: 'created' }, 200)
})
