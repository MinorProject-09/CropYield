import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";

function CTA() {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-green-800 to-green-900 text-white">
      <div className="max-w-3xl mx-auto text-center">
        <div className="text-5xl mb-6">🌾</div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("Ready to grow smarter?")}</h2>
        <p className="text-green-200 text-lg mb-8 leading-relaxed">
          {t("Join thousands of Indian farmers making better planting decisions with AI. It's free, fast, and built for the field.")}
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to={user ? "/prediction" : "/signup"}>
            <button className="bg-white text-green-900 px-8 py-3.5 rounded-xl font-bold text-base hover:bg-green-50 transition shadow-lg">
              {user ? t("Start a Prediction →") : t("Create Free Account →")}
            </button>
          </Link>
          {!user && (
            <Link to="/login">
              <button className="border border-white/40 text-white px-8 py-3.5 rounded-xl font-medium text-base hover:bg-white/10 transition">
                {t("Sign In")}
              </button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export default CTA;
