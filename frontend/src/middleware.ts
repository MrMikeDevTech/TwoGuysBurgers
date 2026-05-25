import { defineMiddleware } from "astro:middleware";
import { createSupabaseClient } from "@/lib/supabase";
import { burgers, compartibles, combos } from "@/data/products";
import { isAdmin } from "@/services/Auth";

const protectedRoutes = ["/admin"];
const authRoutes = ["/login"];

const slugify = (text: string) =>
    text
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");

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

    // console.log(token);

    locals.user = user;
    locals.supabase = supabase;
    locals.isAdmin = false;

    if (token) {
        locals.isAdmin = await isAdmin(token);
    }

    if (pathname.startsWith("/menu/")) {
        const productId = pathname.split("/").pop();
        const allProducts = [...burgers, ...compartibles, ...combos];
        const isValidProduct = allProducts.some((b) => slugify(b.name) === productId);

        if (!isValidProduct) return redirect("/");
    }

    if (protectedRoutes.some((route) => pathname.startsWith(route))) {
        if (!user || !locals.isAdmin) return redirect("/");
    }

    if (authRoutes.some((route) => pathname.startsWith(route))) {
        if (user) return redirect("/");
    }

    return next();
});
