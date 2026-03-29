import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api";
import "./auth.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  /** @type {'email' | 'phone'} */
  const [channel, setChannel] = useState("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload =
        channel === "email"
          ? { email: email.trim() }
          : { phoneNumber: phone.replace(/\D/g, "") };
      if (channel === "phone" && payload.phoneNumber.length < 10) {
        setError("Enter a valid mobile number.");
        setLoading(false);
        return;
      }
      await api.post("/api/auth/forgot-password", payload);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const goToReset = () => {
    if (channel === "email") {
      navigate(`/reset-password?email=${encodeURIComponent(email.trim())}`);
    } else {
      navigate(`/reset-password?phone=${encodeURIComponent(phone.replace(/\D/g, ""))}`);
    }
  };

  if (sent) {
    const label = channel === "email" ? email.trim() : phone.replace(/\D/g, "");
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div className="auth-brand" style={{ justifyContent: "center" }}>
            <span className="auth-brand-icon">🌾</span>
            <h1 className="auth-brand-name">CropYield</h1>
          </div>
          <p style={{ fontSize: "2rem", margin: "1rem 0" }}>{channel === "email" ? "📬" : "📱"}</p>
          <h2 className="auth-title">Check your {channel === "email" ? "inbox" : "messages"}</h2>
          <p className="auth-subtitle">
            If <strong>{label}</strong> is registered, you&apos;ll receive a reset code shortly.
            {channel === "phone" && (
              <>
                {" "}
                In development, the code is printed in the server console.
              </>
            )}
          </p>
          <button className="auth-btn" style={{ marginTop: "1.5rem" }} onClick={goToReset}>
            Enter reset code
          </button>
          <p className="auth-footer">
            <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-icon">🌾</span>
          <h1 className="auth-brand-name">CropYield</h1>
        </div>

        <h2 className="auth-title">Forgot password?</h2>
        <p className="auth-subtitle">We&apos;ll send a reset code to your email or registered mobile number.</p>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            className={`auth-tab ${channel === "email" ? "active" : ""}`}
            onClick={() => setChannel("email")}
          >
            Email
          </button>
          <button
            type="button"
            className={`auth-tab ${channel === "phone" ? "active" : ""}`}
            onClick={() => setChannel("phone")}
          >
            Mobile
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {channel === "email" ? (
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="phone">Mobile number</label>
              <input
                id="phone"
                type="tel"
                placeholder="Registered mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          )}

          {error && <p className="auth-error">⚠ {error}</p>}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : "Send reset code"}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
