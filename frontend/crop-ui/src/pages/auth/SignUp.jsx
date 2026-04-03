import { useState, useEffect } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import OAuthButtons from "./OAuthButtons";
import { auth, setupRecaptcha } from "../../firebase";
import { signInWithPhoneNumber } from "firebase/auth";
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
    { ok: c.length, text: "At least 8 characters" },
    { ok: c.upper, text: "One uppercase letter (A-Z)" },
    { ok: c.lower, text: "One lowercase letter (a-z)" },
    { ok: c.underscore, text: "One underscore (_)" },
    { ok: c.validChars, text: "Only letters, numbers, underscores" },
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

  /** @type {'email' | 'mobile'} */
  const [mode, setMode] = useState("email");
  const [mobileStep, setMobileStep] = useState("details"); // details | otp

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    confirm: "",
  });
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMobileOtp, setLoadingMobileOtp] = useState(false);

  useEffect(() => {
    setError("");
    setInfo("");
    setMobileStep("details");
    setOtp("");
  }, [mode]);

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

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      if (res.data.requiresVerification) {
        navigate(`/verify-email?email=${encodeURIComponent(res.data.email)}`);
        return;
      }
      await login(res.data.token, res.data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Signup failed. Backend may be unreachable.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const sendSignupOtp = async () => {
    const rawPhone = form.phoneNumber.trim();
    const phone = rawPhone.replace(/\D/g, "");
    if (phone.length < 10) {
      setError("Enter a valid mobile number (10–15 digits).");
      return;
    }
    if (!form.name.trim()) {
      setError("Enter your name.");
      return;
    }

    const normalized = rawPhone.startsWith("+") ? `+${phone}` : `+91${phone}`;
    setLoadingMobileOtp(true);
    setError("");
    setInfo("");

    try {
      // Ensure recaptcha container exists
      const recaptchaContainer = document.getElementById("recaptcha-container");
      if (!recaptchaContainer) {
        throw new Error("Recaptcha container not found");
      }

      const verifier = setupRecaptcha("recaptcha-container");
      if (!verifier) {
        throw new Error("Failed to setup recaptcha verifier");
      }

      const result = await signInWithPhoneNumber(auth, normalized, verifier);
      setConfirmationResult(result);
      setInfo(`OTP sent to ${normalized}.`);
      setMobileStep("otp");
      setOtp("");
    } catch (err) {
      console.error("Firebase OTP error:", err);
      setError(`Could not send Firebase OTP: ${err.message}`);
    } finally {
      setLoadingMobileOtp(false);
    }
  };

  const handleMobileRequestOtp = async (e) => {
    e.preventDefault();
    await sendSignupOtp();
  };

  const handleMobileVerify = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (!confirmationResult) {
      setError("No OTP request in progress. Please request code again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userCredential = await confirmationResult.confirm(otp.replace(/\D/g, ""));
      const phoneNumber = userCredential.user?.phoneNumber;
      if (!phoneNumber) {
        throw new Error("Firebase verification did not return phone number.");
      }

      const res = await api.post("/api/auth/mobile/register/verify-firebase", {
        phoneNumber,
        name: form.name.trim(),
        password: form.password,
      });
      await login(res.data.token, res.data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Could not create account.";
      setError(msg);
      setOtp("");
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
        <div id="recaptcha-container" />

        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Start optimizing your harvest today</p>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            className={`auth-tab ${mode === "email" ? "active" : ""}`}
            onClick={() => setMode("email")}
          >
            Email
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === "mobile" ? "active" : ""}`}
            onClick={() => setMode("mobile")}
          >
            Mobile
          </button>
        </div>

        {mode === "email" && (
          <form onSubmit={handleEmailSubmit} className="auth-form">
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
                placeholder="Min_8_Chars_1Upper"
                value={form.password}
                onChange={handleChange}
                required
              />
              <PasswordHints password={form.password} />
            </div>

            {error && <p className="auth-error">⚠ {error}</p>}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : "Create Account"}
            </button>
          </form>
        )}

        {mode === "mobile" && mobileStep === "details" && (
          <form onSubmit={handleMobileRequestOtp} className="auth-form">
            <p className="auth-tab-hint">
              We’ll send a 6-digit code by SMS (Firebase Phone Auth). Enter it on the next step with your password to register.
            </p>
            <div className="form-group">
              <label htmlFor="m-name">Full Name</label>
              <input
                id="m-name"
                name="name"
                placeholder="John Farmer"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="m-phone">Mobile number</label>
              <input
                id="m-phone"
                type="tel"
                name="phoneNumber"
                placeholder="e.g. 9876543210"
                value={form.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>

            {error && <p className="auth-error">⚠ {error}</p>}

            <button type="submit" className="auth-btn" disabled={loadingMobileOtp}>
              {loadingMobileOtp ? <span className="auth-spinner" /> : "Send OTP via SMS"}
            </button>
          </form>
        )}

        {mode === "mobile" && mobileStep === "otp" && (
          <form onSubmit={handleMobileVerify} className="auth-form">
            <p className="auth-tab-hint">
              Enter the code sent to <strong>{form.phoneNumber}</strong>. If it doesn&apos;t match, try again or resend a
              new code.
            </p>

            <div className="form-group">
              <label htmlFor="m-otp">OTP</label>
              <input
                id="m-otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                required
                autoComplete="one-time-code"
                style={{ letterSpacing: "0.3em", fontSize: "1.25rem", textAlign: "center" }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="m-password">Password</label>
              <input
                id="m-password"
                type="password"
                name="password"
                placeholder="Min_8_Chars_1Upper"
                value={form.password}
                onChange={handleChange}
                required
              />
              <PasswordHints password={form.password} />
            </div>

            <div className="form-group">
              <label htmlFor="m-confirm">Confirm password</label>
              <input
                id="m-confirm"
                type="password"
                name="confirm"
                placeholder="••••••••"
                value={form.confirm}
                onChange={handleChange}
                required
              />
            </div>

            {info && <p className="auth-info">✓ {info}</p>}
            {error && <p className="auth-error">⚠ {error}</p>}

            <button type="submit" className="auth-btn" disabled={loading || loadingMobileOtp}>
              {loading ? <span className="auth-spinner" /> : "Verify & create account"}
            </button>

            <button
              type="button"
              className="auth-btn auth-btn-outline"
              disabled={loading || loadingMobileOtp}
              onClick={sendSignupOtp}
            >
              {loadingMobileOtp ? <span className="auth-spinner" /> : "Resend SMS code"}
            </button>

            <button
              type="button"
              className="auth-link-btn"
              style={{ marginTop: "0.75rem", display: "block", width: "100%", textAlign: "center" }}
              onClick={() => {
                setMobileStep("details");
                setOtp("");
                setError("");
                setInfo("");
              }}
            >
              Back
            </button>
          </form>
        )}

        <OAuthButtons mode="signup" />

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
