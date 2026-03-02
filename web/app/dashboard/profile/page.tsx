import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Profile | VitalSigns",
};

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("users").select("company_name, role, created_at").eq("id", user.id).maybeSingle()
    : { data: null };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-[var(--font-display)] text-2xl font-black">
          Profile
        </CardTitle>
        <CardDescription>Account details pulled from Supabase.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div>
          <span className="text-muted-foreground">Email:</span> {user?.email ?? "—"}
        </div>
        <div>
          <span className="text-muted-foreground">Company:</span>{" "}
          {profile?.company_name ?? "—"}
        </div>
        <div>
          <span className="text-muted-foreground">Role:</span> {profile?.role ?? "—"}
        </div>
        <div>
          <span className="text-muted-foreground">Created:</span>{" "}
          {profile?.created_at ? new Date(profile.created_at).toLocaleString() : "—"}
        </div>
      </CardContent>
    </Card>
  );
}

