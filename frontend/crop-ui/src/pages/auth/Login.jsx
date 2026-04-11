import { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams, Navigate } from "react-router-dom";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../i18n/LanguageContext";
import OAuthButtons from "./OAuthButtons";
import AuthLayout from "./AuthLayout";
import { inp, btn, label } from "./authStyles";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, user, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const [form,    setForm]    = useState({ email: "", password: "" });
  const [error,   setError]   = useState("");
  const [info,    setInfo]    = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  useEffect(() => {
    const q = searchParams.get("error");
    const r = searchParams.get("reset");
    if (q === "oauth_failed")    setError("Google or GitHub sign-in failed. Try again or use email.");
    else if (q === "session_failed") setError("Could not complete sign-in. Please try again.");
    if (r === "success") setInfo("Password reset successfully. You can now log in.");
  }, [searchParams]);

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
      const res = await api.post("/api/auth/login", form);
      await login(res.data.token, res.data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data?.requiresVerification) {
        navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
        return;
      }
      setError(data?.message || err.message || "Login failed. Backend may be unreachable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{t("Welcome back")}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t("Sign in to your farming dashboard")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={label} htmlFor="email">{t("Email or Username")}</label>
            <input id="email" type="text" name="email" autoComplete="username"
              placeholder="you@example.com or username"
              value={form.email} onChange={handleChange} required className={inp} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={label} htmlFor="password" style={{ marginBottom: 0 }}>{t("Password")}</label>
              <Link to="/forgot-password" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                {t("Forgot password?")}
              </Link>
            </div>
            <div className="relative">
              <input id="password" type={showPw ? "text" : "password"} name="password"
                placeholder="••••••••" value={form.password} onChange={handleChange} required className={inp} />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 text-xs">
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
              <span className="flex-shrink-0 mt-0.5">⚠</span>{error}
            </div>
          )}
          {info && (
            <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
              <span className="flex-shrink-0 mt-0.5">✓</span>{info}
            </div>
          )}

          <button type="submit" disabled={loading} className={btn}>
            {loading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Signing in…</> : t("Sign In")}
          </button>
        </form>

        <OAuthButtons mode="login" />

        <p className="text-center text-sm text-gray-500 dark:text-slate-400">
          {t("Don't have an account?")}{" "}
          <Link to="/signup" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">{t("Sign Up")}</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
