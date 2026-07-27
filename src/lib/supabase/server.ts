import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseConfig } from "./config";

export async function createClient() {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase 尚未配置，请先填写环境变量。");

  const cookieStore = await cookies();
  return createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot always write cookies; proxy.ts refreshes them.
        }
      },
    },
  });
}

export async function getOptionalUser() {
  if (!getSupabaseConfig()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getOptionalUser();
  if (!user) redirect("/login");
  return user;
}
