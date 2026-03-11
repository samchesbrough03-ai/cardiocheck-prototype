import "server-only";

import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { PENDING_ASSESSMENT_COOKIE, sha256ByteaLiteral } from "@/lib/vitalsigns/pending-session";

export type ClaimPendingAssessmentStatus = "claimed" | "no_cookie" | "not_found" | "error";

export type ClaimPendingAssessmentResult = {
  status: ClaimPendingAssessmentStatus;
  error?: string;
};

async function clearPendingAssessmentCookie() {
  const cookieStore = await cookies();
  cookieStore.set(PENDING_ASSESSMENT_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function claimPendingAssessmentForUser(
  userId: string
): Promise<ClaimPendingAssessmentResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(PENDING_ASSESSMENT_COOKIE)?.value ?? null;

    if (!token) {
      return { status: "no_cookie" };
    }

    const tokenHash = sha256ByteaLiteral(token);
    const admin = createSupabaseAdminClient();

    const { data: pending, error: pendingError } = await admin
      .from("pending_assessments")
      .select("responses, score, breakdown")
      .eq("session_token_hash", tokenHash)
      .maybeSingle();

    if (pendingError) {
      return { status: "error", error: pendingError.message };
    }

    if (!pending) {
      await clearPendingAssessmentCookie();
      return { status: "not_found" };
    }

    const { error: upsertError } = await admin.from("assessment_responses").upsert(
      {
        user_id: userId,
        responses: pending.responses,
        score: pending.score,
        breakdown: pending.breakdown ?? null,
      },
      { onConflict: "user_id" }
    );

    if (upsertError) {
      return { status: "error", error: upsertError.message };
    }

    await admin.from("pending_assessments").delete().eq("session_token_hash", tokenHash);
    await clearPendingAssessmentCookie();

    return { status: "claimed" };
  } catch (err) {
    return { status: "error", error: err instanceof Error ? err.message : "Unable to claim assessment." };
  }
}
