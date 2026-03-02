"use client";

import Link from "next/link";
import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type AdminContractRow = {
  id: string;
  user_id: string;
  file_name: string;
  contract_path: string;
  uploaded_at: string;
};

type AdminDocumentsClientProps = {
  initialContracts: AdminContractRow[];
};

export default function AdminDocumentsClient({ initialContracts }: AdminDocumentsClientProps) {
  const supabase = getSupabaseBrowserClient();
  const [error, setError] = useState<string | null>(null);

  async function download(contractPath: string) {
    setError(null);
    try {
      const { data, error: signedError } = await supabase.storage
        .from("contracts")
        .createSignedUrl(contractPath, 60 * 60);

      if (signedError) throw new Error(signedError.message);
      if (!data?.signedUrl) throw new Error("Unable to generate signed URL.");

      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed.");
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-[var(--font-display)] text-3xl font-black tracking-tight">
            Admin documents
          </h1>
          <p className="text-muted-foreground">
            All uploaded files visible to admins via RLS.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-[var(--font-display)] text-xl font-black">
            Uploaded contracts
          </CardTitle>
          <CardDescription>
            Download generates a 1‑hour signed URL (requires Storage policies for admins).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialContracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-mono text-xs">{contract.user_id}</TableCell>
                  <TableCell className="font-medium">{contract.file_name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(contract.uploaded_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void download(contract.contract_path)}
                    >
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

