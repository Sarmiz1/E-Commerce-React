import { supabase } from "../lib/supabaseClient";

const BUCKET = "categories";

export const getCategoryImageUrl = (path) => {
  if (!path || typeof path !== "string") return "";

  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path);

  return data?.publicUrl ?? "";
};