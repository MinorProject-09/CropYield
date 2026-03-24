import React, { useEffect, useState } from "react";
import { useNavigate, Link, useSearchParams, Navigate } from "react-router-dom";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import OAuthButtons from "./OAuthButtons";
import "./auth.css";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, user, loading: authLoading } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = searchParams.get("error");
    if (q === "oauth_failed") {
      setError("Google or GitHub sign-in failed. Try again or use email.");
    } else if (q === "session_failed") {
      setError("Could not complete sign-in. Please try again.");
    }
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

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/auth/login", form);
      await login(res.data.token, res.data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Backend may be unreachable.";
      setError(message);
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

        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to your farming dashboard</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <p className="auth-error">⚠ {error}</p>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : "Login"}
          </button>
        </form>

        <OAuthButtons mode="login" />

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;