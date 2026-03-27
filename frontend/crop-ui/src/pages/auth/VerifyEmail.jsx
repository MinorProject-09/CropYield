import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import "./auth.css";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const emailFromQuery = searchParams.get("email") || "";
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/auth/verify-email", { email: emailFromQuery, otp });
      await login(res.data.token, res.data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    setInfo("");
    try {
      await api.post("/api/auth/resend-verification", { email: emailFromQuery });
      setInfo("A new OTP has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-icon">🌾</span>
          <h1 className="auth-brand-name">CropYield</h1>
        </div>

        <h2 className="auth-title">Verify your email</h2>
        <p className="auth-subtitle">
          We sent a 6-digit code to <strong>{emailFromQuery}</strong>
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="otp">Verification Code</label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              required
              style={{ letterSpacing: "0.3em", fontSize: "1.25rem", textAlign: "center" }}
            />
          </div>

          {error && <p className="auth-error">⚠ {error}</p>}
          {info && <p className="auth-info">✓ {info}</p>}

          <button type="submit" className="auth-btn" disabled={loading || otp.length < 6}>
            {loading ? <span className="auth-spinner" /> : "Verify Email"}
          </button>
        </form>

        <p className="auth-footer">
          Didn't receive it?{" "}
          <button
            onClick={handleResend}
            disabled={resending}
            className="auth-link-btn"
          >
            {resending ? "Sending…" : "Resend code"}
          </button>
        </p>

        <p className="auth-footer">
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
