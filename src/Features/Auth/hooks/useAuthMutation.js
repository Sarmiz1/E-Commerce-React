import { useMutation } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabaseClient";

export const getFriendlyError = (message) => {
  if (!message) return "Something went wrong. Please try again.";

  if (
    message.includes("Email already registered") ||
    message.includes("User already registered")
  )
    return "An account with this email already exists. Please sign in instead.";

  if (message.includes("Invalid login credentials"))
    return "Incorrect email or password. Please try again.";

  if (message.includes("Email not confirmed"))
    return "Please verify your email before signing in.";

  if (message.includes("Password should be at least"))
    return "Password must be at least 6 characters long.";

  if (message.includes("Unable to validate email address"))
    return "Please enter a valid email address.";

  if (
    message.includes(
      "For security purposes, you can only request this after",
    )
  )
    return "Please wait a moment before requesting another reset link.";

  if (message.includes("User not found"))
    return "No account found with this email address.";

  return message;
};

export const useAuthMutation = (mode, setFormError) => {
  return useMutation({
    mutationFn: async (formData) => {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw new Error(getFriendlyError(error.message));

        return { message: "Signed in successfully." };
      }

      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(
          formData.email,
        );

        if (error) throw new Error(getFriendlyError(error.message));

        return { message: "Password reset link sent. Please check your email." };
      }

      const homeAddress = {
        address_type: "home",
        full_name: formData.full_name,
        phone: formData.phone || null,
        line1: formData.home_address?.street || "",
        line2: null,
        city: formData.home_address?.city || "",
        state: formData.home_address?.state || "",
        postal_code: formData.home_address?.zip_code || "",
        country: formData.home_address?.country || "NG",
        is_default_shipping: true,
        is_default_billing: true,
      };

      const addressesToInsert = [homeAddress];

      if (formData.role === "seller") {
        addressesToInsert.push({
          address_type: "store",
          full_name: formData.full_name,
          phone: formData.phone || null,
          line1: formData.same_as_store
            ? formData.home_address?.street || ""
            : formData.store_address?.street || "",
          line2: null,
          city: formData.same_as_store
            ? formData.home_address?.city || ""
            : formData.store_address?.city || "",
          state: formData.same_as_store
            ? formData.home_address?.state || ""
            : formData.store_address?.state || "",
          postal_code: formData.same_as_store
            ? formData.home_address?.zip_code || ""
            : formData.store_address?.zip_code || "",
          country: formData.same_as_store
            ? formData.home_address?.country || "NG"
            : formData.store_address?.country || "NG",
          is_default_shipping: false,
          is_default_billing: false,
        });
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            username: formData.username,
            role: formData.role,
            store_type:
              formData.role === "seller"
                ? formData.store_type
                : "independent",
            addresses: addressesToInsert,
          },
        },
      });

      if (authError) throw new Error(getFriendlyError(authError.message));

      if (authData?.user?.identities?.length === 0) {
        throw new Error(
          "An account with this email already exists. Please sign in instead.",
        );
      }

      const userId = authData?.user?.id;

      if (!userId) {
        throw new Error("Account created, but user ID was not returned.");
      }

      if (formData.role === "seller") {
        const { error: sellerError } = await supabase
          .from("seller_profiles")
          .insert({
            user_id: userId,
            store_name: formData.store_name,
            description: formData.business_description,
          });

        if (sellerError) {
          throw new Error(getFriendlyError(sellerError.message));
        }
      }

      return {
        message:
          "Account created successfully. Please check your email to verify your account.",
      };
    },

    onMutate: () => {
      setFormError("");
    },

    onError: (error) => {
      setFormError(error.message || "Something went wrong.");
    },
  });
};
