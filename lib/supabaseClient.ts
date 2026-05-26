import { createBrowserClient } from "@supabase/ssr";

// createBrowserClient stores the session in cookies (not localStorage),
// so server-side API routes can read the session via createServerClient.
export const supabaseClient = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
