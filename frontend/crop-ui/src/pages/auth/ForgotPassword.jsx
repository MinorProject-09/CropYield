import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api";
import AuthLayout from "./AuthLayout";
import { inp, btn, label } from "./authStyles";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email,   setEmail]   = useState("");
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await api.post("/api/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) return (
    <AuthLayout>
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-3xl mx-auto">📬</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Check your inbox</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 leading-relaxed">
            If <span className="font-semibold text-gray-700 dark:text-slate-300">{email}</span> is registered,
            you'll receive a 6-digit reset code shortly.
          </p>
        </div>
        <button onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}`)} className={btn}>
          Enter reset code →
        </button>
        <p className="text-sm text-gray-400 dark:text-slate-500">
          <Link to="/login" className="text-emerald-600 dark:text-emerald-400 hover:underline">← Back to Login</Link>
        </p>
      </div>
    </AuthLayout>
  );

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Forgot password?</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Enter your email and we'll send you a reset code.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={label} htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required className={inp} />
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
              <span>⚠</span>{error}
            </div>
          )}

          <button type="submit" disabled={loading} className={btn}>
            {loading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Sending…</> : "Send reset code"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 dark:text-slate-500">
          <Link to="/login" className="text-emerald-600 dark:text-emerald-400 hover:underline">← Back to Login</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
