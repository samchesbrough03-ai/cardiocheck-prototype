import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

export const metadata = {
  title: "Results | VitalSigns",
};

export default async function ResultsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  redirect("/login?next=/dashboard&fresh=1");
}
