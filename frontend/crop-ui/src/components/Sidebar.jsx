import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { to: "/prediction", label: "Prediction",  icon: "🌾", desc: "AI crop recommendation", color: "#16a34a" },
  { to: "/weather",    label: "Weather",     icon: "🌤", desc: "Farm forecast & risks",  color: "#0ea5e9" },
  { to: "/market",     label: "Market",      icon: "📈", desc: "Live mandi prices",      color: "#f59e0b" },
  { to: "/iot",        label: "IoT",         icon: "📡", desc: "Soil sensor dashboard",  color: "#8b5cf6" },
  { to: "/community",  label: "Community",   icon: "🤝", desc: "Farmer Q&A forum",       color: "#ec4899" },
  { to: "/schemes",    label: "Schemes",     icon: "📋", desc: "Govt scheme finder",     color: "#10b981" },
  { to: "/calendar",   label: "Calendar",    icon: "📅", desc: "Crop sowing calendar",   color: "#f97316" },
  { to: "/dashboard",  label: "Dashboard",   icon: "⚡", desc: "My farm overview",       color: "#6366f1" },
];

export default function Sidebar({ open, onClose }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  useEffect(() => { onClose(); }, [location.pathname]);

  const isActive = to => location.pathname === to;
  const links = NAV_LINKS.filter(() => !!user);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${open ? "bg-black/50 backdrop-blur-sm pointer-events-auto" : "bg-transparent pointer-events-none"}`}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        ref={ref}
        className={`fixed top-0 left-0 h-full z-50 w-72 flex flex-col transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          borderRight: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "4px 0 40px rgba(0,0,0,0.12)",
        }}
      >
        {/* Dark mode sidebar */}
        <div className="dark:hidden absolute inset-0 rounded-none" />
        <div className="hidden dark:block absolute inset-0"
          style={{ background: "rgba(6,10,15,0.92)", borderRight: "1px solid rgba(255,255,255,0.06)" }} />

        <div className="relative flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-5 h-16 border-b border-black/5 dark:border-white/5 flex-shrink-0">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-lg">🌾</div>
              <span className="font-extrabold text-gray-900 dark:text-white text-base">
                CropYield <span className="text-emerald-600 dark:text-emerald-400">AI</span>
              </span>
            </Link>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 transition text-lg">
              ✕
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {links.length === 0 ? (
              <div className="px-3 py-8 text-center space-y-3">
                <p className="text-sm text-gray-400 dark:text-slate-500">Sign in to access all features</p>
                <div className="flex gap-2 justify-center">
                  <Link to="/login" onClick={onClose}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition">
                    Login
                  </Link>
                  <Link to="/signup" onClick={onClose}
                    className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl transition">
                    Sign Up
                  </Link>
                </div>
              </div>
            ) : links.map(({ to, label, icon, desc, color }) => {
              const active = isActive(to);
              return (
                <Link key={to} to={to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-150 group ${
                    active ? "shadow-sm" : "hover:bg-black/4 dark:hover:bg-white/4"
                  }`}
                  style={active ? { background: `${color}12`, border: `1px solid ${color}25` } : {}}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                    style={{
                      background: active ? `${color}20` : "rgba(0,0,0,0.04)",
                      border: active ? `1px solid ${color}30` : "1px solid transparent",
                    }}>
                    {icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p 
                      style={{ color: active ? color : undefined }}
                      className={active ? "" : "text-gray-800 dark:text-slate-200 text-sm font-semibold leading-tight"}>
                      {t(label)}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 truncate">{desc}</p>
                  </div>
                  {active && (
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User footer */}
          {user && (
            <div className="px-4 py-4 border-t border-black/5 dark:border-white/5 flex-shrink-0">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/3 dark:bg-white/3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
                  {user.name?.[0]?.toUpperCase() || "F"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
