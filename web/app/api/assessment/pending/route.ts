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
  email?: string | null;
  company_name?: string | null;
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
  const token = createPendingAssessmentToken();
  const tokenHash = sha256ByteaLiteral(token);

  try {
    const admin = createSupabaseAdminClient();

    const { error } = await admin.from("pending_assessments").insert({
      session_token_hash: tokenHash,
      responses,
      score: overallScore,
      breakdown: scores.vitalScores,
    });

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

  const response = NextResponse.json({ ok: true, scores: { ...scores, overall: overallScore } });
  response.cookies.set(PENDING_ASSESSMENT_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PENDING_ASSESSMENT_MAX_AGE_SECONDS,
  });

  return response;
}

