import "server-only";

import crypto from "node:crypto";

export const PENDING_ASSESSMENT_COOKIE = "vs_pending_assessment";
export const PENDING_ASSESSMENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function createPendingAssessmentToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function sha256ByteaLiteral(value: string) {
  const hex = crypto.createHash("sha256").update(value, "utf8").digest("hex");
  return `\\x${hex}`;
}

