import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../Context/theme/ThemeContext";
import { supabase } from "../../supabaseClient";

// ─── CSS ──────────────────────────────────────────────────────────────────────
const AUTH_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  .auth-wrap * { font-family: 'Inter', sans-serif; box-sizing: border-box; }

  @keyframes auth-float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(-18px) rotate(5deg); }
    66% { transform: translateY(-8px) rotate(-3deg); }
  }
  .auth-orb { animation: auth-float var(--dur, 8s) ease-in-out infinite; }

  @keyframes auth-spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .auth-ring { animation: auth-spin-slow 18s linear infinite; }

  @keyframes auth-pulse-border {
    0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
    50%       { box-shadow: 0 0 0 8px rgba(99,102,241,0); }
  }
  .auth-input:focus { animation: auth-pulse-border 1.8s ease-out infinite; }

  .auth-input {
    width: 100%;
    padding: 14px 16px;
    border-radius: 14px;
    font-size: 14px;
    font-weight: 500;
    outline: none;
    transition: all 0.25s;
    border: 1.5px solid transparent;
  }

  .auth-btn {
    width: 100%;
    padding: 15px;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 800;
    cursor: pointer;
    border: none;
    position: relative;
    overflow: hidden;
    transition: transform 0.15s, box-shadow 0.3s;
  }
  .auth-btn:hover { transform: translateY(-2px); }
  .auth-btn:active { transform: scale(0.97); }

  .auth-btn::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%);
    pointer-events: none;
  }

  @keyframes auth-sheen {
    0%   { transform: translateX(-100%) skewX(-20deg); }
    100% { transform: translateX(250%) skewX(-20deg); }
  }
  .auth-btn:hover::before {
    content: '';
    position: absolute;
    top: 0; left: 0; bottom: 0;
    width: 40%;
    background: linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent);
    animation: auth-sheen 0.65s ease-in-out;
  }

  .auth-tab {
    padding: 8px 20px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
    background: transparent;
  }

  .strength-bar { height: 4px; border-radius: 9999px; transition: all 0.4s; }
`;

// ─── Floating Orbs Background ──────────────────────────────────────────────────
function AuthBg({ accent }) {
  const orbs = [
    { size: 300, x: "-5%", y: "-10%", dur: "9s", opacity: 0.18, delay: "0s" },
    { size: 200, x: "80%", y: "60%", dur: "12s", opacity: 0.12, delay: "2s" },
    { size: 150, x: "50%", y: "80%", dur: "7s", opacity: 0.1, delay: "1s" },
    { size: 100, x: "75%", y: "5%", dur: "10s", opacity: 0.15, delay: "3s" },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map((o, i) => (
        <div
          key={i}
          className="auth-orb absolute rounded-full"
          style={{
            width: o.size, height: o.size,
            left: o.x, top: o.y,
            background: `radial-gradient(circle, ${accent}${Math.round(o.opacity * 255).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
            "--dur": o.dur,
            animationDelay: o.delay,
          }}
        />
      ))}
      {/* Rotating ring */}
      <div className="auth-ring absolute" style={{
        width: 500, height: 500, left: "50%", top: "50%",
        transform: "translate(-50%, -50%)",
        border: `1px solid ${accent}18`,
        borderRadius: "50%",
      }} />
      <div className="auth-ring absolute" style={{
        width: 700, height: 700, left: "50%", top: "50%",
        transform: "translate(-50%, -50%)",
        border: `1px solid ${accent}0c`,
        borderRadius: "50%",
        animationDuration: "25s",
        animationDirection: "reverse",
      }} />
    </div>
  );
}

// ─── Password Strength ────────────────────────────────────────────────────────
function PasswordStrength({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#ef4444", "#f97316", "#eab308", "#10b981"];
  return password.length > 0 ? (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1.5">
        {checks.map((c, i) => (
          <div key={i} className="strength-bar flex-1" style={{ background: i < score ? colors[score] : "rgba(255,255,255,0.1)" }} />
        ))}
      </div>
      <p className="text-[11px] font-bold" style={{ color: colors[score] }}>{labels[score]}</p>
    </div>
  ) : null;
}

// ─── Field Component ─────────────────────────────────────────────────────────
function Field({ label, type = "text", value, onChange, placeholder, isDark, colors, accent, error }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div className="space-y-1.5">
      <label className="block text-[12px] font-bold uppercase tracking-widest" style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)" }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={isPassword && show ? "text" : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="auth-input"
          style={{
            background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
            color: colors.text.primary,
            borderColor: error ? "#ef4444" : (isDark ? "rgba(255,255,255,0.1)" : colors.border.default),
          }}
          onFocus={e => { e.target.style.borderColor = accent; }}
          onBlur={e => { e.target.style.borderColor = error ? "#ef4444" : (isDark ? "rgba(255,255,255,0.1)" : colors.border.default); }}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold opacity-50 hover:opacity-100 transition-opacity"
            style={{ color: colors.text.secondary }}>
            {show ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error && <p className="text-[11px] font-medium" style={{ color: "#ef4444" }}>{error}</p>}
    </div>
  );
}

// ─── Views ───────────────────────────────────────────────────────────────────
const variants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir < 0 ? 60 : -60, opacity: 0 }),
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AuthPage() {
  const { isDark, colors } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const modeParam = searchParams.get("mode") || "login";
  const MODES = ["login", "signup", "reset-password", "reset-username"];
  const initialIndex = MODES.indexOf(modeParam) !== -1 ? MODES.indexOf(modeParam) : 0;

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);

  const [form, setForm] = useState({ email: "", password: "", confirm: "", username: "", fullName: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const accent = "#6366f1";

  const switchTo = (index) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
    setErrors({});
    setSuccess("");
    setForm({ email: "", password: "", confirm: "", username: "", fullName: "" });
  };

  const setField = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (activeIndex === 0) {
      if (!form.email) errs.email = "Email is required";
      if (!form.password) errs.password = "Password is required";
    }
    if (activeIndex === 1) {
      if (!form.fullName) errs.fullName = "Full name is required";
      if (!form.username) errs.username = "Username is required";
      if (!form.email) errs.email = "Email is required";
      if (!form.password || form.password.length < 8) errs.password = "At least 8 characters";
      if (form.password !== form.confirm) errs.confirm = "Passwords don't match";
    }
    if (activeIndex === 2 || activeIndex === 3) {
      if (!form.email) errs.email = "Email is required";
    }
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});
    
    try {
      if (activeIndex === 0) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        setSuccess("Logged in successfully!");
        setTimeout(() => navigate("/dashboard/buyer"), 1500);
      } else if (activeIndex === 1) {
        // Signup
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              full_name: form.fullName,
              username: form.username,
            }
          }
        });
        if (error) throw error;
        setSuccess("Account created! Welcome to Woosho.");
        setTimeout(() => navigate("/dashboard/buyer"), 1500);
      } else if (activeIndex === 2) {
        // Reset Password
        const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSuccess("Password reset link sent to your email.");
      } else if (activeIndex === 3) {
        // Recover Username (Mock or support link)
        setSuccess("Contact support to recover your username.");
      }
    } catch (err) {
      setErrors({ email: err.message });
    } finally {
      setLoading(false);
    }
  };

  const TABS = [
    { label: "Login", icon: "🔑" },
    { label: "Sign Up", icon: "✨" },
    { label: "Reset Password", icon: "🔒" },
    { label: "Reset Username", icon: "👤" },
  ];

  return (
    <div className="auth-wrap min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: isDark ? "#080810" : "#f5f5ff" }}>
      <style>{AUTH_CSS}</style>
      <AuthBg accent={accent} />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Card */}
        <div className="rounded-3xl overflow-hidden shadow-2xl border"
          style={{
            background: isDark ? "rgba(15,15,25,0.85)" : "rgba(255,255,255,0.85)",
            backdropFilter: "blur(32px)",
            borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)",
            boxShadow: `0 40px 100px ${accent}22, 0 4px 30px rgba(0,0,0,0.4)`,
          }}>

          {/* Top accent strip */}
          <div className="h-[3px]" style={{ background: `linear-gradient(to right, ${accent}, #a855f7, #ec4899)` }} />

          <div className="p-8">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm"
                style={{ background: `linear-gradient(135deg, ${accent}, #a855f7)`, color: "#fff" }}>
                W
              </div>
              <span className="font-black text-lg tracking-tight" style={{ color: colors.text.primary }}>
                Woosho<span style={{ color: accent }}>.</span>
              </span>
              <span className="ml-auto text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest"
                style={{ background: `${accent}18`, color: accent }}>
                {TABS[activeIndex].icon} {TABS[activeIndex].label}
              </span>
            </div>

            {/* Tab Pills */}
            <div className="flex gap-1 p-1 rounded-xl mb-8 overflow-x-auto"
              style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }}>
              {TABS.map((t, i) => (
                <button
                  key={i}
                  className="auth-tab shrink-0 relative"
                  onClick={() => switchTo(i)}
                  style={{ color: activeIndex === i ? "#fff" : colors.text.tertiary }}
                >
                  {activeIndex === i && (
                    <motion.div
                      layoutId="auth-pill"
                      className="absolute inset-0 rounded-[8px]"
                      style={{ background: `linear-gradient(135deg, ${accent}, #a855f7)` }}
                      transition={{ type: "spring", damping: 22, stiffness: 260 }}
                    />
                  )}
                  <span className="relative z-10">{t.label.split(" ")[0]}</span>
                </button>
              ))}
            </div>

            {/* Form Area */}
            <div className="relative overflow-hidden" style={{ minHeight: 280 }}>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.form
                  key={activeIndex}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  {/* Title */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-black mb-1" style={{ color: colors.text.primary }}>
                      {activeIndex === 0 && "Welcome back."}
                      {activeIndex === 1 && "Create your account."}
                      {activeIndex === 2 && "Reset your password."}
                      {activeIndex === 3 && "Recover your username."}
                    </h2>
                    <p className="text-sm" style={{ color: colors.text.tertiary }}>
                      {activeIndex === 0 && "Sign in to access your Woosho experience."}
                      {activeIndex === 1 && "Join millions discovering the future of shopping."}
                      {activeIndex === 2 && "We'll send a reset link to your email."}
                      {activeIndex === 3 && "Enter your email to recover your username."}
                    </p>
                  </div>

                  {/* Success Message */}
                  <AnimatePresence>
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="p-4 rounded-2xl text-sm font-semibold"
                        style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}
                      >
                        ✓ {success}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Fields */}
                  {activeIndex === 1 && (
                    <>
                      <Field label="Full Name" value={form.fullName} onChange={setField("fullName")} placeholder="Your full name" isDark={isDark} colors={colors} accent={accent} error={errors.fullName} />
                      <Field label="Username" value={form.username} onChange={setField("username")} placeholder="@username" isDark={isDark} colors={colors} accent={accent} error={errors.username} />
                    </>
                  )}

                  <Field label="Email Address" type="email" value={form.email} onChange={setField("email")} placeholder="you@example.com" isDark={isDark} colors={colors} accent={accent} error={errors.email} />

                  {(activeIndex === 0 || activeIndex === 1) && (
                    <div>
                      <Field label="Password" type="password" value={form.password} onChange={setField("password")} placeholder="••••••••" isDark={isDark} colors={colors} accent={accent} error={errors.password} />
                      {activeIndex === 1 && <PasswordStrength password={form.password} />}
                    </div>
                  )}

                  {activeIndex === 1 && (
                    <Field label="Confirm Password" type="password" value={form.confirm} onChange={setField("confirm")} placeholder="••••••••" isDark={isDark} colors={colors} accent={accent} error={errors.confirm} />
                  )}

                  {/* Forgot link */}
                  {activeIndex === 0 && (
                    <div className="flex justify-end">
                      <button type="button" onClick={() => switchTo(2)} className="text-[12px] font-semibold hover:opacity-80 transition-opacity" style={{ color: accent }}>
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={loading || !!success}
                    whileTap={{ scale: 0.97 }}
                    className="auth-btn mt-2"
                    style={{
                      background: loading ? `${accent}88` : `linear-gradient(135deg, ${accent}, #a855f7)`,
                      color: "#fff",
                      boxShadow: `0 8px 30px ${accent}44`,
                    }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Processing…
                      </span>
                    ) : (
                      activeIndex === 0 ? "Sign In →" :
                      activeIndex === 1 ? "Create Account →" :
                      activeIndex === 2 ? "Send Reset Link →" :
                      "Recover Username →"
                    )}
                  </motion.button>

                  {/* Switch Prompt */}
                  <p className="text-center text-[12px] font-medium pt-1" style={{ color: colors.text.tertiary }}>
                    {activeIndex === 0 ? (
                      <>Don't have an account? <button type="button" onClick={() => switchTo(1)} className="font-bold hover:opacity-80" style={{ color: accent }}>Sign Up</button></>
                    ) : (
                      <>Already have an account? <button type="button" onClick={() => switchTo(0)} className="font-bold hover:opacity-80" style={{ color: accent }}>Login</button></>
                    )}
                  </p>
                </motion.form>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Back link */}
        <p className="text-center mt-6 text-[12px]" style={{ color: "rgba(255,255,255,0.3)" }}>
          <Link to="/" className="hover:opacity-80 transition-opacity">← Back to Woosho</Link>
        </p>
      </motion.div>
    </div>
  );
}
