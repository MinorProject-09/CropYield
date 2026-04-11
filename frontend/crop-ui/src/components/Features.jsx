import { useRef } from "react";
import { useLanguage } from "../i18n/LanguageContext";

const FEATURES = [
  { icon: "🤖", title: "AI Crop Recommendation",     desc: "Ensemble ML model (RF + ExtraTrees + SVM) trained on Indian farm data. 99.7% accuracy across 22 crops.", color: "#16a34a" },
  { icon: "🗺️", title: "Location-Aware Predictions", desc: "Pin your farm on the map or type your village. Real weather data fetched for your exact coordinates.", color: "#0ea5e9" },
  { icon: "🧪", title: "Soil Nutrient Analysis",      desc: "Input N, P, K and pH from your soil test. The model factors nutrient balance for accurate recommendations.", color: "#8b5cf6" },
  { icon: "📡", title: "Live IoT Monitoring",         desc: "Connect a soil sensor — N, P, K, pH, temperature, humidity update in real time via Socket.IO.", color: "#f59e0b" },
  { icon: "🎙️", title: "Voice Input Support",         desc: "Speak your soil values in Hindi, Tamil, Telugu, or English. Designed for farmers who prefer voice.", color: "#ec4899" },
  { icon: "📊", title: "Profit & Yield Analysis",     desc: "Estimated yield, MSP revenue, and profit ranking of your top crop options — all in one click.", color: "#10b981" },
];

function FeatureCard({ icon, title, desc, color, index }) {
  const ref = useRef(null);
  const { t } = useLanguage();

  function handleMouseMove(e) {
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    ref.current.style.setProperty("--mx", `${x}%`);
    ref.current.style.setProperty("--my", `${y}%`);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className="feature-card card p-6 animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 transition-transform duration-300 group-hover:scale-110"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        {icon}
      </div>
      <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 mb-2">{t(title)}</h3>
      <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">{t(desc)}</p>
    </div>
  );
}

export default function Features() {
  const { t } = useLanguage();
  return (
    <section id="features" className="py-24 px-6 bg-page">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="section-label justify-center">{t("What We Offer")}</div>
          <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mt-2 mb-4">
            {t("Everything a farmer needs")}
          </h2>
          <p className="text-gray-500 dark:text-slate-400 max-w-xl mx-auto text-base leading-relaxed">
            {t("Built specifically for Indian agriculture — from soil types to regional crops.")}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
          {FEATURES.map((f, i) => <FeatureCard key={f.title} {...f} index={i} />)}
        </div>
      </div>
    </section>
  );
}
