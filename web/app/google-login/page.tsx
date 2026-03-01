import GoogleLoginDemo from "./GoogleLoginDemo";
import { createServerSupabaseClient } from "@/lib/supabase/server-client";

export default async function GoogleLoginPage() {
    const supabase = await createServerSupabaseClient();
    const { 
        data: { user },
    } = await supabase.auth.getUser();

    return <GoogleLoginDemo user={user} />;

}
