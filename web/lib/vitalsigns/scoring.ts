import { QUESTIONS, type VitalId, VITALS } from "./constants";

export type ScoreResult = {
  overall: number;
  vitalScores: Record<VitalId, number>;
};

const ANSWER_MULTIPLIERS = [1, 0.75, 0.35, 0] as const;

export function calculateScores(answers: Record<string, number>): ScoreResult {
  const vitalScores = {} as Record<VitalId, number>;

  for (const vital of VITALS) {
    const questions = QUESTIONS.filter((question) => question.vital === vital.id);
    let totalWeight = 0;
    let earned = 0;

    for (const question of questions) {
      totalWeight += question.weight;
      const answerIndex = answers[question.id];
      const multiplier =
        typeof answerIndex === "number"
          ? (ANSWER_MULTIPLIERS[answerIndex] ?? 0)
          : 0;
      earned += question.weight * multiplier;
    }

    const score = totalWeight ? (earned / totalWeight) * 100 : 0;
    vitalScores[vital.id] = Math.round(score);
  }

  const overall =
    Math.round(
      (Object.values(vitalScores).reduce((sum, value) => sum + value, 0) /
        VITALS.length) *
        10
    ) / 10;

  return { overall, vitalScores };
}

export function scoreLabel(score: number) {
  if (score >= 75) return "Strong";
  if (score >= 55) return "Moderate";
  return "At risk";
}

