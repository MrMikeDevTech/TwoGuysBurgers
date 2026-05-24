import { defineMiddleware } from "astro:middleware";
import { createSupabaseClient } from "@/lib/supabase";
import { burgers, compartibles, combos } from "@/data/products";
import { isAdmin } from "@/services/Auth";

async function IsAdminUser() {
    const { isAdmin: isAdminResponse } = await isAdmin();
    return isAdminResponse;
}

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

    locals.user = user;
    locals.supabase = supabase;

    if (pathname.startsWith("/menu/")) {
        const productId = pathname.split("/").pop();
        const allProducts = [...burgers, ...compartibles, ...combos];
        const isValidProduct = allProducts.some((b) => slugify(b.name) === productId);

        if (!isValidProduct) return redirect("/");
    }

    if (protectedRoutes.some((route) => pathname.startsWith(route))) {
        if (!user || !IsAdminUser()) return redirect("/");
    }

    if (authRoutes.some((route) => pathname.startsWith(route))) {
        if (user) return redirect("/");
    }

    return next();
});
