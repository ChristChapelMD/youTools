import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  // Use the service role key for automatic authentication if you're not using regular login
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });

  // Authenticate the predefined user automatically
  if (!cookieStore.get("sb-access-token")) {
    // Assuming you store email/password in env for predefined user
    const email = process.env.SUPABASE_USER_EMAIL!;
    const password = process.env.SUPABASE_USER_PASSWORD!;

    // Sign in automatically with the user's email and password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error("Failed to sign in automatically: " + error.message);
    }
  }

  return supabase;
}
