import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CHUNK = 2000;
const DEFAULT_WINDOW_HOURS = 48;
const DEFAULT_SITE_URL = "https://makepronogreatagain.bzh/";

function chunkExternalIds(ids: string[]): string[][] {
  const out: string[][] = [];
  for (let i = 0; i < ids.length; i += CHUNK) {
    out.push(ids.slice(i, i + CHUNK));
  }
  return out;
}

function parseWindowHours(value: string | undefined): number {
  if (!value) {
    return DEFAULT_WINDOW_HOURS;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_WINDOW_HOURS;
  }

  return parsed;
}

function isForceRequest(req: Request): boolean {
  const url = new URL(req.url);
  const force = url.searchParams.get("force");
  if (force === "true") {
    return true;
  }

  if (force === "1") {
    return true;
  }

  return false;
}

function getFinalWinnerUrl(): string {
  const siteUrl = Deno.env.get("PUBLIC_SITE_URL") ?? DEFAULT_SITE_URL;
  return `${siteUrl.replace(/\/$/, "")}/#final-winner`;
}

async function sendOneSignalToExternalIds(
  appId: string,
  apiKey: string,
  externalIds: string[],
  heading: string,
  body: string,
  url: string,
): Promise<number> {
  const chunks = chunkExternalIds(externalIds);
  for (const chunk of chunks) {
    const payload: Record<string, unknown> = {
      app_id: appId,
      target_channel: "push",
      include_aliases: { external_id: chunk },
      headings: { fr: heading, en: heading },
      contents: { fr: body, en: body },
      url,
    };

    const res = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        Authorization: `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OneSignal ${res.status}: ${text}`);
    }
  }

  return externalIds.length;
}

Deno.serve(async (req: Request) => {
  const appId = Deno.env.get("ONESIGNAL_APP_ID");
  const apiKey = Deno.env.get("ONESIGNAL_REST_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!appId || !apiKey || !supabaseUrl || !serviceKey) {
    return new Response(
      JSON.stringify({ error: "Missing OneSignal or Supabase env" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const now = new Date();
  const force = isForceRequest(req);
  const windowHours = parseWindowHours(
    Deno.env.get("FINAL_WINNER_REMINDER_WINDOW_HOURS"),
  );
  const windowEnd = new Date(now.getTime() + windowHours * 60 * 60 * 1000);
  const finalWinnerUrl = getFinalWinnerUrl();

  try {
    const { data: competitions, error: competitionsErr } = await supabase
      .from("competitions")
      .select("id, name, start_date, final_winner_reminder_sent_at")
      .eq("active", true)
      .not("start_date", "is", null);

    if (competitionsErr) {
      throw competitionsErr;
    }

    const results: Record<string, unknown>[] = [];

    for (const competition of competitions ?? []) {
      const competitionId = competition.id;
      const startDate = competition.start_date
        ? new Date(competition.start_date)
        : null;

      if (!competitionId) {
        results.push({ skipped: "no_competition_id" });
        continue;
      }

      if (!startDate) {
        results.push({ competitionId, skipped: "no_start_date" });
        continue;
      }

      if (!force && competition.final_winner_reminder_sent_at) {
        results.push({ competitionId, skipped: "already_sent" });
        continue;
      }

      if (!force && startDate <= now) {
        results.push({ competitionId, skipped: "winner_locked" });
        continue;
      }

      if (!force && startDate > windowEnd) {
        results.push({ competitionId, skipped: "outside_window" });
        continue;
      }

      const { data: profiles, error: profilesErr } = await supabase
        .from("competition_profiles")
        .select("user_id, winner_team")
        .eq("competition_id", competitionId);

      if (profilesErr) {
        throw profilesErr;
      }

      const missingWinnerIds: string[] = [];
      const selectedWinnerIds: string[] = [];

      for (const profile of profiles ?? []) {
        if (!profile.user_id) {
          continue;
        }

        if (profile.winner_team) {
          selectedWinnerIds.push(profile.user_id);
          continue;
        }

        missingWinnerIds.push(profile.user_id);
      }

      const missingNotified = await sendOneSignalToExternalIds(
        appId,
        apiKey,
        missingWinnerIds,
        "Il te manque ton vainqueur final",
        "Choisis ton vainqueur final avant le coup d’envoi pour ne pas laisser filer le bonus.",
        finalWinnerUrl,
      );

      const selectedNotified = await sendOneSignalToExternalIds(
        appId,
        apiKey,
        selectedWinnerIds,
        "Ton vainqueur final peut bouger",
        "La cote a peut-être évolué depuis ton choix. Tu peux encore changer avant le début.",
        finalWinnerUrl,
      );

      if (!force) {
        const { error: updateErr } = await supabase
          .from("competitions")
          .update({ final_winner_reminder_sent_at: now.toISOString() })
          .eq("id", competitionId);

        if (updateErr) {
          throw updateErr;
        }
      }

      results.push({
        competitionId,
        competitionName: competition.name,
        missingNotified,
        selectedNotified,
      });
    }

    return new Response(JSON.stringify({ ok: true, force, results }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
