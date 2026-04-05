import { useLanguage } from "../i18n/LanguageContext";

const steps = [
  { num: "01", icon: "📍", titleKey: "Set Your Location",         descKey: "Pin your farm on the interactive map, use GPS, or type your village name and PIN code. We resolve exact coordinates automatically." },
  { num: "02", icon: "🧪", titleKey: "Enter Soil Data",           descKey: "Input your soil pH and NPK (Nitrogen, Phosphorus, Potassium) values from your soil test report. Use voice input if you prefer." },
  { num: "03", icon: "📅", titleKey: "Pick Planting Month",       descKey: "Select the month you plan to sow and the expected crop duration in days. This aligns predictions with seasonal patterns." },
  { num: "04", icon: "🌾", titleKey: "Get Your Recommendation",   descKey: "Our ML model instantly returns the best crop for your conditions along with a confidence score and alternative suggestions." },
];

function HowItWorks() {
  const { t } = useLanguage();
  return (
    <section id="how" className="py-20 px-6 bg-green-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-green-700 text-sm font-semibold uppercase tracking-widest dark:text-green-400">{t("Simple Process")}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 dark:text-slate-100">{t("How It Works")}</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto dark:text-slate-400">{t("From soil data to crop recommendation in under a minute.")}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={s.num} className="relative bg-white rounded-2xl p-6 shadow-sm border border-green-100 dark:bg-slate-800 dark:border-slate-700">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 right-0 w-6 h-0.5 bg-green-200 translate-x-full z-10 dark:bg-slate-600" />
              )}
              <div className="text-xs font-bold text-green-400 mb-3 tracking-widest">{s.num}</div>
              <div className="text-3xl mb-3">{s.icon}</div>
              <h3 className="text-base font-semibold text-gray-900 mb-2 dark:text-slate-100">{t(s.titleKey)}</h3>
              <p className="text-gray-500 text-sm leading-relaxed dark:text-slate-400">{t(s.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
