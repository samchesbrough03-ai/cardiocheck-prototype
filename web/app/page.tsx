import { redirect } from "next/navigation";
import VitalSignsLanding from "@/components/marketing/VitalSignsLanding";

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function toQueryString(searchParams: SearchParams) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    const firstValue = firstParam(value);
    if (typeof firstValue === "string" && firstValue.length > 0) {
      params.set(key, firstValue);
    }
  }

  return params.toString();
}

export default function MarketingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const code = firstParam(searchParams.code);

  // If an OAuth provider sends users to the site root with `?code=...`,
  // forward to the canonical callback route to exchange the code.
  if (typeof code === "string" && code.length > 0) {
    const queryString = toQueryString(searchParams);
    redirect(`/auth/callback${queryString ? `?${queryString}` : ""}`);
  }

  return <VitalSignsLanding />;
}
