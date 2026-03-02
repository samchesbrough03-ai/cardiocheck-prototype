import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Admin | VitalSigns",
};

export default function AdminHomePage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="font-[var(--font-display)] text-2xl font-black">
            Admin
          </CardTitle>
          <CardDescription>Phase 1 admin views.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/admin/documents">View uploaded documents</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

