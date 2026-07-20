import { defineMiddleware } from "astro/middleware";
import { setSupabaseEnv } from "@/lib/supabase";

export const onRequest = defineMiddleware((context, next) => {
  const env = (context.locals as any).runtime?.env;
  if (env?.SUPABASE_URL && env?.SUPABASE_ANON_KEY) {
    setSupabaseEnv(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
  }
  return next();
});
