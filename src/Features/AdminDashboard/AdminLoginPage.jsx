import { useEffect, useState } from "react";
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../api/adminApi";
import { useAuth } from "../../Store/useAuthStore";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (authLoading || !user?.id) return undefined;

    adminApi
      .getCurrentAdmin(user.id)
      .then((admin) => {
        if (!cancelled && admin) navigate("/admin", { replace: true });
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [authLoading, navigate, user?.id]);

  const submit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setError("");
    setSubmitting(true);

    try {
      await adminApi.signIn(email.trim(), password);
      navigate("/admin", { replace: true });
    } catch (signInError) {
      setError(signInError.message || "Admin sign-in failed.");
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050A14] px-5 py-12 text-[#EDF2FF]">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md items-center">
        <section className="w-full rounded-3xl border border-[#162035] bg-[#0D1829] p-6 shadow-2xl sm:p-8">
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1A3260] text-[#4F8EF7]">
              <ShieldCheck size={24} />
            </span>
            <div>
              <p className="text-lg font-extrabold tracking-tight">Woo Sho Admin</p>
              <p className="text-xs uppercase tracking-[0.2em] text-[#8BA3C7]">
                Authorized staff only
              </p>
            </div>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight">
            Sign in to the control room
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#8BA3C7]">
            Admin membership is verified by the backend after authentication.
          </p>

          <form className="mt-8 space-y-4" onSubmit={submit}>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8BA3C7]">
              Email
              <input
                autoComplete="email"
                className="mt-2 w-full rounded-xl border border-[#1E3050] bg-[#090F1E] px-4 py-3 text-sm text-[#EDF2FF] outline-none transition focus:border-[#4F8EF7]"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </label>

            <label className="block text-xs font-bold uppercase tracking-wider text-[#8BA3C7]">
              Password
              <span className="relative mt-2 block">
                <input
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-[#1E3050] bg-[#090F1E] px-4 py-3 pr-12 text-sm text-[#EDF2FF] outline-none transition focus:border-[#4F8EF7]"
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8BA3C7]"
                  onClick={() => setShowPassword((visible) => !visible)}
                  type="button"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>

            {error && (
              <p className="rounded-xl border border-[#F43F5E55] bg-[#4A0E1A] px-4 py-3 text-sm text-[#F43F5E]">
                {error}
              </p>
            )}

            <button
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#4F8EF7] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#3B7DE8] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={submitting}
              type="submit"
            >
              <LockKeyhole size={16} />
              {submitting ? "Verifying access..." : "Sign in securely"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
