import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;
let storedUrl = "";
let storedKey = "";

export function setSupabaseEnv(url: string, key: string) {
  storedUrl = url;
  storedKey = key;
  client = null;
}

function ensureClient(): SupabaseClient {
  if (!client) {
    const url = storedUrl || import.meta.env.SUPABASE_URL || "";
    const key = storedKey || import.meta.env.SUPABASE_ANON_KEY || "";
    if (!url || !key) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables");
    }
    client = createClient(url, key);
  }
  return client;
}

export const supabase = new Proxy<SupabaseClient>({} as SupabaseClient, {
  get(_, prop) {
    const c = ensureClient();
    const value = c[prop as keyof SupabaseClient];
    return typeof value === "function" ? value.bind(c) : value;
  },
});
