import type { APIRoute } from "astro";
import { supabase } from "@/lib/supabase";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Supabase sign-in error:", JSON.stringify(error));
      return new Response(JSON.stringify({ error: error.message || "Authentication failed" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!data.session) {
      return new Response(JSON.stringify({ error: "No session returned. Email may not be confirmed." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { access_token, refresh_token } = data.session;
    cookies.set("sb-access-token", access_token, { path: "/" });
    cookies.set("sb-refresh-token", refresh_token, { path: "/" });

    const role = data.user?.user_metadata?.role;

    if (role === "admin") return redirect("/admin/dashboard");
    if (role === "doctor") return redirect("/doctor/dashboard");
    if (role === "patient") return redirect("/patient/dashboard");

    return new Response(JSON.stringify({ error: "Unknown user role" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Sign-in error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
