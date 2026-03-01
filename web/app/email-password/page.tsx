import EmailPasswordDemo from "./EmailPasswordDemo";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

export default async function EmailPasswordPage() {
    const supabase = await createServerSupabaseClient();
    const { 
        data: { user },
    } = await supabase.auth.getUser();

    return <EmailPasswordDemo user={user} />;

}
