import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/api";
import OAuthButtons from "./OAuthButtons";
import "./auth.css";

const SignUp = ({ onSignUp }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    farmSize: "",
    soilType: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/auth/register", form);
      localStorage.setItem("token", res.data.token);
      onSignUp?.();
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
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

        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Start optimizing your harvest today</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              placeholder="John Farmer"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

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

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="farmSize">Farm Size (ha)</label>
              <input
                id="farmSize"
                name="farmSize"
                placeholder="e.g. 12.5"
                value={form.farmSize}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="soilType">Soil Type</label>
              <input
                id="soilType"
                name="soilType"
                placeholder="e.g. Loamy"
                value={form.soilType}
                onChange={handleChange} /* ✅ Fix: was missing */
              />
            </div>
          </div>

          {error && <p className="auth-error">⚠ {error}</p>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : "Create Account"}
          </button>
        </form>

        <OAuthButtons mode="signup" />

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;