import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./auth.css";

const OAuthCallback = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("token");
    const error = query.get("error");

    if (token) {
      localStorage.setItem("token", token);
      onLogin?.();
      navigate("/dashboard");
    } else {
      // If no token or error, redirect to login
      navigate("/login");
    }
  }, [location.search, navigate, onLogin]); // ✅ Fix: proper dependency array

  return (
    <div className="auth-page">
      <div className="auth-card auth-callback">
        <span className="auth-brand-icon" style={{ fontSize: "2.5rem" }}>🌾</span>
        <h2 className="auth-title">Logging you in...</h2>
        <div className="auth-spinner-large" />
      </div>
    </div>
  );
};

export default OAuthCallback;