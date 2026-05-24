import type { APIRoute } from "astro";
import { createSupabaseClient } from "@/lib/supabase";

export const GET: APIRoute = async (context) => {
    const supabase = createSupabaseClient(context);

    const host = context.request.headers.get("host") || context.url.host;
    const protocol = host.includes("localhost") ? "http" : "https";
    const origin = `${protocol}://${host}`;

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${origin}/api/auth/callback`
        }
    });

    if (error) {
        return new Response(error.message, { status: 500 });
    }

    return context.redirect(data.url);
};
