import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import DocumentsClient, { type ContractRow } from "@/components/dashboard/DocumentsClient";

export const metadata = {
  title: "Documents | VitalSigns",
};

export default async function DocumentsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = user
    ? await supabase
        .from("contracts")
        .select("id, file_name, contract_path, uploaded_at")
        .order("uploaded_at", { ascending: false })
    : { data: [] };

  return <DocumentsClient initialContracts={(data ?? []) as ContractRow[]} />;
}

