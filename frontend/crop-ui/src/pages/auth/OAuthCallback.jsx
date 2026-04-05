import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./auth.css";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("token");
    const error = query.get("error");

    if (error) {
      navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
      return;
    }

    if (token) {
      login(token)
        .then(() => navigate("/dashboard", { replace: true }))
        .catch(() => navigate("/login?error=session_failed", { replace: true }));
    } else {
      navigate("/login", { replace: true });
    }
  }, [location.search, navigate, login]);

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