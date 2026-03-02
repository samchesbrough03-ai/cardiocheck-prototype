import { createServerSupabaseClient } from "@/lib/supabase/server-client";
import AdminDocumentsClient, { type AdminContractRow } from "@/components/admin/AdminDocumentsClient";

export const metadata = {
  title: "Admin Documents | VitalSigns",
};

export default async function AdminDocumentsPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("contracts")
    .select("id, user_id, file_name, contract_path, uploaded_at")
    .order("uploaded_at", { ascending: false });

  return <AdminDocumentsClient initialContracts={(data ?? []) as AdminContractRow[]} />;
}

