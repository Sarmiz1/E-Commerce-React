import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { adminApi } from "../../api/adminApi";
import { useTheme } from "../../Store/useThemeStore";

const validatePassword = (password, confirmPassword, minimumLength) => {
  if (!password) return "Enter your new password.";
  if (password.length < minimumLength) return `Password must be at least ${minimumLength} characters.`;
  if (!/[A-Z]/.test(password)) return "Password must include an uppercase letter.";
  if (!/[a-z]/.test(password)) return "Password must include a lowercase letter.";
  if (!/[0-9]/.test(password)) return "Password must include a number.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password must include a special character.";
  if (password !== confirmPassword) return "Passwords do not match.";
  return "";
};

export default function ResetPasswordPage({ audience = "user" }) {
  const isAdmin = audience === "admin";
  const navigate = useNavigate();
  const { colors, isDark } = useTheme();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const minimumLength = isAdmin ? 12 : 8;
  const palette = useMemo(() => ({
    background: isDark ? "#050A14" : "#F5F7FB",
    card: isDark ? "#0D1829" : "#FFFFFF",
    border: isDark ? "#1E3050" : "#DDE5F3",
    text: isDark ? "#EDF2FF" : "#101828",
    muted: isDark ? "#8BA3C7" : "#667085",
    input: isDark ? "#090F1E" : "#F8FAFC",
    accent: isAdmin ? "#4F8EF7" : colors.cta.primary,
  }), [colors.cta.primary, isAdmin, isDark]);

  useEffect(() => {
    let cancelled = false;

    const verifySession = async () => {
      setChecking(true);
      setError("");

      const { data, error: sessionError } = await supabase.auth.getSession();
      const user = data?.session?.user;

      if (sessionError || !user) {
        if (!cancelled) {
          setAllowed(false);
          setError("This reset link is invalid or expired. Request a new password reset link.");
          setChecking(false);
        }
        return;
      }

      try {
        const admin = await adminApi.getCurrentAdmin(user.id);

        if (isAdmin && !admin) {
          await supabase.auth.signOut();
          throw new Error("Only admin accounts can use the admin password reset page.");
        }

        if (!isAdmin && admin) {
          await supabase.auth.signOut();
          throw new Error("Admin accounts must reset passwords from the admin portal.");
        }

        if (!cancelled) {
          setAllowed(true);
          setChecking(false);
        }
      } catch (verifyError) {
        if (!cancelled) {
          setAllowed(false);
          setError(verifyError.message || "We could not verify this reset request.");
          setChecking(false);
        }
      }
    };

    verifySession();

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const submit = async (event) => {
    event.preventDefault();
    if (submitting || !allowed) return;

    const validationMessage = validatePassword(password, confirmPassword, minimumLength);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setSubmitting(true);
    setError("");

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message || "Password could not be updated.");
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    await supabase.auth.signOut();
    setTimeout(() => {
      navigate(isAdmin ? "/admin/login" : "/login", { replace: true });
    }, 1300);
  };

  return (
    <main className="min-h-screen px-5 py-12" style={{ background: palette.background, color: palette.text }}>
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md items-center">
        <section className="w-full rounded-3xl border p-6 shadow-2xl sm:p-8"
          style={{ background: palette.card, borderColor: palette.border }}>
          <div className="mb-7 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ background: `${palette.accent}22`, color: palette.accent }}>
              {isAdmin ? <ShieldCheck size={24} /> : <LockKeyhole size={24} />}
            </span>
            <div>
              <p className="text-lg font-extrabold tracking-tight">
                {isAdmin ? "Admin password reset" : "Change your password"}
              </p>
              <p className="text-xs uppercase tracking-[0.2em]" style={{ color: palette.muted }}>
                {isAdmin ? "Admin portal only" : "Buyer and seller accounts"}
              </p>
            </div>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight">Set a new password</h1>
          <p className="mt-2 text-sm leading-6" style={{ color: palette.muted }}>
            Choose a strong password. You will sign in again after it is saved.
          </p>

          <form className="mt-8 space-y-4" onSubmit={submit}>
            <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: palette.muted }}>
              New password
              <span className="relative mt-2 block">
                <input
                  autoComplete="new-password"
                  className="w-full rounded-xl border px-4 py-3 pr-12 text-sm outline-none transition"
                  disabled={checking || !allowed || success}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  style={{ background: palette.input, borderColor: palette.border, color: palette.text }}
                />
                <button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword((visible) => !visible)}
                  type="button"
                  style={{ color: palette.muted }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>

            <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: palette.muted }}>
              Confirm password
              <input
                autoComplete="new-password"
                className="mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition"
                disabled={checking || !allowed || success}
                onChange={(event) => setConfirmPassword(event.target.value)}
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                style={{ background: palette.input, borderColor: palette.border, color: palette.text }}
              />
            </label>

            {checking && (
              <p className="rounded-xl border px-4 py-3 text-sm" style={{ borderColor: palette.border, color: palette.muted }}>
                Verifying reset link...
              </p>
            )}

            {error && (
              <p className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-500">
                {error}
              </p>
            )}

            {success && (
              <p className="flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
                <CheckCircle2 size={17} /> Password updated. Redirecting to sign in...
              </p>
            )}

            <button
              className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
              disabled={checking || !allowed || submitting || success}
              type="submit"
              style={{ background: palette.accent }}
            >
              <LockKeyhole size={16} />
              {submitting ? "Saving password..." : "Update password"}
            </button>
          </form>

          <Link className="mt-5 block text-center text-sm font-bold" to={isAdmin ? "/admin/login" : "/login"}
            style={{ color: palette.accent }}>
            Back to sign in
          </Link>
        </section>
      </div>
    </main>
  );
}
