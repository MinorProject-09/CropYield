import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "./AuthLayout";
import { btn } from "./authStyles";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const email = searchParams.get("email") || "";

  const [otp,       setOtp]       = useState("");
  const [error,     setError]     = useState("");
  const [info,      setInfo]      = useState("");
  const [loading,   setLoading]   = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await api.post("/api/auth/verify-email", { email, otp });
      await login(res.data.token, res.data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed.");
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setResending(true); setError(""); setInfo("");
    try {
      await api.post("/api/auth/resend-verification", { email });
      setInfo("A new OTP has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend OTP.");
    } finally { setResending(false); }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-3xl mx-auto">
          📧
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Verify your email</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 leading-relaxed">
            We sent a 6-digit code to<br />
            <span className="font-semibold text-gray-700 dark:text-slate-300">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* OTP input — large centered digits */}
          <div>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
              required
              className="w-full border-2 border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-800/80 outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 transition placeholder:text-gray-200 dark:placeholder:text-slate-700"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
              <span>⚠</span>{error}
            </div>
          )}
          {info && (
            <div className="flex items-start gap-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-400">
              <span>✓</span>{info}
            </div>
          )}

          <button type="submit" disabled={loading || otp.length < 6} className={btn}>
            {loading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Verifying…</> : "Verify Email →"}
          </button>
        </form>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Didn't receive it?{" "}
            <button onClick={handleResend} disabled={resending}
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline disabled:opacity-50">
              {resending ? "Sending…" : "Resend code"}
            </button>
          </p>
          <p className="text-sm">
            <Link to="/login" className="text-gray-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition">
              ← Back to Login
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
