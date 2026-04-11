import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/api";
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
            {c.ok ? "✓" : "✗"} {c.text}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  const [form,    setForm]    = useState({ otp: "", newPassword: "", confirm: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) { setError("Passwords don't match."); return; }
    setLoading(true); setError("");
    try {
      await api.post("/api/auth/reset-password", { email, otp: form.otp, newPassword: form.newPassword });
      navigate("/login?reset=success");
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. Try again.");
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Reset password</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Enter the code sent to <span className="font-semibold text-gray-700 dark:text-slate-300">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* OTP */}
          <div>
            <label className={label} htmlFor="otp">Reset Code</label>
            <input id="otp" name="otp" type="text" inputMode="numeric" maxLength={6}
              placeholder="123456" value={form.otp}
              onChange={e => setForm({ ...form, otp: e.target.value.replace(/\D/g, "") })}
              required
              className="w-full border-2 border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-center text-2xl font-bold tracking-[0.4em] text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-800/80 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 transition placeholder:text-gray-200 dark:placeholder:text-slate-700"
            />
          </div>

          {/* New password */}
          <div>
            <label className={label} htmlFor="newPassword">New Password</label>
            <div className="relative">
              <input id="newPassword" name="newPassword" type={showPw ? "text" : "password"}
                placeholder="Min_8_Chars_1Upper" value={form.newPassword}
                onChange={handleChange} required className={inp} />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
            <PasswordStrength password={form.newPassword} />
          </div>

          {/* Confirm */}
          <div>
            <label className={label} htmlFor="confirm">Confirm Password</label>
            <input id="confirm" name="confirm" type="password"
              placeholder="••••••••" value={form.confirm}
              onChange={handleChange} required className={inp} />
            {form.confirm && form.newPassword !== form.confirm && (
              <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
              <span>⚠</span>{error}
            </div>
          )}

          <button type="submit" disabled={loading} className={btn}>
            {loading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Resetting…</> : "Reset Password →"}
          </button>
        </form>

        <p className="text-center text-sm">
          <Link to="/login" className="text-gray-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition">
            ← Back to Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
