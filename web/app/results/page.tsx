import Link from "next/link";
import { cookies } from "next/headers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import {
  PENDING_ASSESSMENT_COOKIE,
  sha256ByteaLiteral,
} from "@/lib/vitalsigns/pending-session";
import { VITALS, type VitalId } from "@/lib/vitalsigns/constants";
import { scoreLabel } from "@/lib/vitalsigns/scoring";

export const metadata = {
  title: "Results | VitalSigns",
};

type Breakdown = Partial<Record<VitalId, number>>;

function sanitizeBreakdown(value: unknown): Breakdown {
  if (!value || typeof value !== "object") return {};
  const record = value as Record<string, unknown>;
  const result: Breakdown = {};

  for (const vital of VITALS) {
    const maybeScore = record[vital.id];
    if (typeof maybeScore === "number" && Number.isFinite(maybeScore)) {
      result[vital.id] = Math.max(0, Math.min(100, Math.round(maybeScore)));
    }
  }

  return result;
}

export default async function ResultsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(PENDING_ASSESSMENT_COOKIE)?.value ?? null;

  if (!token) {
    return (
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="font-[var(--font-display)] text-2xl font-black">
              No results found
            </CardTitle>
            <CardDescription>
              This browser doesn’t have an active assessment session.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button asChild>
              <Link href="/assessment">Take free assessment</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Back to home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  let score: number | null = null;
  let breakdown: Breakdown = {};
  let createdAt: string | null = null;
  let loadError: string | null = null;

  try {
    const admin = createSupabaseAdminClient();
    const hash = sha256ByteaLiteral(token);

    const { data, error } = await admin
      .from("pending_assessments")
      .select("score, breakdown, created_at")
      .eq("session_token_hash", hash)
      .maybeSingle();

    if (error) {
      loadError = error.message;
    } else if (!data) {
      loadError = "Your assessment session has expired or could not be found.";
    } else {
      score = typeof data.score === "number" ? data.score : null;
      breakdown = sanitizeBreakdown(data.breakdown);
      createdAt = typeof data.created_at === "string" ? data.created_at : null;
    }
  } catch (err) {
    loadError =
      err instanceof Error ? err.message : "Unable to load assessment results.";
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <Link
            href="/"
            className="font-[var(--font-display)] text-lg font-bold tracking-tight"
          >
            VitalSigns
          </Link>
          <Button variant="ghost" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-10">
        <Card>
          <CardHeader>
            <CardTitle className="font-[var(--font-display)] text-3xl font-black">
              Your Legal Health Score
            </CardTitle>
            <CardDescription>
              Based on your self‑reported answers. Create an account to save results and
              upload contracts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loadError ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {loadError}
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="font-[var(--font-display)] text-6xl font-black tracking-tight">
                      {score ?? "—"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {score == null ? "Score unavailable" : scoreLabel(score)}
                    </div>
                  </div>
                  {createdAt && (
                    <Badge variant="secondary" className="w-fit">
                      {new Date(createdAt).toLocaleString()}
                    </Badge>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {VITALS.map((vital) => {
                    const vitalScore = breakdown[vital.id] ?? null;
                    return (
                      <Card key={vital.id} className="border-dashed">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ background: vital.accentColor }}
                              aria-hidden="true"
                            />
                            {vital.name}
                          </CardTitle>
                          <CardDescription>{vital.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="text-2xl font-semibold">
                            {vitalScore ?? "—"}
                            {typeof vitalScore === "number" ? "/100" : ""}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/register">Create account</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/assessment">Retake assessment</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

