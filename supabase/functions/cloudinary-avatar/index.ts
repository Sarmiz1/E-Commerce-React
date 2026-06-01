import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const cloudName = Deno.env.get("CLOUDINARY_CLOUD_NAME");
const cloudinaryApiKey = Deno.env.get("CLOUDINARY_API_KEY");
const cloudinaryApiSecret = Deno.env.get("CLOUDINARY_API_SECRET");

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const AVATAR_FOLDER = "woosho/user_avatars";
const AVATAR_TRANSFORMATION = "c_fill,g_face,h_320,w_320,q_auto,f_auto";
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

function toCloudinaryAvatarUrl(url: string) {
  return url.replace(
    "/image/upload/",
    `/image/upload/${AVATAR_TRANSFORMATION}/`,
  );
}

async function sha1(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-1", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function signCloudinaryParams(params: Record<string, string>) {
  const serialized = Object.entries(params)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return sha1(`${serialized}${cloudinaryApiSecret}`);
}

async function getAuthenticatedUser(req: Request) {
  const authorization = req.headers.get("Authorization");
  if (!authorization || !supabaseUrl || !anonKey) return null;

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: { user }, error } = await userClient.auth.getUser();

  return error ? null : user;
}

async function saveAvatarUrl(userId: string, avatarUrl: string | null) {
  const serviceClient = createClient(supabaseUrl!, serviceRoleKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: profile, error: profileError } = await serviceClient
    .from("profiles")
    .update({
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("full_name")
    .single();

  if (profileError) throw profileError;

  const { error: buyerProfileError } = await serviceClient
    .from("buyer_profiles")
    .upsert({
      user_id: userId,
      full_name: profile.full_name,
      avatar_url: avatarUrl,
    }, { onConflict: "user_id" });

  if (buyerProfileError) throw buyerProfileError;
}

async function uploadAvatar(userId: string, file: File) {
  if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
    return json({ error: "Photo must be a JPG, PNG, or WEBP image" }, 400);
  }
  if (!file.size || file.size > MAX_AVATAR_BYTES) {
    return json({ error: "Photo must be 2MB or smaller" }, 400);
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const params = {
    allowed_formats: "jpg,jpeg,png,webp",
    folder: AVATAR_FOLDER,
    invalidate: "true",
    overwrite: "true",
    public_id: userId,
    timestamp,
  };
  const signature = await signCloudinaryParams(params);
  const formData = new FormData();

  formData.append("file", file);
  formData.append("api_key", cloudinaryApiKey!);
  formData.append("signature", signature);
  Object.entries(params).forEach(([key, value]) => formData.append(key, value));

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData },
  );
  const result = await response.json();

  if (!response.ok || typeof result?.secure_url !== "string") {
    return json({ error: result?.error?.message || "Unable to upload profile photo" }, 502);
  }

  const avatarUrl = toCloudinaryAvatarUrl(result.secure_url);
  await saveAvatarUrl(userId, avatarUrl);

  return json({
    avatarUrl,
    publicId: result.public_id,
  });
}

async function destroyAvatar(userId: string) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const params = {
    invalidate: "true",
    public_id: `${AVATAR_FOLDER}/${userId}`,
    timestamp,
  };
  const signature = await signCloudinaryParams(params);
  const formData = new FormData();

  formData.append("api_key", cloudinaryApiKey!);
  formData.append("signature", signature);
  Object.entries(params).forEach(([key, value]) => formData.append(key, value));

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
    { method: "POST", body: formData },
  );
  const result = await response.json();

  if (!response.ok || !["ok", "not found"].includes(result?.result)) {
    return json({ error: result?.error?.message || "Unable to remove profile photo" }, 502);
  }

  await saveAvatarUrl(userId, null);

  return json({ removed: true });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }
  if (!supabaseUrl || !anonKey || !serviceRoleKey || !cloudName || !cloudinaryApiKey || !cloudinaryApiSecret) {
    return json({ error: "Cloudinary profile photos are not configured" }, 500);
  }

  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return json({ error: "Authentication is required" }, 401);

    if (req.headers.get("content-type")?.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");

      if (!(file instanceof File)) {
        return json({ error: "Choose a profile photo to upload" }, 400);
      }

      return uploadAvatar(user.id, file);
    }

    const body = await req.json();
    if (body?.action === "destroy") {
      return destroyAvatar(user.id);
    }

    return json({ error: "Unsupported profile-photo action" }, 400);
  } catch (error) {
    return json(
      { error: error instanceof Error ? error.message : "Profile photo request failed" },
      500,
    );
  }
});
