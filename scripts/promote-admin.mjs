import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const [, , emailArg, fullName = "", role = "super_admin"] = process.argv;
const email = emailArg?.trim().toLowerCase();

if (!email) {
  console.error(
    'Usage: npm run admin:promote -- <email> "<full name>" [admin role]',
  );
  process.exit(1);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the local environment.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function findAuthUserByEmail(targetEmail) {
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) throw error;

    const user = data.users.find(
      ({ email: userEmail }) => userEmail?.toLowerCase() === targetEmail,
    );

    if (user) return user;
    if (data.users.length < 1000) return null;

    page += 1;
  }
}

try {
  const user = await findAuthUserByEmail(email);

  if (!user) {
    console.error(
      `No Supabase Auth account exists for ${email}. Register or create the Auth account first.`,
    );
    process.exit(1);
  }

  const { error } = await supabase.from("admin_users").upsert(
    {
      id: user.id,
      email: user.email,
      full_name: fullName.trim() || user.user_metadata?.full_name || null,
      role,
      is_active: true,
    },
    { onConflict: "id" },
  );

  if (error) throw error;

  console.log(`Promoted ${user.email} to ${role}.`);
} catch (error) {
  console.error(`Admin promotion failed: ${error.message}`);
  process.exit(1);
}
