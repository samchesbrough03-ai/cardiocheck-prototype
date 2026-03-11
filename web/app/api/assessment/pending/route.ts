import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import {
  createPendingAssessmentToken,
  PENDING_ASSESSMENT_COOKIE,
  PENDING_ASSESSMENT_MAX_AGE_SECONDS,
  sha256ByteaLiteral,
} from "@/lib/vitalsigns/pending-session";
import { QUESTIONS } from "@/lib/vitalsigns/constants";
import { calculateScores } from "@/lib/vitalsigns/scoring";

type PendingAssessmentBody = {
  responses?: Record<string, unknown>;
  [key: string]: unknown;
};

function sanitizeResponses(input: unknown) {
  const raw = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const sanitized: Record<string, number> = {};

  for (const question of QUESTIONS) {
    const value = raw[question.id];
    if (typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 3) {
      sanitized[question.id] = value;
    }
  }

  return sanitized;
}

export async function POST(request: NextRequest) {
  let body: PendingAssessmentBody;
  try {
    body = (await request.json()) as PendingAssessmentBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const responses = sanitizeResponses(body.responses);
  if (Object.keys(responses).length !== QUESTIONS.length) {
    return NextResponse.json(
      { error: "Assessment responses are incomplete." },
      { status: 400 }
    );
  }

  const scores = calculateScores(responses);
  const overallScore = Math.round(scores.overall);

  // If the browser already has a pending token, reuse it so repeated submissions
  // overwrite the same DB row (reduces orphaned pending rows).
  const existingToken = request.cookies.get(PENDING_ASSESSMENT_COOKIE)?.value ?? null;
  const token = existingToken && existingToken.length >= 16 ? existingToken : createPendingAssessmentToken();
  const tokenHash = sha256ByteaLiteral(token);

  try {
    const admin = createSupabaseAdminClient();

    const { error } = await admin.from("pending_assessments").upsert(
      {
        session_token_hash: tokenHash,
        responses,
        score: overallScore,
        breakdown: scores.vitalScores,
      },
      { onConflict: "session_token_hash" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Unable to save assessment results.",
      },
      { status: 500 }
    );
  }

  // Do not return score data pre-auth. Scores are revealed only after
  // claim + authenticated dashboard load.
  const response = NextResponse.json({ ok: true });
  response.cookies.set(PENDING_ASSESSMENT_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PENDING_ASSESSMENT_MAX_AGE_SECONDS,
  });

  return response;
}
