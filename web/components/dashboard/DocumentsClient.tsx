"use client";

import { useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type ContractRow = {
  id: string;
  file_name: string;
  contract_path: string;
  uploaded_at: string;
};

type DocumentsClientProps = {
  initialContracts: ContractRow[];
};

export default function DocumentsClient({ initialContracts }: DocumentsClientProps) {
  const supabase = getSupabaseBrowserClient();
  const [contracts, setContracts] = useState<ContractRow[]>(initialContracts);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const hasContracts = useMemo(() => contracts.length > 0, [contracts.length]);
  const maxPdfBytes = 10 * 1024 * 1024;

  async function refresh() {
    const { data: userResult } = await supabase.auth.getUser();
    if (!userResult.user) return;

    const { data, error: listError } = await supabase
      .from("contracts")
      .select("id, file_name, contract_path, uploaded_at")
      .order("uploaded_at", { ascending: false });

    if (listError) {
      setError(listError.message);
      return;
    }

    setContracts((data ?? []) as ContractRow[]);
  }

  async function upload(file: File) {
    setError(null);
    setUploading(true);

    try {
      const isPdfByMime = file.type === "application/pdf";
      const isPdfByName = file.name.toLowerCase().endsWith(".pdf");
      if (!isPdfByMime && !isPdfByName) {
        throw new Error("Please upload a PDF file.");
      }
      if (file.size > maxPdfBytes) {
        throw new Error("File is too large. Please upload a PDF under 10MB.");
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw new Error(userError.message);
      if (!user) throw new Error("Not signed in.");

      const contractId = crypto.randomUUID();
      const path = `${user.id}/${contractId}/document.pdf`;

      const { error: uploadError } = await supabase.storage
        .from("contracts")
        .upload(path, file, { upsert: false });

      if (uploadError) throw new Error(uploadError.message);

      const { error: insertError } = await supabase.from("contracts").insert({
        user_id: user.id,
        file_name: file.name,
        contract_path: path,
      });

      if (insertError) throw new Error(insertError.message);

      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-[var(--font-display)] text-2xl font-black">
            Documents
          </CardTitle>
          <CardDescription>
            Upload PDFs to your private Supabase Storage bucket.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file);
                e.currentTarget.value = "";
              }}
              disabled={uploading}
            />
            <Button variant="outline" onClick={refresh} disabled={uploading}>
              Refresh
            </Button>
          </div>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-[var(--font-display)] text-xl font-black">
            Uploaded files
          </CardTitle>
          <CardDescription>
            {hasContracts ? "Click download to generate a 1‑hour signed URL." : "No uploads yet."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasContracts ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract.id}>
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
          ) : (
            <div className="text-sm text-muted-foreground">
              Upload a PDF to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
