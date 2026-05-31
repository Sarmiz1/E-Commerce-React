import { useMutation } from "@tanstack/react-query";
import {
  isSupabaseConfigured,
  supabase,
  supabaseConfigError,
} from "../../../lib/supabaseClient";
import { rememberAuthReturnTo } from "../utils/authRedirect";


// This function translates raw error messages from Supabase into more user-friendly messages that can be displayed in the UI. It checks for specific keywords in the error message and returns a more understandable message for the user. If no specific case matches, it returns the original message or a generic fallback message. 
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

  if (
    message.includes(
      "table",
    )
  )
    return "There was an issue connecting to the server. Please try again later.";

  if (message.includes("User not found"))
    return "No account found with this email address.";

  return message;
};

// Google sign-in is handled separately because it doesn't fit the typical mutation pattern and requires a redirect. We still want to provide user-friendly error messages for it, so we use the same getFriendlyError function.
export const signInWithGoogle = async (returnTo) => {
  if (!isSupabaseConfigured) {
    throw new Error(supabaseConfigError);
  }

  const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
  rememberAuthReturnTo(returnTo);

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    throw new Error(getFriendlyError(error.message));
  }
};


// This hook handles both login and registration mutations based on the mode. It also includes error handling to provide user-friendly messages.
export const useAuthMutation = (mode, setFormError) => {
  return useMutation({
    mutationFn: async (formData) => {
      if (!isSupabaseConfigured) {
        throw new Error(supabaseConfigError);
      }

      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw new Error(getFriendlyError(error.message));

        return { message: "Signed in successfully.", userId: data.user?.id };
      }

      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(
          formData.email,
        );

        if (error) throw new Error(getFriendlyError(error.message));

        return { message: "Password reset link sent. Please check your email." };
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            requested_account_role: formData.role,
          },
        },
      });

      if (authError) throw new Error(getFriendlyError(authError.message));

      if (authData?.user?.identities?.length === 0) {
        throw new Error(
          "An account with this email already exists. Please sign in instead.",
        );
      }

      return {
        message:
          "Account created successfully. Redirecting to onboarding...",
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
