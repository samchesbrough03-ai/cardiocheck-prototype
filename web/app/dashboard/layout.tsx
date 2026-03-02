import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import SignOutButton from "@/components/dashboard/SignOutButton";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("company_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const isAdmin = profile?.role === "admin";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href="/dashboard"
            className="font-[var(--font-display)] text-lg font-bold tracking-tight"
          >
            VitalSigns
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/assessment">Retake assessment</Link>
            </Button>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 md:grid-cols-[240px_1fr]">
        <aside className="space-y-2">
          <div className="rounded-lg border bg-card p-4 text-sm">
            <div className="text-muted-foreground">Signed in as</div>
            <div className="truncate font-medium">{user.email}</div>
            {profile?.company_name ? (
              <div className="truncate text-muted-foreground">
                {profile.company_name}
              </div>
            ) : null}
          </div>

          <nav className="rounded-lg border bg-card p-2">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/dashboard">Overview</Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/dashboard/documents">Documents</Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/dashboard/profile">Profile</Link>
            </Button>
            {isAdmin ? (
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/admin/documents">Admin: documents</Link>
              </Button>
            ) : null}
          </nav>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

