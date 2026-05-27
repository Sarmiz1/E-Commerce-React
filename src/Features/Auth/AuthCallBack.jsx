import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.user) {
        navigate("/login", { replace: true });
        return;
      }

      const user = session.user;
      const selectedRole = localStorage.getItem("woosho_oauth_role") || "buyer";

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, role, full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: user.id,
          full_name:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email,
          avatar_url: user.user_metadata?.avatar_url || null,
          role: selectedRole,
        });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          navigate("/login", { replace: true });
          return;
        }
      }

      localStorage.removeItem("woosho_oauth_role");

      if (selectedRole === "seller") {
        navigate("/seller-onboarding", { replace: true });
        return;
      }

      navigate("/account", { replace: true });
    };

    handleCallback();
  }, [navigate]);

  return <p>Signing you in...</p>;
}