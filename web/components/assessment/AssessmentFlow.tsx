"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QUESTIONS, VITALS } from "@/lib/vitalsigns/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type AssessmentMode = "intro" | "questions" | "capture" | "submitting";

export default function AssessmentFlow() {
  const router = useRouter();
  const totalQuestions = QUESTIONS.length;

  const [mode, setMode] = useState<AssessmentMode>("intro");
  const [step, setStep] = useState(0); // 0-based question index
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = mode === "questions" ? QUESTIONS[step] : null;
  const currentVital = useMemo(() => {
    if (!currentQuestion) return null;
    return VITALS.find((vital) => vital.id === currentQuestion.vital) ?? null;
  }, [currentQuestion]);

  const progressValue =
    mode !== "questions" ? 0 : Math.round(((step + 1) / totalQuestions) * 100);

  function start() {
    setError(null);
    setMode("questions");
    setStep(0);
  }

  function goBack() {
    setError(null);
    if (mode === "capture") {
      setMode("questions");
      setStep(totalQuestions - 1);
      return;
    }

    if (mode === "questions") {
      if (step === 0) {
        setMode("intro");
      } else {
        setStep((prev) => Math.max(0, prev - 1));
      }
    }
  }

  function handleAnswer(optionIndex: number) {
    if (!currentQuestion) return;

    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionIndex }));
    setError(null);

    if (step < totalQuestions - 1) {
      setStep((prev) => prev + 1);
    } else {
      setMode("capture");
    }
  }

  async function submit() {
    setError(null);
    setMode("submitting");

    try {
      const response = await fetch("/api/assessment/pending", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          responses: answers,
          email: email.trim() || null,
          company_name: companyName.trim() || null,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? "Failed to submit assessment.");
      }

      router.push("/results");
      router.refresh();
    } catch (err) {
      setMode("capture");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <Link href="/" className="font-[var(--font-display)] text-lg font-bold tracking-tight">
            VitalSigns
          </Link>
          <Button variant="ghost" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-10">
        {mode === "intro" && (
          <Card>
            <CardHeader>
              <CardTitle className="font-[var(--font-display)] text-3xl font-black">
                Legal Health Score
              </CardTitle>
              <CardDescription>
                Answer 15 questions. Get your score instantly — no account required.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Card className="border-dashed">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-[var(--font-display)] text-2xl">10 mins</CardTitle>
                    <CardDescription>to complete</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="border-dashed">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-[var(--font-display)] text-2xl">15</CardTitle>
                    <CardDescription>questions</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="border-dashed">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-[var(--font-display)] text-2xl">Free</CardTitle>
                    <CardDescription>no account</CardDescription>
                  </CardHeader>
                </Card>
              </div>
              <Button size="lg" onClick={start}>
                Start assessment
              </Button>
            </CardContent>
          </Card>
        )}

        {mode === "questions" && currentQuestion && (
          <Card>
            <CardHeader className="space-y-4">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <CardTitle className="font-[var(--font-display)] text-2xl font-black">
                    Question {step + 1} of {totalQuestions}
                  </CardTitle>
                  <CardDescription>Pick the option that best matches your situation.</CardDescription>
                </div>
                {currentVital && (
                  <Badge
                    variant="secondary"
                    className="w-fit"
                    style={{ borderColor: `${currentVital.accentColor}40` }}
                  >
                    {currentVital.name}
                  </Badge>
                )}
              </div>

              <Progress value={progressValue} />
              <div className="text-sm text-muted-foreground">
                {progressValue}% complete
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-lg font-semibold">{currentQuestion.text}</div>
              <div className="grid gap-2">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={option}
                    variant="outline"
                    className="h-auto justify-start whitespace-normal py-3 text-left"
                    onClick={() => handleAnswer(index)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2">
                <Button variant="ghost" onClick={goBack}>
                  Back
                </Button>
                <div className="text-xs text-muted-foreground">
                  Answers are stored in this browser until you create an account.
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {mode === "capture" && (
          <Card>
            <CardHeader>
              <CardTitle className="font-[var(--font-display)] text-2xl font-black">
                Almost done
              </CardTitle>
              <CardDescription>
                Enter your email to view results. Create an account later to save your score.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company">Company name (optional)</Label>
                <Input
                  id="company"
                  placeholder="Acme Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button variant="ghost" onClick={goBack}>
                  Back
                </Button>
                <Button onClick={submit}>View results</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {mode === "submitting" && (
          <Card>
            <CardHeader>
              <CardTitle className="font-[var(--font-display)] text-2xl font-black">
                Calculating…
              </CardTitle>
              <CardDescription>
                Saving your score securely for this browser session.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={95} />
              <div className="text-sm text-muted-foreground">
                This can take a few seconds.
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

