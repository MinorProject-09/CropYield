import { useLanguage } from "../i18n/LanguageContext";

const STEPS = [
  { num: "01", icon: "📍", title: "Set Your Location",       desc: "Pin your farm on the map, use GPS, or type your village and PIN code. Coordinates resolved automatically.", color: "#16a34a" },
  { num: "02", icon: "🧪", title: "Enter Soil Data",         desc: "Input your soil pH and NPK values from a soil test report. Use voice input if you prefer.", color: "#0ea5e9" },
  { num: "03", icon: "📅", title: "Pick Planting Month",     desc: "Select the month you plan to sow and the expected crop duration. Aligns predictions with seasonal patterns.", color: "#8b5cf6" },
  { num: "04", icon: "🌾", title: "Get Your Recommendation", desc: "Our ML model instantly returns the best crop with confidence score, yield estimate, and profit analysis.", color: "#f59e0b" },
];

export default function HowItWorks() {
  const { t } = useLanguage();
  return (
    <section id="how" className="py-24 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-gray-950 to-slate-950" />
      <div className="absolute inset-0 hero-grid opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/8 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="section-label justify-center" style={{ color: "#4ade80" }}>
            <span className="w-5 h-0.5 bg-emerald-400 rounded-full" />
            {t("Simple Process")}
          </div>
          <h2 className="text-4xl font-extrabold text-white mt-2 mb-4">{t("How It Works")}</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base">{t("From soil data to crop recommendation in under a minute.")}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 stagger">
          {STEPS.map((s, i) => (
            <div key={s.num} className="relative animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px z-10"
                  style={{ background: `linear-gradient(90deg, ${s.color}60, transparent)` }} />
              )}
              <div className="rounded-2xl p-6 border border-white/6 bg-white/4 backdrop-blur-sm hover:bg-white/7 transition-all duration-300 hover:-translate-y-1 h-full">
                <div className="text-xs font-black tracking-widest mb-4" style={{ color: s.color }}>{s.num}</div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}>
                  {s.icon}
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{t(s.title)}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{t(s.desc)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
