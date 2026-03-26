import "jsr:@supabase/functions-js/edge-runtime.d.ts";

function readBroadcastBody(raw: unknown): {
  heading?: string;
  message: string;
  url?: string;
} | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }
  const message = Reflect.get(raw, "message");
  if (typeof message !== "string" || message.length === 0) {
    return null;
  }
  const heading = Reflect.get(raw, "heading");
  const url = Reflect.get(raw, "url");
  return {
    message,
    heading: typeof heading === "string" ? heading : undefined,
    url: typeof url === "string" ? url : undefined,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const secret = Deno.env.get("NOTIFY_BROADCAST_SECRET");
  const headerSecret = req.headers.get("x-mpga-broadcast-secret");
  if (!secret || headerSecret !== secret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const appId = Deno.env.get("ONESIGNAL_APP_ID");
  const apiKey = Deno.env.get("ONESIGNAL_REST_API_KEY");
  if (!appId || !apiKey) {
    return new Response(
      JSON.stringify({ error: "Missing OneSignal env" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = readBroadcastBody(raw);
  if (!parsed) {
    return new Response(JSON.stringify({ error: "message required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const heading = parsed.heading ?? "Make Prono Great Again";

  const payload: Record<string, unknown> = {
    app_id: appId,
    target_channel: "push",
    included_segments: ["Subscribed Users"],
    headings: { fr: heading, en: heading },
    contents: { fr: parsed.message, en: parsed.message },
  };

  if (parsed.url) {
    payload.url = parsed.url;
  }

  const res = await fetch("https://api.onesignal.com/notifications", {
    method: "POST",
    headers: {
      Authorization: `Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) {
    return new Response(
      JSON.stringify({ error: "OneSignal error", status: res.status, body: text }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }

  return new Response(text, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
