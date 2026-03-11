"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function sanitizeNextPath(nextRaw: string | null) {
  if (!nextRaw) return "/dashboard";
  if (!nextRaw.startsWith("/") || nextRaw.startsWith("//")) return "/dashboard";
  if (nextRaw.includes("\\")) return "/dashboard";
  return nextRaw;
}

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = getSupabaseBrowserClient();

  const nextPath = sanitizeNextPath(searchParams.get("next"));
  const fromAssessment = searchParams.get("from") === "assessment";
  const loginHref = `/login?next=${encodeURIComponent(nextPath)}`;

  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function claimPendingAssessment() {
    await fetch("/api/assessment/claim", { method: "POST" }).catch(() => null);
  }

  async function signUp() {
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (!companyName.trim()) {
        throw new Error("Company name is required.");
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            company_name: companyName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      });

      if (signUpError) {
        throw new Error(signUpError.message);
      }

      if (data.session) {
        await claimPendingAssessment();
        router.push(nextPath);
        router.refresh();
        return;
      }

      setInfo(
        "Check your email to verify your account. After verifying, sign in and we will save your assessment score automatically."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <Link href="/" className="font-[var(--font-display)] text-xl font-bold tracking-tight">
          VitalSigns
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="font-[var(--font-display)] text-2xl font-black">
              Create an account
            </CardTitle>
            <CardDescription>
              Save your score, upload documents, and access your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fromAssessment && (
              <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                Create your account to unlock your assessment score.
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="company">Company name</Label>
              <Input
                id="company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                autoComplete="organization"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            {info && (
              <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                {info}
              </div>
            )}

            <Button className="w-full" onClick={signUp} disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href={loginHref} className="text-foreground underline underline-offset-4">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
