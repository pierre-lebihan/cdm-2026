import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"
import { create } from "https://deno.land/x/djwt@v3.0.2/mod.ts"

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const TOKEN_TTL_SECONDS = 60 * 60

async function buildSigningKey(secret: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  )
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS })
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  const metabaseSiteUrl = Deno.env.get("METABASE_SITE_URL")
  const metabaseSecret = Deno.env.get("METABASE_EMBEDDING_SECRET_KEY")
  const dashboardIdRaw = Deno.env.get("METABASE_DASHBOARD_ID")

  if (
    !supabaseUrl ||
    !anonKey ||
    !serviceKey ||
    !metabaseSiteUrl ||
    !metabaseSecret ||
    !dashboardIdRaw
  ) {
    return jsonResponse({ error: "Missing required environment variables" }, 500)
  }

  const dashboardId = Number(dashboardIdRaw)
  if (!Number.isInteger(dashboardId)) {
    return jsonResponse({ error: "METABASE_DASHBOARD_ID must be an integer" }, 500)
  }

  const authHeader = req.headers.get("Authorization")
  if (!authHeader) {
    return jsonResponse({ error: "Missing Authorization header" }, 401)
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })

  const { data: userData, error: userErr } = await userClient.auth.getUser()
  if (userErr || !userData?.user) {
    return jsonResponse({ error: "Invalid session" }, 401)
  }
  const userId = userData.user.id

  let requestedTribu: string | null = null
  if (req.method === "POST") {
    try {
      const body = await req.json()
      if (typeof body?.tribu === "string" && body.tribu.trim().length > 0) {
        requestedTribu = body.tribu.trim()
      }
    } catch {
      requestedTribu = null
    }
  }

  if (!requestedTribu) {
    return jsonResponse({ error: "Missing 'tribu' in request body" }, 400)
  }

  const adminClient = createClient(supabaseUrl, serviceKey)

  const { data: members, error: membersErr } = await adminClient
    .from("group_members")
    .select("group_id")
    .eq("user_id", userId)
    .eq("status", "member")

  if (membersErr) {
    return jsonResponse({ error: membersErr.message }, 500)
  }

  const groupIds = (members ?? []).flatMap((m) =>
    m.group_id ? [m.group_id] : [],
  )

  if (groupIds.length === 0) {
    return jsonResponse({ error: "User is not member of any tribu" }, 403)
  }

  const { data: groups, error: groupsErr } = await adminClient
    .from("groups")
    .select("name")
    .in("id", groupIds)

  if (groupsErr) {
    return jsonResponse({ error: groupsErr.message }, 500)
  }

  const allowedNames = (groups ?? []).flatMap((g) => (g.name ? [g.name] : []))

  if (!allowedNames.includes(requestedTribu)) {
    return jsonResponse({ error: "User is not member of requested tribu" }, 403)
  }

  const payload = {
    resource: { dashboard: dashboardId },
    params: { tribu: requestedTribu },
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  }

  const key = await buildSigningKey(metabaseSecret)
  const token = await create({ alg: "HS256", typ: "JWT" }, payload, key)

  const baseUrl = metabaseSiteUrl.replace(/\/$/, "")
  const url =
    `${baseUrl}/embed/dashboard/${token}#bordered=false&titled=true&theme=light`

  return jsonResponse({ url, expiresIn: TOKEN_TTL_SECONDS }, 200)
})
