import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";

const LINKS = {
  Platform: [
    { to: "/prediction", label: "Crop Prediction" },
    { to: "/weather",    label: "Weather Forecast" },
    { to: "/market",     label: "Market Prices" },
    { to: "/iot",        label: "IoT Dashboard" },
    { to: "/community",  label: "Community" },
  ],
  Tools: [
    { to: "/schemes",    label: "Govt Schemes" },
    { to: "/calendar",   label: "Crop Calendar" },
    { to: "/dashboard",  label: "My Dashboard" },
  ],
  Account: [
    { to: "/signup",     label: "Get Started" },
    { to: "/login",      label: "Sign In" },
  ],
};

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, #060a0f 0%, #030507 100%)" }}>
      {/* Top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-emerald-500/4 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-xl">🌾</div>
              <span className="font-extrabold text-white text-lg">
                AgriMind <span className="text-emerald-400">AI</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-5">
              {t("AI-powered crop intelligence for Indian farmers. Built with soil science, machine learning, and a deep respect for agriculture.")}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="badge badge-green text-xs">🇮🇳 Made for India</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/5 text-slate-400 border border-white/8">22 Crops</span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-5">{t(section)}</h4>
              <ul className="space-y-3">
                {links.map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to}
                      className="text-sm text-slate-500 hover:text-emerald-400 transition-colors duration-150">
                      {t(label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600">© 2026 CropYield AI Platform. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Helping Indian farmers make smarter decisions
          </p>
        </div>
      </div>
    </footer>
  );
}
