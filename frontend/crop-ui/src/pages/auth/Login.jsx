import React, { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams, Navigate } from "react-router-dom";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../i18n/LanguageContext";
import OAuthButtons from "./OAuthButtons";
import "./auth.css";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, user, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = searchParams.get("error");
    const r = searchParams.get("reset");
    if (q === "oauth_failed") setError("Google or GitHub sign-in failed. Try again or use email.");
    else if (q === "session_failed") setError("Could not complete sign-in. Please try again.");
    if (r === "success") setInfo("Password reset successfully. You can now log in.");
  }, [searchParams]);

  if (authLoading) {
    return (
      <div className="auth-page">
        <div className="auth-card auth-callback">
          <p className="auth-subtitle">Loading…</p>
        </div>
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/auth/login", form);
      await login(res.data.token, res.data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data?.requiresVerification) {
        // Redirect to verify page with email pre-filled
        navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
        return;
      }
      setError(data?.message || err.message || "Login failed. Backend may be unreachable.");
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

        <h2 className="auth-title">{t("Welcome back")}</h2>
        <p className="auth-subtitle">{t("Sign in to your farming dashboard")}</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">{t("Email or Username")}</label>
            <input
              id="email"
              type="text"
              name="email"
              placeholder="you@example.com or your username"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">{t("Password")}</label>
            <input id="password" type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
            <div style={{ textAlign: "right", marginTop: "0.25rem" }}>
              <Link to="/forgot-password" className="auth-link-small">{t("Forgot password?")}</Link>
            </div>
          </div>
          {error && <p className="auth-error">⚠ {error}</p>}
          {info && <p className="auth-info">✓ {info}</p>}
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : t("Login")}
          </button>
        </form>

        <OAuthButtons mode="login" />

        <p className="auth-footer">
          {t("Don't have an account?")} <Link to="/signup">{t("Sign Up")}</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
