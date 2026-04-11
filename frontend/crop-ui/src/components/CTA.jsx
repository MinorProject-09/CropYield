import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";

export default function CTA() {
  const { user } = useAuth();
  const { t } = useLanguage();
  return (
    <section className="py-24 px-6 bg-page">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl p-12 text-center"
          style={{ background: "linear-gradient(135deg, #0f4c2a 0%, #166534 50%, #15803d 100%)" }}>
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="absolute inset-0 hero-grid opacity-20" />

          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-3xl mx-auto mb-6">🌾</div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">{t("Ready to grow smarter?")}</h2>
            <p className="text-emerald-200 text-base mb-8 max-w-lg mx-auto leading-relaxed">
              {t("Join Indian farmers making better planting decisions with AI. Free, fast, and built for the field.")}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to={user ? "/prediction" : "/signup"}>
                <button className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-800 font-bold rounded-2xl hover:bg-emerald-50 transition shadow-lg text-sm">
                  {user ? t("Start a Prediction →") : t("Create Free Account →")}
                </button>
              </Link>
              {!user && (
                <Link to="/login">
                  <button className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-2xl hover:bg-white/10 transition text-sm">
                    {t("Sign In")}
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
