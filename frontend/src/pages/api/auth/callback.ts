import type { APIRoute } from "astro";
import { createSupabaseClient } from "@/lib/supabase";

export const GET: APIRoute = async (context) => {
    const code = context.url.searchParams.get("code");

    if (code) {
        const supabase = createSupabaseClient(context);
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            return context.redirect("/");
        }
    }

    return context.redirect("/?error=auth");
};
