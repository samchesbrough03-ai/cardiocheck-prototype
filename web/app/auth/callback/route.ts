import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

function sanitizeNextPath(nextRaw: string | null) {
  if (!nextRaw) return "/";

  // Only allow same-site relative redirects.
  // Prevent scheme-relative redirects like `//evil.com` and other non-path forms.
  if (!nextRaw.startsWith("/") || nextRaw.startsWith("//")) return "/";

  // Backslashes can be interpreted inconsistently across stacks; treat as unsafe.
  if (nextRaw.includes("\\")) return "/";

  return nextRaw;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = sanitizeNextPath(url.searchParams.get("next"));

  if (code) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
