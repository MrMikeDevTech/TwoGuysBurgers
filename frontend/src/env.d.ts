/* eslint-disable no-unused-vars */

/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly SUPABASE_URL: string;
    readonly SUPABASE_ANNON_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare namespace App {
    interface Locals {
        user: import("@supabase/supabase-js").User | null;
        supabase: import("@supabase/supabase-js").SupabaseClient;
        isAdmin: boolean;
    }
}
