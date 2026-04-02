import { useLanguage } from "../i18n/LanguageContext";

const benefits = [
  { icon: "📈", titleKey: "Higher Crop Yield",          descKey: "Farmers using data-driven crop selection report up to 30% better yields compared to traditional guesswork." },
  { icon: "💰", titleKey: "Reduce Input Costs",         descKey: "Avoid spending on seeds and fertilizers for crops that won't thrive in your soil. Plant right the first time." },
  { icon: "🌦️", titleKey: "Climate-Resilient Choices", descKey: "Our model accounts for your region's climate patterns, helping you pick crops suited to local rainfall and temperature." },
  { icon: "⚡", titleKey: "Instant Results",            descKey: "No waiting for agronomists or lab reports. Get a recommendation in seconds, right from your phone." },
  { icon: "🗣️", titleKey: "Works in Your Language",    descKey: "Voice input and UI support for Hindi, Tamil, Telugu, and English — because agriculture is local." },
  { icon: "🔒", titleKey: "Your Data is Safe",          descKey: "We never sell your farm data. Your location and soil information stays private and secure." },
];

function Benefits() {
  const { t } = useLanguage();
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-green-700 text-sm font-semibold uppercase tracking-widest">{t("Why Farmers Choose Us")}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">{t("Real benefits, real results")}</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">{t("Designed with Indian farmers in mind — practical, fast, and free to use.")}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b) => (
            <div key={b.titleKey} className="flex gap-4 p-6 rounded-2xl bg-green-50 border border-green-100">
              <div className="text-3xl flex-shrink-0">{b.icon}</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{t(b.titleKey)}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{t(b.descKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Benefits;
