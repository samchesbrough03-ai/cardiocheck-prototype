"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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

const PRODUCTION_APP_ORIGIN = "https://www.fivevitals.co.uk";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = getSupabaseBrowserClient();
  const freshHandledRef = useRef(false);

  const nextPath = sanitizeNextPath(searchParams.get("next"));
  const freshLoginRequired = searchParams.get("fresh") === "1";
  const registerHref = `/register?next=${encodeURIComponent(nextPath)}`;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!freshLoginRequired || freshHandledRef.current) return;
    freshHandledRef.current = true;
    void supabase.auth.signOut().catch(() => null);
  }, [freshLoginRequired, supabase]);

  async function claimPendingAssessment() {
    await fetch("/api/assessment/claim", { method: "POST" }).catch(() => null);
  }

  async function signIn() {
    setError(null);
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      await claimPendingAssessment();
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setError(null);
    setLoading(true);
    try {
      const isLocalhost =
        window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const callbackOrigin = isLocalhost ? window.location.origin : PRODUCTION_APP_ORIGIN;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${callbackOrigin}/auth/callback?next=${encodeURIComponent("/dashboard")}`,
        },
      });
      if (oauthError) throw new Error(oauthError.message);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Unable to sign in with Google.");
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
              Sign in
            </CardTitle>
            <CardDescription>
              Access your dashboard and document vault.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {freshLoginRequired && (
              <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                Please sign in to continue to your dashboard.
              </div>
            )}

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
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button className="w-full" onClick={signIn} disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={signInWithGoogle}
              disabled={loading}
            >
              Continue with Google
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              No account?{" "}
              <Link href={registerHref} className="text-foreground underline underline-offset-4">
                Create one
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
