import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { claimPendingAssessmentForUser } from "@/lib/vitalsigns/claim-pending";

function sanitizeNextPath(nextRaw: string | null) {
  if (!nextRaw) return "/dashboard";

  // Only allow same-site relative redirects.
  // Prevent scheme-relative redirects like `//evil.com` and other non-path forms.
  if (!nextRaw.startsWith("/") || nextRaw.startsWith("//")) return "/dashboard";

  // Backslashes can be interpreted inconsistently across stacks; treat as unsafe.
  if (nextRaw.includes("\\")) return "/dashboard";

  return nextRaw;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = sanitizeNextPath(url.searchParams.get("next") ?? "/dashboard");

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("Auth callback exchange failed:", error.message);
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const claimResult = await claimPendingAssessmentForUser(user.id);
        if (claimResult.status === "error") {
          console.error("Auto-claim failed in auth callback:", claimResult.error);
        }
      }
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
