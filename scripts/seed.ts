/**
 * Seed script — creates test users via Supabase Admin API.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... bun run scripts/seed.ts
 *
 * Get your service_role key from: Supabase Dashboard → Project Settings → API
 * WARNING: Never expose the service_role key publicly or commit it to git.
 */

import { createClient } from "@supabase/supabase-js";

const url = Bun.env.SUPABASE_URL;
const serviceKey = Bun.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(url, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const users = [
  {
    email: "admin@has.com",
    password: "admin123",
    email_confirm: true,
    user_metadata: { name: "Admin User", role: "admin" },
  },
  {
    email: "doctor@has.com",
    password: "doctor123",
    email_confirm: true,
    user_metadata: {
      name: "Dr. John Smith",
      fees: 150,
      specialty: "Cardiology",
      role: "doctor",
    },
  },
  {
    email: "patient@has.com",
    password: "patient123",
    email_confirm: true,
    user_metadata: {
      name: "Jane Doe",
      dob: "1990-05-15",
      gender: "Female",
      role: "patient",
    },
  },
];

async function main() {
  for (const u of users) {
    const { data: existing } = await supabase.auth.admin.listUsers();
    const match = existing?.users?.find((x) => x.email === u.email);

    if (match) {
      console.log(`Deleting existing user: ${u.email}`);
      await supabase.auth.admin.deleteUser(match.id);
    }

    console.log(`Creating user: ${u.email}`);
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: u.email_confirm,
      user_metadata: u.user_metadata,
    });

    if (error) {
      console.error(`  FAILED: ${error.message}`);
    } else {
      console.log(`  OK — ID: ${data.user?.id}`);

      if (u.user_metadata.role === "doctor") {
        await supabase
          .from("doctors")
          .update({ approved: "APPROVED", status: "ONLINE" })
          .eq("user_id", data.user?.id);
        console.log("  Doctor approved and set to ONLINE");
      }
    }
  }

  console.log("\nDone. You can now sign in with the test accounts.");
}

main().catch(console.error);
