import { supabase } from "../supabaseClient"; 

export const getProducts = async () => {
  return await supabase.from("products").select("*");
};