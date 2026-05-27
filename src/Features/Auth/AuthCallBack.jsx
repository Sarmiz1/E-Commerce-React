import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

const steps = [
  { id: "session",  label: "Verifying your session"   },
  { id: "profile",  label: "Loading your profile"     },
  { id: "redirect", label: "Getting things ready"     },
];

const CHECK = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8.5l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function AuthCallback() {
  const navigate  = useNavigate();
  const [current, setCurrent] = useState(0);   // which step is active
  const [done,    setDone]    = useState([]);   // completed step ids
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      /* ── Step 0 : verify session ─────────────────────── */
      setCurrent(0);
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        setError("Couldn't verify your session. Redirecting…");
        setTimeout(() => navigate("/login", { replace: true }), 1800);
        return;
      }

      setDone((d) => [...d, "session"]);

      /* ── Step 1 : load / create profile ─────────────── */
      setCurrent(1);
      const user         = session.user;
      const selectedRole = localStorage.getItem("woosho_oauth_role") || "buyer";

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, role, full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id:         user.id,
          full_name:  user.user_metadata?.full_name || user.user_metadata?.name || user.email,
          avatar_url: user.user_metadata?.avatar_url || null,
          role:       selectedRole,
        });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          setError("Couldn't set up your profile. Redirecting…");
          setTimeout(() => navigate("/login", { replace: true }), 1800);
          return;
        }
      }

      setDone((d) => [...d, "profile"]);
      localStorage.removeItem("woosho_oauth_role");

      /* ── Step 2 : redirect ───────────────────────────── */
      setCurrent(2);
      await new Promise((r) => setTimeout(r, 500));
      setDone((d) => [...d, "redirect"]);

      await new Promise((r) => setTimeout(r, 400));

      if (selectedRole === "seller") {
        navigate("/seller-onboarding", { replace: true });
      } else {
        navigate("/account", { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

        .auth-page {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fafaf9;
          font-family: 'DM Sans', sans-serif;
        }

        .auth-card {
          background: #fff;
          border: 1px solid #e8e6e1;
          border-radius: 20px;
          padding: 48px 52px;
          width: 100%;
          max-width: 380px;
          animation: rise 0.55s cubic-bezier(0.22,1,0.36,1) both;
        }

        @keyframes rise {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        .auth-logo {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #1a1a1a;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
        }

        .auth-logo svg { display: block; }

        .auth-title {
          font-size: 20px;
          font-weight: 600;
          color: #111;
          margin: 0 0 6px;
          letter-spacing: -0.3px;
        }

        .auth-sub {
          font-size: 14px;
          color: #888;
          margin: 0 0 36px;
        }

        .auth-steps { list-style: none; padding: 0; margin: 0; }

        .auth-step {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 10px 0;
          opacity: 0.35;
          transition: opacity 0.3s ease;
        }
        .auth-step.active  { opacity: 1; }
        .auth-step.checked { opacity: 1; }

        .step-icon {
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1.5px solid #d9d7d2;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          transition: background 0.25s, border-color 0.25s, color 0.25s;
          color: transparent;
          position: relative;
          overflow: hidden;
        }

        .auth-step.active .step-icon {
          border-color: #1a1a1a;
        }

        .auth-step.checked .step-icon {
          background: #1a1a1a;
          border-color: #1a1a1a;
          color: #fff;
          animation: pop 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
        }

        @keyframes pop {
          from { transform: scale(0.7); }
          to   { transform: scale(1);   }
        }

        .step-pulse {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: #1a1a1a;
          opacity: 0;
        }
        .auth-step.active:not(.checked) .step-pulse {
          animation: pulse 1.4s ease-in-out infinite;
        }
        @keyframes pulse {
          0%   { opacity: 0.12; transform: scale(0.8); }
          50%  { opacity: 0.06; transform: scale(1.3); }
          100% { opacity: 0;    transform: scale(1.6); }
        }

        .step-label {
          font-size: 14px;
          font-weight: 500;
          color: #444;
          transition: color 0.25s;
        }
        .auth-step.active  .step-label { color: #111; }
        .auth-step.checked .step-label { color: #111; }

        .step-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #1a1a1a;
          display: none;
          animation: blink 0.9s ease-in-out infinite;
        }
        .auth-step.active:not(.checked) .step-dot { display: block; }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.2; }
        }

        .step-divider {
          width: 1.5px;
          height: 18px;
          background: #e8e6e1;
          margin: 0 13px;
          border-radius: 2px;
          transition: background 0.3s;
        }
        .step-divider.lit { background: #1a1a1a; }

        .auth-error {
          margin-top: 28px;
          padding: 12px 16px;
          background: #fff5f5;
          border: 1px solid #fbd0d0;
          border-radius: 10px;
          font-size: 13px;
          color: #c53030;
          animation: rise 0.3s ease both;
        }
      `}</style>

      <div className="auth-page">
        <div className="auth-card">

          {/* Logo mark */}
          <div className="auth-logo">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M4 11l5 5 9-9" stroke="#fff" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <p className="auth-title">Signing you in</p>
          <p className="auth-sub">Just a moment while we set things up.</p>

          <ol className="auth-steps">
            {steps.map((step, i) => {
              const isActive  = current === i;
              const isChecked = done.includes(step.id);
              const prevDone  = i > 0 && done.includes(steps[i - 1].id);

              return (
                <li key={step.id}>
                  {i > 0 && (
                    <div className={`step-divider${prevDone ? " lit" : ""}`} />
                  )}
                  <div className={`auth-step${isActive ? " active" : ""}${isChecked ? " checked" : ""}`}>
                    <div className="step-icon">
                      <div className="step-pulse" />
                      {isChecked && CHECK}
                    </div>
                    <span className="step-label">{step.label}</span>
                    <div className="step-dot" />
                  </div>
                </li>
              );
            })}
          </ol>

          {error && <div className="auth-error">{error}</div>}
        </div>
      </div>
    </>
  );
}