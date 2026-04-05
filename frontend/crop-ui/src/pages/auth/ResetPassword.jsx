import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/api";
import "./auth.css";

const PasswordHints = ({ password }) => {
  if (!password) return null;
  const hints = [
    { ok: password.length >= 8,           text: "At least 8 characters" },
    { ok: /[A-Z]/.test(password),         text: "One uppercase letter (A-Z)" },
    { ok: /[a-z]/.test(password),         text: "One lowercase letter (a-z)" },
    { ok: /_/.test(password),             text: "One underscore (_)" },
    { ok: /^[A-Za-z0-9_]*$/.test(password), text: "Only letters, numbers, underscores" },
  ];
  return (
    <ul className="auth-hints">
      {hints.map((h) => (
        <li key={h.text} className={h.ok ? "hint-ok" : "hint-fail"}>
          {h.ok ? "✓" : "✗"} {h.text}
        </li>
      ))}
    </ul>
  );
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";

  const [form, setForm] = useState({ otp: "", newPassword: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (form.newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/api/auth/reset-password", {
        email: emailFromQuery,
        otp: form.otp,
        newPassword: form.newPassword,
      });
      navigate("/login?reset=success");
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-icon">🌾</span>
          <h1 className="auth-brand-name">CropYield</h1>
        </div>

        <h2 className="auth-title">Reset password</h2>
        <p className="auth-subtitle">
          Enter the code sent to <strong>{emailFromQuery}</strong> and your new password.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="otp">Reset Code</label>
            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={form.otp}
              onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, "") })}
              required
              style={{ letterSpacing: "0.3em", fontSize: "1.25rem", textAlign: "center" }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="Min_8_Chars_1Upper"
              value={form.newPassword}
              onChange={handleChange}
              required
            />
            <PasswordHints password={form.newPassword} />
          </div>

          <div className="form-group">
            <label htmlFor="confirm">Confirm Password</label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              placeholder="••••••••"
              value={form.confirm}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className="auth-error">⚠ {error}</p>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : "Reset Password"}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
