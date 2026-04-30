import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Server-side admin client using the service role key.
 * Bypasses RLS — only use in trusted server actions / route handlers.
 */
export const createAdminClient = () =>
  createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
