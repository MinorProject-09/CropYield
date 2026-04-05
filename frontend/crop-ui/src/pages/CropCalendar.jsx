import Navbar from "../components/Navbar";
import { useLanguage } from "../i18n/LanguageContext";

const CALENDAR = [
  { crop: "Rice",        image: "/images/rice.jpg", sow: "Jun–Jul",  harvest: "Oct–Nov", season: "Kharif",   duration: "90–150d", water: "High",   tip: "Transplant 25 days after nursery sowing." },
  { crop: "Maize",       image: "/images/maize.jpg", sow: "Jun–Jul",  harvest: "Sep–Oct", season: "Kharif",   duration: "80–110d", water: "Medium", tip: "Apply zinc sulfate at sowing for better germination." },
  { crop: "Cotton",      image: "/images/cotton.jpg", sow: "Apr–May",  harvest: "Oct–Dec", season: "Kharif",   duration: "150–180d",water: "Medium", tip: "Monitor for bollworm from August onwards." },
  { crop: "Jute",        image: "/images/jute.jpg", sow: "Mar–May",  harvest: "Jul–Sep", season: "Kharif",   duration: "100–120d",water: "High",   tip: "Harvest before flowering for best fibre quality." },
  { crop: "Mung Bean",   image: "/images/mung bean.jpg", sow: "Jun–Jul",  harvest: "Sep–Oct", season: "Kharif",   duration: "60–90d",  water: "Low",    tip: "Short duration — good for intercropping." },
  { crop: "Black Gram",  image: "/images/black gram.jpg", sow: "Jun–Jul",  harvest: "Sep–Oct", season: "Kharif",   duration: "70–90d",  water: "Low",    tip: "Avoid waterlogging — raised beds recommended." },
  { crop: "Pigeon Peas", image: "/images/pigeon peas.jpg", sow: "Jun–Jul",  harvest: "Dec–Feb", season: "Kharif",   duration: "120–180d",water: "Low",    tip: "Drought-resistant — ideal for dry regions." },
  { crop: "Moth Beans",  image: "/images/moth beans.jpg", sow: "Jul–Aug",  harvest: "Sep–Oct", season: "Kharif",   duration: "60–90d",  water: "Low",    tip: "Extremely drought-tolerant — suited for arid zones." },
  { crop: "Chickpea",    image: "/images/chickpea.jpg", sow: "Oct–Nov",  harvest: "Feb–Mar", season: "Rabi",     duration: "90–120d", water: "Low",    tip: "Avoid excess nitrogen — it fixes its own." },
  { crop: "Lentil",      image: "/images/lentil.jpg", sow: "Oct–Nov",  harvest: "Mar–Apr", season: "Rabi",     duration: "80–110d", water: "Low",    tip: "Inoculate seeds with Rhizobium before sowing." },
  { crop: "Kidney Beans",image: "/images/kidney beans.jpg", sow: "Oct–Nov",  harvest: "Feb–Mar", season: "Rabi",     duration: "80–100d", water: "Medium", tip: "Sensitive to frost — avoid late sowing." },
  { crop: "Apple",       image: "/images/apple.jpg", sow: "Jan–Feb",  harvest: "Aug–Oct", season: "Rabi",     duration: "150–180d",water: "Medium", tip: "Needs chilling hours — suited for hilly regions." },
  { crop: "Watermelon",  image: "/images/watermelon.jpg", sow: "Feb–Mar",  harvest: "May–Jun", season: "Zaid",     duration: "70–90d",  water: "Medium", tip: "Reduce irrigation 10 days before harvest for sweetness." },
  { crop: "Muskmelon",   image: "/images/muskmelon.jpg", sow: "Feb–Mar",  harvest: "May–Jun", season: "Zaid",     duration: "70–90d",  water: "Medium", tip: "Stop irrigation 10 days before harvest." },
  { crop: "Banana",      image: "/images/banana.jpg", sow: "Jun–Sep",  harvest: "Year-round",season:"Perennial",duration: "270–365d",water: "High",   tip: "Remove suckers — keep one per plant." },
  { crop: "Mango",       image: "/images/mango.jpg", sow: "Jul–Aug",  harvest: "Apr–Jun", season: "Perennial",duration: "90–120d", water: "Low",    tip: "Needs dry spell before flowering." },
  { crop: "Coconut",     image: "/images/coconut.jpg", sow: "Jun–Sep",  harvest: "Year-round",season:"Perennial",duration: "365+d",  water: "High",   tip: "Apply potassium-rich fertilizer for better nut yield." },
  { crop: "Coffee",      image: "/images/coffee.jpg", sow: "Jun–Jul",  harvest: "Nov–Feb", season: "Perennial",duration: "365+d",   water: "Medium", tip: "Needs shade — intercrop with silver oak." },
  { crop: "Papaya",      image: "/images/papaya.jpg", sow: "Jun–Sep",  harvest: "Year-round",season:"Perennial",duration: "180–270d",water: "Medium",tip: "Plant on raised beds in heavy soils." },
  { crop: "Grapes",      image: "/images/grapes.jpg", sow: "Jan–Feb",  harvest: "Mar–May", season: "Perennial",duration: "150–180d",water: "Medium", tip: "Prune annually — train on trellis." },
  { crop: "Orange",      image: "/images/orange.jpg", sow: "Jun–Aug",  harvest: "Nov–Feb", season: "Perennial",duration: "180–240d",water: "Medium", tip: "Foliar spray micronutrients annually." },
  { crop: "Pomegranate", image: "/images/pomegranate.jpg", sow: "Jul–Aug",  harvest: "Sep–Feb", season: "Perennial",duration: "150–180d",water: "Low",    tip: "Prune after harvest for better fruiting next season." },
];

const SEASON_COLORS = {
  Kharif:    "bg-green-100 text-green-800 border-green-200",
  Rabi:      "bg-blue-100 text-blue-800 border-blue-200",
  Zaid:      "bg-amber-100 text-amber-800 border-amber-200",
  Perennial: "bg-purple-100 text-purple-800 border-purple-200",
};

const WATER_COLORS = {
  High:   "text-blue-600",
  Medium: "text-amber-600",
  Low:    "text-green-600",
};

export default function CropCalendar() {
  const { t } = useLanguage();
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="bg-gradient-to-br from-green-800 to-green-700 text-white px-6 py-10">
          <div className="max-w-5xl mx-auto">
            <p className="text-green-300 text-sm mb-1">📅 {t("Seasonal Guide")}</p>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">{t("Crop Calendar")}</h1>
            <p className="text-green-200 text-sm">{t("Sowing and harvesting schedule for all 22 supported crops.")}</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-wrap gap-3 mb-6">
            {Object.entries(SEASON_COLORS).map(([s, cls]) => (
              <span key={s} className={`text-xs font-semibold px-3 py-1 rounded-full border ${cls}`}>{t(s)}</span>
            ))}
          </div>

          <div className="grid gap-3">
            {CALENDAR.map((c) => (
              <div key={c.crop} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:border-green-200 transition">
                <div className="flex items-start gap-4">
                  <img src={c.image} alt={c.crop} className="w-12 h-12 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-semibold text-gray-900">{t(c.crop)}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${SEASON_COLORS[c.season]}`}>{t(c.season)}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-2">
                      <div className="bg-green-50 rounded-lg p-2">
                        <div className="text-gray-400 font-medium mb-0.5">🌱 {t("Sow")}</div>
                        <div className="font-semibold text-gray-800">{c.sow}</div>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-2">
                        <div className="text-gray-400 font-medium mb-0.5">🌾 {t("Harvest")}</div>
                        <div className="font-semibold text-gray-800">{c.harvest}</div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-2">
                        <div className="text-gray-400 font-medium mb-0.5">⏱ {t("Duration")}</div>
                        <div className="font-semibold text-gray-800">{c.duration}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="text-gray-400 font-medium mb-0.5">💧 {t("Water")}</div>
                        <div className={`font-semibold ${WATER_COLORS[c.water]}`}>{t(c.water)}</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">💡 {t(c.tip)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
