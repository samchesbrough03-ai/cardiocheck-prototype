import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { claimPendingAssessmentForUser } from "@/lib/vitalsigns/claim-pending";

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

  const result = await claimPendingAssessmentForUser(user.id);

  if (result.status === "claimed") {
    return NextResponse.json({ ok: true });
  }
  if (result.status === "no_cookie") {
    return NextResponse.json({ error: "No pending assessment cookie." }, { status: 400 });
  }
  if (result.status === "not_found") {
    return NextResponse.json(
      { error: "Pending assessment not found or expired." },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { error: result.error ?? "Unable to load pending assessment." },
    { status: 500 }
  );
}
