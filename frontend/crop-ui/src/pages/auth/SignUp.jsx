import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../i18n/LanguageContext";
import OAuthButtons from "./OAuthButtons";
import AuthLayout from "./AuthLayout";
import { inp, btn, label } from "./authStyles";

function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = [
    { ok: password.length >= 8,              text: "At least 8 characters" },
    { ok: /[A-Z]/.test(password),            text: "One uppercase letter" },
    { ok: /[a-z]/.test(password),            text: "One lowercase letter" },
    { ok: /_/.test(password),                text: "One underscore (_)" },
    { ok: /^[A-Za-z0-9_]*$/.test(password),  text: "Only letters, numbers, underscores" },
  ];
  const passed = checks.filter(c => c.ok).length;
  const pct    = (passed / checks.length) * 100;
  const color  = pct <= 40 ? "bg-red-500" : pct <= 70 ? "bg-amber-400" : "bg-emerald-500";

  return (
    <div className="mt-2 space-y-1.5">
      <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        {checks.map(c => (
          <span key={c.text} className={`text-xs flex items-center gap-1 ${c.ok ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-slate-500"}`}>
            <span>{c.ok ? "✓" : "✗"}</span>{c.text}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function SignUp() {
  const navigate = useNavigate();
  const { login, user, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const [form,    setForm]    = useState({ name: "", email: "", password: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  if (authLoading) return (
    <AuthLayout>
      <div className="flex items-center justify-center py-20">
        <span className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </AuthLayout>
  );

  if (user) return <Navigate to="/dashboard" replace />;

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await api.post("/api/auth/register", form);
      if (res.data.requiresVerification) {
        navigate(`/verify-email?email=${encodeURIComponent(res.data.email)}`);
        return;
      }
      await login(res.data.token, res.data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{t("Create your account")}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t("Start optimizing your harvest today")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={label} htmlFor="name">{t("Full Name")}</label>
            <input id="name" name="name" placeholder="Ramesh Patel"
              value={form.name} onChange={handleChange} required className={inp} />
          </div>
          <div>
            <label className={label} htmlFor="email">{t("Email")}</label>
            <input id="email" type="email" name="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange} required className={inp} />
          </div>
          <div>
            <label className={label} htmlFor="password">{t("Password")}</label>
            <div className="relative">
              <input id="password" type={showPw ? "text" : "password"} name="password"
                placeholder="Min_8_Chars_1Upper"
                value={form.password} onChange={handleChange} required className={inp} />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 text-xs">
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
            <PasswordStrength password={form.password} />
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
              <span className="flex-shrink-0 mt-0.5">⚠</span>{error}
            </div>
          )}

          <button type="submit" disabled={loading} className={btn}>
            {loading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Creating account…</> : t("Create Account")}
          </button>
        </form>

        <OAuthButtons mode="signup" />

        <p className="text-center text-sm text-gray-500 dark:text-slate-400">
          {t("Already have an account?")}{" "}
          <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">{t("Login")}</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
