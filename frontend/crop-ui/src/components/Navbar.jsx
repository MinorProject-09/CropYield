import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "../i18n/LanguageContext";
import { getNotifications, markAllNotifRead, markNotifRead } from "../api/api";
import { io as socketIO } from "socket.io-client";
import Sidebar from "./Sidebar";

const SERVER = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5001";

// ── Notification Bell ─────────────────────────────────────────────────────────
function NotificationBell({ userId }) {
  const navigate = useNavigate();
  const [notes,  setNotes]  = useState([]);
  const [unread, setUnread] = useState(0);
  const [open,   setOpen]   = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!userId) return;
    getNotifications().then(r => {
      setNotes(r.data.notifications || []);
      setUnread(r.data.unread || 0);
    }).catch(() => {});
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const socket = socketIO(SERVER, { withCredentials: true, transports: ["websocket", "polling"] });
    socket.on("connect", () => socket.emit("join", userId));
    socket.on("notification:new", ({ notification, unread: u }) => {
      setNotes(prev => [notification, ...prev].slice(0, 20));
      setUnread(u);
    });
    return () => socket.disconnect();
  }, [userId]);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleMarkAll() {
    await markAllNotifRead().catch(() => {});
    setNotes(prev => prev.map(n => ({ ...n, read: true })));
    setUnread(0);
  }

  async function handleClick(note) {
    if (!note.read) {
      await markNotifRead(note._id).catch(() => {});
      setNotes(prev => prev.map(n => n._id === note._id ? { ...n, read: true } : n));
      setUnread(u => Math.max(0, u - 1));
    }
    setOpen(false);
    if (note.postId) navigate("/community");
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)}
        className="relative w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition text-base">
        🔔
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#21262d]">
            <span className="text-sm font-bold text-gray-900 dark:text-slate-100">Notifications</span>
            {unread > 0 && (
              <button onClick={handleMarkAll} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notes.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-slate-500">No notifications yet</div>
            ) : notes.map(note => (
              <button key={note._id} onClick={() => handleClick(note)}
                className={`w-full text-left px-4 py-3 border-b border-gray-50 dark:border-[#21262d] hover:bg-gray-50 dark:hover:bg-slate-800 transition flex items-start gap-2 ${!note.read ? "bg-emerald-50/50 dark:bg-emerald-950/20" : ""}`}>
                <span className="text-base flex-shrink-0 mt-0.5">💬</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed">{note.message}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                    {new Date(note.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {!note.read && <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Logout Modal ──────────────────────────────────────────────────────────────
function LogoutModal({ onConfirm, onCancel }) {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#161b22] border border-gray-100 dark:border-[#30363d] rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-2xl mx-auto mb-4">👋</div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-2">{t("Logging out?")}</h3>
        <p className="text-gray-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">{t("You'll need to sign in again to access your dashboard.")}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition text-sm">
            {t("Stay")}
          </button>
          <button onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition text-sm">
            {t("Log out")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogout, setShowLogout] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  const handleLogoutConfirm = () => {
    logout();
    setShowLogout(false);
    navigate("/", { replace: true });
  };

  return (
    <>
      {showLogout && <LogoutModal onConfirm={handleLogoutConfirm} onCancel={() => setShowLogout(false)} />}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <nav className={`sticky top-0 z-40 transition-all duration-200 ${
        scrolled
          ? "bg-white/80 dark:bg-[#060a0f]/80 backdrop-blur-xl border-b border-black/8 dark:border-white/6 shadow-sm"
          : "bg-white/60 dark:bg-[#060a0f]/60 backdrop-blur-md border-b border-black/5 dark:border-white/4"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-14 gap-3">

          {/* ── Hamburger — always visible ── */}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            aria-label="Open navigation"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition flex-shrink-0"
          >
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="0" y1="1" x2="18" y2="1"/>
              <line x1="0" y1="7" x2="18" y2="7"/>
              <line x1="0" y1="13" x2="18" y2="13"/>
            </svg>
          </button>

          {/* ── Brand ── */}
          <Link to="/" className="flex items-center gap-2 font-bold text-gray-900 dark:text-slate-100 hover:opacity-80 transition flex-shrink-0">
            <span className="text-xl">🌾</span>
            <span className="text-base hidden sm:inline">AgriMind <span className="text-emerald-600 dark:text-emerald-400">AI</span></span>
          </Link>

          {/* ── Spacer ── */}
          <div className="flex-1" />

          {/* ── Right controls ── */}
          <div className="flex items-center gap-1.5">

            {/* Dark mode */}
            <button onClick={toggle} aria-label="Toggle theme"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition text-sm">
              {dark ? "☀️" : "🌙"}
            </button>

            {/* Language */}
            <LanguageSwitcher />

            {/* Bell */}
            {user && <NotificationBell userId={user._id} />}

            {user ? (
              <>
                {/* Avatar → dashboard */}
                <Link to="/dashboard"
                  className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center transition flex-shrink-0"
                  title={user.name}>
                  {user.name?.[0]?.toUpperCase() || "F"}
                </Link>

                {/* Logout */}
                <button onClick={() => setShowLogout(true)}
                  className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition font-medium px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 whitespace-nowrap">
                  <span className="text-xs">↩</span>
                  <span className="hidden sm:inline">{t("Log out")}</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login"
                  className="text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                  {t("Login")}
                </Link>
                <Link to="/signup"
                  className="text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg transition shadow-sm">
                  {t("Sign Up")}
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
