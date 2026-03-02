import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { PENDING_ASSESSMENT_COOKIE, sha256ByteaLiteral } from "@/lib/vitalsigns/pending-session";

export async function POST() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(PENDING_ASSESSMENT_COOKIE)?.value ?? null;
  if (!token) {
    return NextResponse.json({ error: "No pending assessment cookie." }, { status: 400 });
  }

  const tokenHash = sha256ByteaLiteral(token);

  let pending:
    | { responses: Record<string, unknown>; score: number; breakdown: Record<string, unknown> | null }
    | null = null;

  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("pending_assessments")
      .select("responses, score, breakdown")
      .eq("session_token_hash", tokenHash)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json(
        { error: "Pending assessment not found or expired." },
        { status: 404 }
      );
    }

    pending = data;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unable to load pending assessment." },
      { status: 500 }
    );
  }

  const upsertResult = await supabase.from("assessment_responses").upsert(
    {
      user_id: user.id,
      responses: pending.responses,
      score: pending.score,
      breakdown: pending.breakdown ?? null,
    },
    { onConflict: "user_id" }
  );

  if (upsertResult.error) {
    return NextResponse.json({ error: upsertResult.error.message }, { status: 500 });
  }

  try {
    const admin = createSupabaseAdminClient();
    await admin.from("pending_assessments").delete().eq("session_token_hash", tokenHash);
  } catch {
    // Non-fatal: the pending row is protected and expires automatically.
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(PENDING_ASSESSMENT_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}

