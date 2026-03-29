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

  /** @type {'email' | 'phone'} */
  const [method, setMethod] = useState("email");
  const [form, setForm] = useState({ email: "", password: "", phoneNumber: "" });
  const [otp, setOtp] = useState("");
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPhonePw, setLoadingPhonePw] = useState(false);
  const [loadingPhoneOtp, setLoadingPhoneOtp] = useState(false);

  useEffect(() => {
    const q = searchParams.get("error");
    const r = searchParams.get("reset");
    if (q === "oauth_failed") setError("Google or GitHub sign-in failed. Try again or use email.");
    else if (q === "session_failed") setError("Could not complete sign-in. Please try again.");
    if (r === "success") setInfo("Password reset successfully. You can now log in.");
  }, [searchParams]);

  useEffect(() => {
    setError("");
    setInfo("");
    setPhoneOtpSent(false);
    setOtp("");
  }, [method]);

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

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/auth/login", { email: form.email.trim(), password: form.password });
      await login(res.data.token, res.data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data?.requiresVerification && data.email) {
        navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
        return;
      }
      setError(data?.message || err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhonePasswordLogin = async (e) => {
    e.preventDefault();
    setLoadingPhonePw(true);
    setError("");
    try {
      const res = await api.post("/api/auth/login", {
        phoneNumber: form.phoneNumber.replace(/\D/g, ""),
        password: form.password,
      });
      await login(res.data.token, res.data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data?.requiresVerification) {
        setError(data?.message || "Please complete verification before logging in.");
        return;
      }
      setError(data?.message || err.message || "Login failed.");
    } finally {
      setLoadingPhonePw(false);
    }
  };

  const handleSendLoginOtp = async () => {
    const phone = form.phoneNumber.replace(/\D/g, "");
    if (phone.length < 10) {
      setError("Enter a valid mobile number first.");
      return;
    }
    setLoadingPhoneOtp(true);
    setError("");
    setInfo("");
    try {
      const res = await api.post("/api/auth/mobile/login/request-otp", { phoneNumber: phone });
      setPhoneOtpSent(true);
      const hint =
        res.data?.smsSent === false
          ? " Add Twilio credentials to the server to receive SMS; until then check the server console for the code."
          : " Check your phone for the code.";
      setInfo((res.data?.message || "If this number is registered, a code was sent.") + hint);
      setOtp("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not send OTP.");
      setPhoneOtpSent(false);
    } finally {
      setLoadingPhoneOtp(false);
    }
  };

  const handleVerifyLoginOtp = async (e) => {
    e.preventDefault();
    const phone = form.phoneNumber.replace(/\D/g, "");
    setLoadingPhoneOtp(true);
    setError("");
    try {
      const res = await api.post("/api/auth/mobile/login/verify", {
        phoneNumber: phone,
        otp: otp.replace(/\D/g, ""),
      });
      await login(res.data.token, res.data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired code.");
      setOtp("");
    } finally {
      setLoadingPhoneOtp(false);
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

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            className={`auth-tab ${method === "email" ? "active" : ""}`}
            onClick={() => setMethod("email")}
          >
            Email
          </button>
          <button
            type="button"
            role="tab"
            className={`auth-tab ${method === "phone" ? "active" : ""}`}
            onClick={() => setMethod("phone")}
          >
            Phone
          </button>
        </div>

        {method === "email" && (
          <form onSubmit={handleEmailLogin} className="auth-form">
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
                autoComplete="email"
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
                autoComplete="current-password"
              />
              <div style={{ textAlign: "right", marginTop: "0.25rem" }}>
                <Link to="/forgot-password" className="auth-link-small">
                  Forgot password?
                </Link>
              </div>
            </div>

            {error && <p className="auth-error">⚠ {error}</p>}
            {info && <p className="auth-info">✓ {info}</p>}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : "Login"}
            </button>
          </form>
        )}

        {method === "phone" && (
          <div className="auth-form">
            <p className="auth-tab-hint">
              Use your registered mobile number with a password, or request a one-time code (SMS via Twilio on the
              server).
            </p>

            <div className="form-group">
              <label htmlFor="phoneNumber">Mobile number</label>
              <input
                id="phoneNumber"
                type="tel"
                name="phoneNumber"
                placeholder="e.g. 9876543210 or with country code"
                value={form.phoneNumber}
                onChange={(e) => {
                  handleChange(e);
                  setPhoneOtpSent(false);
                  setOtp("");
                }}
                autoComplete="tel"
              />
            </div>

            <form onSubmit={handlePhonePasswordLogin}>
              <div className="form-group">
                <label htmlFor="password-phone">Password</label>
                <input
                  id="password-phone"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <div style={{ textAlign: "right", marginTop: "0.25rem" }}>
                  <Link to="/forgot-password" className="auth-link-small">
                    Forgot password?
                  </Link>
                </div>
              </div>

              {error && !phoneOtpSent && <p className="auth-error">⚠ {error}</p>}

              <button type="submit" className="auth-btn" disabled={loadingPhonePw || loadingPhoneOtp}>
                {loadingPhonePw ? <span className="auth-spinner" /> : "Login with password"}
              </button>
            </form>

            <div className="oauth-divider" style={{ margin: "1.25rem 0" }}>
              <span>or use OTP</span>
            </div>

            {phoneOtpSent && (
              <form onSubmit={handleVerifyLoginOtp} className="auth-form" style={{ marginTop: 0 }}>
                <div className="form-group">
                  <label htmlFor="otp">OTP code</label>
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
                <button type="submit" className="auth-btn" disabled={loadingPhoneOtp}>
                  {loadingPhoneOtp ? <span className="auth-spinner" /> : "Verify & sign in"}
                </button>
                <button
                  type="button"
                  className="auth-link-btn"
                  style={{ marginTop: "0.75rem", display: "block", width: "100%", textAlign: "center" }}
                  disabled={loadingPhoneOtp}
                  onClick={handleSendLoginOtp}
                >
                  Resend code
                </button>
              </form>
            )}

            {!phoneOtpSent && (
              <>
                {error && <p className="auth-error">⚠ {error}</p>}
                {info && <p className="auth-info">✓ {info}</p>}
                <button
                  type="button"
                  className="auth-btn auth-btn-outline"
                  disabled={loadingPhoneOtp || loadingPhonePw}
                  onClick={handleSendLoginOtp}
                >
                  {loadingPhoneOtp ? <span className="auth-spinner" /> : "Send OTP to this number"}
                </button>
              </>
            )}
          </div>
        )}

        <OAuthButtons mode="login" />

        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
