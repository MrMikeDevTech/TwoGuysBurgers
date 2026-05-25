import { defineMiddleware } from "astro:middleware";
import { createSupabaseClient } from "@/lib/supabase";
import { isAdmin } from "@/services/Auth";

const protectedRoutes = ["/admin"];
const authRoutes = ["/login"];

export const onRequest = defineMiddleware(async (context, next) => {
    const { url, redirect, locals } = context;
    const { pathname } = url;

    const supabase = createSupabaseClient(context);

    const {
        data: { user }
    } = await supabase.auth.getUser();

    const {
        data: { session }
    } = await supabase.auth.getSession();

    const token = session?.access_token;

    locals.user = user;
    locals.supabase = supabase;
    locals.isAdmin = false;
    locals.token = token;

    if (token) {
        locals.isAdmin = await isAdmin(token);
    }

    if (protectedRoutes.some((route) => pathname.startsWith(route))) {
        if (!user || !locals.isAdmin) return redirect("/");
    }

    if (authRoutes.some((route) => pathname.startsWith(route))) {
        if (user) return redirect("/");
    }

    return next();
});
