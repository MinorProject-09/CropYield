import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "../i18n/LanguageContext";

function LogoutModal({ onConfirm, onCancel }) {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center animate-[cardIn_0.3s_ease_both]">
        <div className="text-4xl mb-3">👋</div>
        <h3 className="text-xl font-bold text-green-900 dark:text-green-400 mb-2">{t("Logging out?")}</h3>
        <p className="text-gray-500 dark:text-slate-400 text-sm mb-6">{t("You'll need to sign in again to access your dashboard and predictions.")}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition">
            {t("Stay")}
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-xl bg-green-700 text-white font-medium hover:bg-green-800 transition">
            {t("Log out")}
          </button>
        </div>
      </div>
    </div>
  );
}

function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogoutConfirm = () => {
    logout();
    setShowLogout(false);
    navigate("/", { replace: true });
  };

  return (
    <>
      {showLogout && (
        <LogoutModal
          onConfirm={handleLogoutConfirm}
          onCancel={() => setShowLogout(false)}
        />
      )}

      <nav className="sticky top-0 z-40 flex justify-between items-center px-6 py-3 bg-green-800 text-white shadow-md">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold hover:opacity-90">
          <span className="text-2xl">🌾</span>
          <span>CropYield AI</span>
        </Link>

        {/* Desktop nav */}
        <div className="space-x-6 hidden md:flex text-sm font-medium">
          <Link to="/" className="hover:text-green-200 transition">{t("Home")}</Link>
          {user && <Link to="/prediction" className="hover:text-green-200 transition">{t("Prediction")}</Link>}
          {user && <Link to="/market" className="hover:text-green-200 transition">{t("Market")}</Link>}
          {user && <Link to="/weather" className="hover:text-green-200 transition">{t("Weather")}</Link>}
          {user && <Link to="/community" className="hover:text-green-200 transition">{t("Community")}</Link>}
          {user && <Link to="/iot" className="hover:text-green-200 transition">{t("IoT")}</Link>}
          {user && <Link to="/schemes" className="hover:text-green-200 transition">{t("Schemes")}</Link>}
          {user && <Link to="/calendar" className="hover:text-green-200 transition">{t("Calendar")}</Link>}
          {user && <Link to="/dashboard" className="hover:text-green-200 transition">{t("Dashboard")}</Link>}
        </div>
        <div className="flex items-center gap-3">
          {/* Dark mode toggle */}
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="flex items-center justify-center w-9 h-9 rounded-lg border border-white/30 hover:bg-white/10 transition text-white text-base"
          >
            {dark ? "☀️" : "🌙"}
          </button>
          <LanguageSwitcher />
          {user ? (
            <>
              
              <button
                type="button"
                onClick={() => setShowLogout(true)}
                className="px-4 py-2 text-sm bg-white text-green-800 rounded-lg font-semibold hover:bg-green-50 transition"
              >
                {t("Log out")}
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button type="button" className="px-4 py-2 text-sm border border-white/50 rounded-lg hover:bg-white/10 transition">
                  {t("Login")}
                </button>
              </Link>
              <Link to="/signup">
                <button type="button" className="px-4 py-2 text-sm bg-white text-green-800 rounded-lg font-semibold hover:bg-green-50 transition">
                  {t("Sign Up")}
                </button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
}

export default Navbar;
