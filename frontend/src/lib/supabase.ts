import { createServerClient, createBrowserClient, type CookieOptions } from "@supabase/ssr";
import { parse } from "cookie";

export const createSupabaseClient = (context: { request: Request; cookies: any }) => {
    return createServerClient(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_ANNON_KEY, {
        cookies: {
            getAll() {
                const cookieHeader = context.request.headers.get("Cookie") ?? "";
                const parsedCookies = parse(cookieHeader);
                return Object.entries(parsedCookies).map(([name, value]) => ({
                    name,
                    value: value ?? ""
                }));
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) =>
                    context.cookies.set(name, value, options as CookieOptions)
                );
            }
        }
    });
};

export const createBrowserSupabaseClient = () => {
    return createBrowserClient(
        import.meta.env.PUBLIC_SUPABASE_URL || import.meta.env.SUPABASE_URL,
        import.meta.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANNON_KEY
    );
};
