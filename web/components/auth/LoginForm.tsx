"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginForm() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      router.push("/dashboard");
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
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
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
              {loading ? "Signing in…" : "Sign in"}
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
              <Link href="/register" className="text-foreground underline underline-offset-4">
                Create one
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

