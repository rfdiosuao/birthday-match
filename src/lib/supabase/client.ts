import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";

export function createClient() {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase 尚未配置，请先填写环境变量。");
  return createBrowserClient(config.url, config.anonKey);
}
