import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";

const CROPS = ["Rice 🌾","Wheat 🌿","Maize 🌽","Banana 🍌","Mango 🥭","Coffee ☕","Grapes 🍇","Cotton 🌿"];
const STATS = [
  { value: "99.7%", label: "Model Accuracy",    icon: "🎯" },
  { value: "22",    label: "Crops Supported",   icon: "🌱" },
  { value: "7",     label: "Soil Parameters",   icon: "🧪" },
  { value: "Live",  label: "IoT Monitoring",    icon: "📡" },
];

function FloatingCrop({ emoji, style }) {
  return (
    <div className="absolute text-2xl select-none pointer-events-none animate-float opacity-20 dark:opacity-10" style={style}>
      {emoji}
    </div>
  );
}

export default function Hero() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [cropIdx, setCropIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCropIdx(i => (i + 1) % CROPS.length), 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-hero hero-grid">
      {/* Floating decorative crops */}
      <FloatingCrop emoji="🌾" style={{ top: "12%", left: "6%",  animationDelay: "0s",    animationDuration: "4s"   }} />
      <FloatingCrop emoji="🌿" style={{ top: "20%", right: "8%", animationDelay: "0.8s",  animationDuration: "5s"   }} />
      <FloatingCrop emoji="🌽" style={{ bottom: "25%", left: "4%", animationDelay: "1.5s", animationDuration: "3.5s" }} />
      <FloatingCrop emoji="🍌" style={{ bottom: "15%", right: "6%", animationDelay: "0.4s", animationDuration: "4.5s" }} />
      <FloatingCrop emoji="🧪" style={{ top: "55%", left: "12%", animationDelay: "2s",   animationDuration: "6s"   }} />
      <FloatingCrop emoji="📡" style={{ top: "35%", right: "15%", animationDelay: "1s",  animationDuration: "4s"   }} />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-400/10 dark:bg-emerald-500/6 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-teal-400/8 dark:bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="max-w-3xl">

          {/* Badge */}
          <div className="animate-fade-up" style={{ animationDelay: "0ms" }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t("AI-Powered Agriculture Platform")}
            </span>
          </div>

          {/* Headline */}
          <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.05] tracking-tight text-gray-900 dark:text-white mb-4">
              {t("Grow smarter")}<br />
              <span className="gradient-text">{t("with AI")}</span>
            </h1>
          </div>

          {/* Rotating crop */}
          <div className="animate-fade-up mb-4" style={{ animationDelay: "140ms" }}>
            <div className="inline-flex items-center gap-2 text-xl font-semibold text-gray-600 dark:text-slate-300">
              <span>{t("Best crop for your soil")}:</span>
              <span key={cropIdx} className="animate-fade-in text-emerald-600 dark:text-emerald-400 font-bold">
                {CROPS[cropIdx]}
              </span>
            </div>
          </div>

          {/* Subtitle */}
          <div className="animate-fade-up" style={{ animationDelay: "200ms" }}>
            <p className="text-lg text-gray-500 dark:text-slate-400 leading-relaxed mb-10 max-w-xl">
              {t("Enter your soil data, get an instant AI recommendation with yield estimates, profit analysis, and real-time IoT monitoring — all in one platform.")}
            </p>
          </div>

          {/* CTAs */}
          <div className="animate-fade-up flex flex-wrap gap-3 mb-16" style={{ animationDelay: "260ms" }}>
            <Link to={user ? "/prediction" : "/signup"}>
              <button className="btn-primary text-base px-8 py-4">
                {user ? t("Run Prediction →") : t("Get Started Free →")}
              </button>
            </Link>
            <a href="#features">
              <button className="btn-ghost text-base px-8 py-4">
                {t("See Features")}
              </button>
            </a>
          </div>

          {/* Stats */}
          <div className="animate-fade-up stagger grid grid-cols-2 sm:grid-cols-4 gap-3" style={{ animationDelay: "320ms" }}>
            {STATS.map(({ value, label, icon }) => (
              <div key={label} className="glass rounded-2xl p-4 text-center card-glow">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{value}</div>
                <div className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5">{t(label)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f0fdf4] dark:from-[#060a0f] to-transparent pointer-events-none" />
    </section>
  );
}
