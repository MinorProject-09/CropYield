import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../i18n/LanguageContext";
import OAuthButtons from "./OAuthButtons";
import "./auth.css";

// Must match backend rules: uppercase, lowercase, underscore, min 8 chars
function getPasswordStrength(pw) {
  const checks = {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    underscore: /_/.test(pw),
    validChars: /^[A-Za-z0-9_]*$/.test(pw),
  };
  return checks;
}

const PasswordHints = ({ password }) => {
  if (!password) return null;
  const c = getPasswordStrength(password);
  const hints = [
    { ok: c.length,      text: "At least 8 characters" },
    { ok: c.upper,       text: "One uppercase letter (A-Z)" },
    { ok: c.lower,       text: "One lowercase letter (a-z)" },
    { ok: c.underscore,  text: "One underscore (_)" },
    { ok: c.validChars,  text: "Only letters, numbers, underscores" },
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

const SignUp = () => {
  const navigate = useNavigate();
  const { login, user, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/auth/register", form);
      // Registration now requires email verification
      if (res.data.requiresVerification) {
        navigate(`/verify-email?email=${encodeURIComponent(res.data.email)}`);
        return;
      }
      await login(res.data.token, res.data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Signup failed. Backend may be unreachable.";
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

        <h2 className="auth-title">{t("Create your account")}</h2>
        <p className="auth-subtitle">{t("Start optimizing your harvest today")}</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">{t("Full Name")}</label>
            <input id="name" name="name" placeholder="John Farmer" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">{t("Email")}</label>
            <input id="email" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">{t("Password")}</label>
            <input id="password" type="password" name="password" placeholder="Min_8_Chars_1Upper" value={form.password} onChange={handleChange} required />
            <PasswordHints password={form.password} />
          </div>
          {error && <p className="auth-error">⚠ {error}</p>}
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : t("Create Account")}
          </button>
        </form>

        <OAuthButtons mode="signup" />

        <p className="auth-footer">
          {t("Already have an account?")} <Link to="/login">{t("Login")}</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;