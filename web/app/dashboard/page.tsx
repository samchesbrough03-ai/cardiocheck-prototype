import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VITALS, type VitalId } from "@/lib/vitalsigns/constants";
import { scoreLabel } from "@/lib/vitalsigns/scoring";

export const metadata = {
  title: "Dashboard | VitalSigns",
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

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: assessment } = user
    ? await supabase
        .from("assessment_responses")
        .select("score, breakdown, created_at")
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  const score = typeof assessment?.score === "number" ? assessment.score : null;
  const breakdown = sanitizeBreakdown(assessment?.breakdown);
  const createdAt = typeof assessment?.created_at === "string" ? assessment.created_at : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[var(--font-display)] text-3xl font-black tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Upload documents, track your score, and prepare for due diligence.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/documents">Upload documents</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-[var(--font-display)] text-3xl font-black">
            Your Legal Health Score
          </CardTitle>
          <CardDescription>
            Your assessment score and breakdown are available here once you sign in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {assessment ? (
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
          ) : (
            <div className="text-sm text-muted-foreground">
              No saved score yet. Complete the assessment and create or sign in to an account to
              view results here.
            </div>
          )}

          <div className="flex gap-3">
            <Button asChild>
              <Link href="/assessment">Retake assessment</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-[var(--font-display)] text-xl font-black">
              Document vault
            </CardTitle>
            <CardDescription>
              Upload contracts and keep everything in one place.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/documents">Manage documents</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-[var(--font-display)] text-xl font-black">
              Next steps
            </CardTitle>
            <CardDescription>
              Phase 2 will add AI clause analysis and a remediation roadmap.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link href="/">Back to marketing</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
