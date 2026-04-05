import { useLanguage } from "../i18n/LanguageContext";

const features = [
  { icon: "🤖", titleKey: "AI Crop Recommendation",      descKey: "Our Random Forest model trained on thousands of Indian farm records recommends the best crop for your soil and climate conditions." },
  { icon: "🗺️", titleKey: "Location-Aware Predictions",  descKey: "Pin your farm on the map or enter your village and PIN code. We fetch real weather and climate data for your exact location." },
  { icon: "🧪", titleKey: "Soil Nutrient Analysis",       descKey: "Input your N, P, K levels and soil pH. The model factors in nutrient balance to recommend crops that will actually thrive." },
  { icon: "📅", titleKey: "Seasonal Planning",            descKey: "Tell us your planting month and crop duration. Get recommendations aligned with Kharif, Rabi, or Zaid seasons." },
  { icon: "🎙️", titleKey: "Voice Input Support",          descKey: "Speak your soil values in Hindi, Tamil, Telugu, or English. Designed for farmers who prefer voice over typing." },
  { icon: "📊", titleKey: "Confidence Scoring",           descKey: "Every prediction comes with a confidence percentage so you know how reliable the recommendation is for your inputs." },
];

function Features() {
  const { t } = useLanguage();
  return (
    <section id="features" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-green-700 text-sm font-semibold uppercase tracking-widest">{t("What We Offer")}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">{t("Everything a farmer needs")}</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">{t("Built specifically for Indian agriculture — from soil types to regional crops.")}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.titleKey} className="group p-6 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-lg transition bg-gray-50 hover:bg-white">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t(f.titleKey)}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{t(f.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
