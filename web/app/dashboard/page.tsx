import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ClaimAssessmentButton from "@/components/dashboard/ClaimAssessmentButton";

export const metadata = {
  title: "Dashboard | VitalSigns",
};

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: assessment } = user
    ? await supabase
        .from("assessment_responses")
        .select("score, created_at")
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

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
          <CardTitle className="font-[var(--font-display)] text-2xl font-black">
            Your score
          </CardTitle>
          <CardDescription>
            Saved scores come from completed assessments tied to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {assessment ? (
            <div className="flex items-end gap-4">
              <div className="font-[var(--font-display)] text-6xl font-black tracking-tight">
                {assessment.score}
              </div>
              <Badge variant="secondary" className="w-fit">
                {new Date(assessment.created_at).toLocaleDateString()}
              </Badge>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                No saved score yet. If you completed the assessment on this browser, you can save it now.
              </div>
              <ClaimAssessmentButton />
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/results">View browser results</Link>
            </Button>
            <Button asChild>
              <Link href="/assessment">Take assessment</Link>
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
