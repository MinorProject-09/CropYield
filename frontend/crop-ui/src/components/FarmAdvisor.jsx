/**
 * FarmAdvisor.jsx
 * Personalized farm-level recommendations based on the farmer's profile,
 * prediction history, current season, and location.
 * Solves: "Not personalized" and "Fragmented services" drawbacks.
 */
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { getCropInfo } from "../data/cropInfo";
import { CROP_ROTATION } from "../data/cropAdvisory";

// Current season based on month
function getCurrentSeason(month = new Date().getMonth() + 1) {
  if (month >= 6 && month <= 10) return "Kharif";
  if (month >= 11 || month <= 3) return "Rabi";
  return "Zaid";
}

// Days until next season starts
function daysUntilNextSeason() {
  const now = new Date();
  const month = now.getMonth() + 1;
  let nextStart;
  if (month < 3)  nextStart = new Date(now.getFullYear(), 2, 1);   // March (Zaid)
  else if (month < 6)  nextStart = new Date(now.getFullYear(), 5, 1);   // June (Kharif)
  else if (month < 11) nextStart = new Date(now.getFullYear(), 10, 1);  // Nov (Rabi)
  else nextStart = new Date(now.getFullYear() + 1, 2, 1);
  return Math.ceil((nextStart - now) / (1000 * 60 * 60 * 24));
}

// Profile completeness score
function profileScore(user) {
  let score = 0;
  if (user?.name)                score += 20;
  if (user?.farmSize)            score += 20;
  if (user?.soilType)            score += 20;
  if (user?.location?.state)     score += 20;
  if (user?.location?.district)  score += 20;
  return score;
}

export default function FarmAdvisor({ user, history }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const month = new Date().getMonth() + 1;
  const season = getCurrentSeason(month);
  const daysLeft = daysUntilNextSeason();
  const profScore = profileScore(user);

  // Last predicted crop
  const lastCrop = history?.[0]?.recommendedCrop;
  const lastCropInfo = getCropInfo(lastCrop);
  const rotation = lastCrop ? CROP_ROTATION[lastCrop.toLowerCase()] : null;

  // Crops harvested (have actualYieldQ logged)
  const harvested = useMemo(() =>
    history?.filter(p => p.actualYieldQ != null) || [], [history]);

  // Accuracy: avg (actualYield / predictedYield) for logged harvests
  const accuracy = useMemo(() => {
    const valid = harvested.filter(p => p.yieldQHa && p.actualYieldQ);
    if (!valid.length) return null;
    const avg = valid.reduce((s, p) => s + (p.actualYieldQ / (p.yieldQHa * (p.farmSizeHa || 1))), 0) / valid.length;
    return Math.round(avg * 100);
  }, [harvested]);

  // Personalized action items
  const actions = useMemo(() => {
    const items = [];

    // Profile incomplete
    if (profScore < 100) {
      items.push({
        priority: "high",
        icon: "👤",
        title: t("Complete your farm profile"),
        desc: t(`Your profile is ${profScore}% complete. Add farm size, soil type, and location to get personalized recommendations.`),
        action: { label: t("Complete Profile"), to: "/dashboard", tab: "profile" },
        color: "border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700",
      });
    }

    // No predictions yet
    if (!history?.length) {
      items.push({
        priority: "high",
        icon: "🌱",
        title: t("Run your first prediction"),
        desc: t("Enter your soil data and location to get an AI-powered crop recommendation tailored to your farm."),
        action: { label: t("Start Prediction"), to: "/prediction" },
        color: "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-700",
      });
      return items;
    }

    // Season reminder
    items.push({
      priority: "medium",
      icon: season === "Kharif" ? "🌧️" : season === "Rabi" ? "❄️" : "☀️",
      title: t(`${season} season is active`),
      desc: t(`Next season starts in ${daysLeft} days. Plan your crop rotation and input purchases now.`),
      action: { label: t("View Crop Calendar"), to: "/calendar" },
      color: "border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700",
    });

    // Crop rotation advice
    if (rotation) {
      items.push({
        priority: "medium",
        icon: "🔄",
        title: t(`Rotate after ${lastCrop}`),
        desc: t(rotation.reason) + " " + t("Recommended next crops:") + " " + rotation.next.join(", "),
        action: { label: t("Get New Prediction"), to: "/prediction" },
        color: "border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-700",
      });
    }

    // Harvest not logged
    const unlogged = history?.filter(p => p.actualYieldQ == null && p.yieldQHa) || [];
    if (unlogged.length > 0) {
      items.push({
        priority: "medium",
        icon: "📝",
        title: t(`Log your harvest for ${unlogged[0].recommendedCrop}`),
        desc: t("Track your actual yield to improve future predictions and measure your farm's performance."),
        action: { label: t("Go to History"), to: "/dashboard", tab: "history" },
        color: "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-700",
      });
    }

    // Profit analysis not viewed
    if (history?.length > 0 && history[0].top3?.length) {
      items.push({
        priority: "low",
        icon: "💰",
        title: t("See profit analysis for your last prediction"),
        desc: t("Compare which of your top 3 recommended crops gives the best return on investment."),
        action: {
          label: t("View Profit Analysis"),
          onClick: () => navigate("/profit", {
            state: {
              mlInput: { N: history[0].nitrogen, P: history[0].phosphorus, K: history[0].potassium,
                temperature: history[0].temperature || 25, humidity: history[0].humidity || 70,
                ph: history[0].soilPh, rainfall: history[0].rainfall || 100,
                farm_size_ha: history[0].farmSizeHa || 1 },
              top3: history[0].top3,
              farmSizeHa: history[0].farmSizeHa || 1,
              duration: history[0].duration || 90,
              recommendedCrop: history[0].recommendedCrop,
            }
          }),
        },
        color: "border-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-700",
      });
    }

    // Accuracy feedback
    if (accuracy !== null) {
      const good = accuracy >= 80;
      items.push({
        priority: "low",
        icon: good ? "🎯" : "📊",
        title: good ? t("Your predictions are accurate!") : t("Improve prediction accuracy"),
        desc: good
          ? t(`Your actual yield is ${accuracy}% of predicted. Great farming practices!`)
          : t(`Your actual yield is ${accuracy}% of predicted. Try adjusting soil inputs for better accuracy.`),
        color: good
          ? "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-700"
          : "border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700",
      });
    }

    return items.slice(0, 4); // show max 4 actions
  }, [user, history, season, daysLeft, lastCrop, rotation, accuracy, profScore, t, navigate]);

  return (
    <div className="space-y-4">
      {/* Farm summary bar */}
      <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
            🏡 {t("Your Farm")}
          </h3>
          <Link to="/dashboard" className="text-xs text-green-700 dark:text-green-400 font-semibold hover:underline">
            {t("Edit Profile")}
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {[
            { label: t("Farm Size"),  value: user?.farmSize ? `${user.farmSize} ha` : t("Not set"), icon: "📐" },
            { label: t("Soil Type"),  value: user?.soilType || t("Not set"),                         icon: "🧱" },
            { label: t("State"),      value: user?.location?.state || t("Not set"),                  icon: "📍" },
            { label: t("Season"),     value: season,                                                  icon: "🌤" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-gray-50 dark:bg-slate-700 rounded-xl p-2.5 border border-gray-100 dark:border-slate-600">
              <div className="text-gray-400 dark:text-slate-500 mb-0.5">{icon} {label}</div>
              <div className={`font-semibold ${value === t("Not set") ? "text-amber-500" : "text-gray-800 dark:text-slate-200"}`}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Profile completeness */}
        {profScore < 100 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400 mb-1">
              <span>{t("Profile completeness")}</span>
              <span className="font-semibold text-amber-600">{profScore}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${profScore}%` }} />
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              {t("Complete your profile for better personalized recommendations")}
            </p>
          </div>
        )}
      </div>

      {/* Personalized action cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
          ⚡ {t("Recommended Actions")}
        </h3>
        {actions.map((action, i) => (
          <div key={i} className={`rounded-2xl border p-4 ${action.color}`}>
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">{action.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-slate-100 text-sm">{action.title}</p>
                <p className="text-xs text-gray-600 dark:text-slate-400 mt-0.5 leading-relaxed">{action.desc}</p>
                {action.action && (
                  <div className="mt-2">
                    {action.action.onClick ? (
                      <button
                        type="button"
                        onClick={action.action.onClick}
                        className="text-xs font-semibold text-green-700 dark:text-green-400 hover:underline"
                      >
                        {action.action.label} →
                      </button>
                    ) : (
                      <Link to={action.action.to} className="text-xs font-semibold text-green-700 dark:text-green-400 hover:underline">
                        {action.action.label} →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Connected services */}
      <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-3">
          🔗 {t("All Services")}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: "🌾", label: t("Crop Prediction"), desc: t("AI recommendation"),      to: "/prediction", color: "hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20" },
            { icon: "💰", label: t("Market Prices"),   desc: t("Live mandi prices"),       to: "/market",     color: "hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20" },
            { icon: "🌤", label: t("Weather & Risk"),  desc: t("7-day forecast + alerts"), to: "/weather",    color: "hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20" },
            { icon: "👥", label: t("Community"),       desc: t("Farmer Q&A forum"),         to: "/community",  color: "hover:border-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20" },
            { icon: "📡", label: t("IoT Monitoring"),  desc: t("Live sensor alerts"),       to: "/iot",        color: "hover:border-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/20" },
            { icon: "🏛️", label: t("Scheme Finder"),   desc: t("Govt. subsidies"),          to: "/schemes",    color: "hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20" },
            { icon: "📊", label: t("Profit Analysis"), desc: t("Compare crop returns"),     to: "/profit",     color: "hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20" },
            { icon: "📅", label: t("Crop Calendar"),   desc: t("Sowing & harvest dates"),   to: "/calendar",   color: "hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20" },
            { icon: "📈", label: t("Dashboard"),       desc: t("History & insights"),       to: "/dashboard",  color: "hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20" },
          ].map(({ icon, label, desc, to, color }) => (
            <Link key={to} to={to}
              className={`flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 dark:border-slate-700 transition ${color}`}>
              <span className="text-xl">{icon}</span>
              <div>
                <div className="text-xs font-semibold text-gray-800 dark:text-slate-200">{label}</div>
                <div className="text-xs text-gray-400 dark:text-slate-500">{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
