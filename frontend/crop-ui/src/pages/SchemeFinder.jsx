/**
 * SchemeFinder.jsx
 * Government scheme eligibility checker for Indian farmers.
 * Covers PM-KISAN, PMFBY, KCC, Soil Health Card, PMKSY, eNAM, PKVY, SMAM, MIDH.
 */
import { useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLanguage } from "../i18n/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { SCHEMES, CATEGORIES } from "../data/schemes";

// ── Eligibility checker ───────────────────────────────────────────────────────
function checkEligibility(scheme, profile) {
  if (!profile.answered) return "unknown";
  // Simple rule-based check using profile answers
  const { landOwner, govtEmployee, incomeTax, cropGrower, farmSize } = profile;
  if (scheme.id === "pm-kisan") {
    if (!landOwner) return "ineligible";
    if (govtEmployee || incomeTax) return "ineligible";
    return "eligible";
  }
  if (scheme.id === "pmfby") {
    if (!cropGrower) return "ineligible";
    return "eligible";
  }
  if (scheme.id === "kcc") {
    if (!landOwner && !cropGrower) return "ineligible";
    return "eligible";
  }
  if (scheme.id === "shc") return "eligible";
  if (scheme.id === "pmksy") return "eligible";
  if (scheme.id === "enam") return "eligible";
  if (scheme.id === "pkvy") {
    if (!cropGrower) return "ineligible";
    return "likely";
  }
  if (scheme.id === "smam") return "eligible";
  if (scheme.id === "midh") {
    if (!cropGrower) return "likely";
    return "eligible";
  }
  return "likely";
}

// ── Scheme card ───────────────────────────────────────────────────────────────
function SchemeCard({ scheme, eligibility, t }) {
  const [open, setOpen] = useState(false);
  const statusStyle = {
    eligible:   { bg: "bg-emerald-50 dark:bg-emerald-900/20",  border: "border-emerald-300 dark:border-emerald-700",  badge: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300",  label: "✅ Eligible" },
    ineligible: { bg: "bg-red-50 dark:bg-red-900/20",      border: "border-red-200 dark:border-red-800",      badge: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400",          label: "❌ Not Eligible" },
    likely:     { bg: "bg-amber-50 dark:bg-amber-900/20",  border: "border-amber-200 dark:border-amber-700",  badge: "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300",  label: "🟡 Likely Eligible" },
    unknown:    { bg: "bg-white dark:bg-slate-800",         border: "border-gray-100 dark:border-slate-700",   badge: "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400",       label: "❓ Check Eligibility" },
  }[eligibility] || {};

  return (
    <div className={`rounded-2xl border ${statusStyle.border} ${statusStyle.bg}  overflow-hidden transition`}>
      {/* Header */}
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full text-left p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">{scheme.icon}</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-900 dark:text-slate-100 text-sm">{scheme.name}</h3>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyle.badge}`}>
                  {statusStyle.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{scheme.fullName}</p>
              <p className="text-sm text-gray-700 dark:text-slate-300 mt-1.5 font-medium">{t(scheme.benefit)}</p>
            </div>
          </div>
          <span className="text-gray-400 flex-shrink-0 mt-1">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* Expanded details */}
      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-100 dark:border-slate-700 pt-4">
          <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">{t(scheme.description)}</p>

          {/* Eligibility criteria */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">{t("Eligibility Criteria")}</h4>
            <ul className="space-y-1.5">
              {scheme.eligibility.map((e, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-slate-300">
                  <span className={`flex-shrink-0 mt-0.5 ${e.required ? "text-green-600" : "text-blue-500"}`}>
                    {e.required ? "✓" : "○"}
                  </span>
                  <span>{t(e.label)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Documents */}
          <div>
            <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">{t("Documents Required")}</h4>
            <div className="flex flex-wrap gap-1.5">
              {scheme.documents.map(d => (
                <span key={d} className="text-xs bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 px-2 py-1 rounded-lg">
                  📄 {t(d)}
                </span>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
            📅 <strong>{t("Deadline")}:</strong> {t(scheme.deadline)}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            <a href={scheme.applyUrl} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition">
              📝 {t("Apply Now")} ↗
            </a>
            {scheme.checkUrl && (
              <a href={scheme.checkUrl} target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="flex-1 flex items-center justify-center gap-1.5 border border-emerald-300 dark:border-emerald-700 text-green-700 dark:text-green-400 text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition">
                🔍 {t("Check Status")} ↗
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Eligibility quiz ──────────────────────────────────────────────────────────
function EligibilityQuiz({ profile, setProfile, t }) {
  const questions = [
    { key: "landOwner",    label: t("Do you own agricultural land?"),                          type: "bool" },
    { key: "cropGrower",   label: t("Are you currently growing or planning to grow crops?"),   type: "bool" },
    { key: "govtEmployee", label: t("Are you or any family member a government employee?"),    type: "bool" },
    { key: "incomeTax",    label: t("Do you or any family member pay income tax?"),            type: "bool" },
    { key: "farmSize",     label: t("What is your farm size?"),                                type: "select",
      options: [
        { value: "small",    label: t("Small (< 1 ha)") },
        { value: "marginal", label: t("Marginal (1–2 ha)") },
        { value: "medium",   label: t("Medium (2–5 ha)") },
        { value: "large",    label: t("Large (> 5 ha)") },
      ]
    },
  ];

  return (
    <div className="card rounded-2xl p-5  space-y-4">
      <div>
        <h3 className="font-bold text-gray-800 dark:text-slate-200 text-sm uppercase tracking-wide">
          🎯 {t("Check Your Eligibility")}
        </h3>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
          {t("Answer a few questions to see which schemes you qualify for.")}
        </p>
      </div>

      <div className="space-y-3">
        {questions.map(q => (
          <div key={q.key} className="flex items-center justify-between gap-4">
            <label className="text-sm text-gray-700 dark:text-slate-300 flex-1">{q.label}</label>
            {q.type === "bool" ? (
              <div className="flex gap-2 flex-shrink-0">
                {[true, false].map(v => (
                  <button key={String(v)} type="button"
                    onClick={() => setProfile(p => ({ ...p, [q.key]: v, answered: true }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      profile[q.key] === v
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-600 hover:border-green-300"
                    }`}>
                    {v ? t("Yes") : t("No")}
                  </button>
                ))}
              </div>
            ) : (
              <select
                value={profile[q.key] || ""}
                onChange={e => setProfile(p => ({ ...p, [q.key]: e.target.value, answered: true }))}
                className="text-xs border border-gray-200 dark:border-slate-600 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 outline-none focus:border-emerald-500 flex-shrink-0">
                <option value="">{t("Select")}</option>
                {q.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            )}
          </div>
        ))}
      </div>

      {profile.answered && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-green-200 dark:border-green-700 rounded-xl px-3 py-2 text-xs text-green-800 dark:text-green-300">
          ✅ {t("Eligibility updated. Scroll down to see your results.")}
        </div>
      )}

      <button type="button" onClick={() => setProfile({ answered: false })}
        className="text-xs text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 underline">
        {t("Reset answers")}
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SchemeFinder() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [category, setCategory] = useState("all");
  const [search,   setSearch]   = useState("");
  const [profile,  setProfile]  = useState({
    answered:    false,
    landOwner:   null,
    cropGrower:  null,
    govtEmployee:null,
    incomeTax:   null,
    farmSize:    "",
  });

  // Pre-fill profile from user account
  const effectiveProfile = useMemo(() => ({
    ...profile,
    farmSize: profile.farmSize || (user?.farmSize > 5 ? "large" : user?.farmSize > 2 ? "medium" : user?.farmSize > 1 ? "marginal" : user?.farmSize ? "small" : ""),
  }), [profile, user]);

  const filtered = useMemo(() => {
    return SCHEMES.filter(s => {
      const matchCat = category === "all" || s.category === category;
      const q = search.toLowerCase();
      const matchSearch = !q || s.name.toLowerCase().includes(q) || s.fullName.toLowerCase().includes(q)
        || s.benefit.toLowerCase().includes(q) || s.tags.some(tag => tag.includes(q));
      return matchCat && matchSearch;
    });
  }, [category, search]);

  const eligibleCount = useMemo(() =>
    profile.answered ? SCHEMES.filter(s => checkEligibility(s, effectiveProfile) === "eligible").length : null,
  [profile.answered, effectiveProfile]);

  return (
    <div className="min-h-screen bg-page font-[Outfit,system-ui,sans-serif]">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0f4c2a] via-[#166534] to-[#15803d] text-white px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <p className="text-emerald-300 text-xs font-semibold uppercase tracking-widest mb-2">🏛️ {t("Government Schemes")}</p>
          <h1 className="text-2xl md:text-3xl font-bold">{t("Scheme Finder")}</h1>
          <p className="text-emerald-200/80 text-sm mt-1.5 max-w-xl">
            {t("Find all government schemes you are eligible for — PM-KISAN, crop insurance, Kisan Credit Card, subsidies, and more.")}
          </p>
          {eligibleCount !== null && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-xl px-4 py-2 text-sm font-semibold">
              🎯 {t("You are eligible for")} <span className="text-2xl font-bold">{eligibleCount}</span> {t("schemes")}
            </div>
          )}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6 space-y-6">

        {/* Eligibility quiz */}
        <EligibilityQuiz profile={profile} setProfile={setProfile} t={t} />

        {/* Search + filter */}
        <div className="space-y-3">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t("Search schemes… e.g. insurance, irrigation, organic")}
            className="w-full border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30"
          />
          <div className="flex gap-2 flex-wrap">
            {[{ id:"all", label:t("All"), icon:"📋" },
              { id:"income", label:t("Income"), icon:"💰" },
              { id:"insurance", label:t("Insurance"), icon:"🛡️" },
              { id:"credit", label:t("Credit"), icon:"💳" },
              { id:"soil", label:t("Soil"), icon:"🧪" },
              { id:"irrigation", label:t("Irrigation"), icon:"💧" },
              { id:"market", label:t("Market"), icon:"🏪" },
              { id:"organic", label:t("Organic"), icon:"🌿" },
              { id:"equipment", label:t("Equipment"), icon:"🚜" },
              { id:"horticulture", label:t("Horticulture"), icon:"🍎" },
            ].map(c => (
              <button key={c.id} type="button" onClick={() => setCategory(c.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  category === c.id
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-green-300"
                }`}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results summary */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-slate-400">
          <span>{filtered.length} {t("schemes found")}</span>
          {profile.answered && (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {filtered.filter(s => checkEligibility(s, effectiveProfile) === "eligible").length} {t("you qualify for")}
            </span>
          )}
        </div>

        {/* Scheme cards — eligible first */}
        <div className="space-y-4">
          {[...filtered]
            .sort((a, b) => {
              const order = { eligible: 0, likely: 1, unknown: 2, ineligible: 3 };
              return (order[checkEligibility(a, effectiveProfile)] ?? 2) - (order[checkEligibility(b, effectiveProfile)] ?? 2);
            })
            .map(scheme => (
              <SchemeCard
                key={scheme.id}
                scheme={scheme}
                eligibility={checkEligibility(scheme, effectiveProfile)}
                t={t}
              />
            ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 dark:text-slate-500">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm">{t("No schemes found. Try a different search or category.")}</p>
          </div>
        )}

        {/* Helpline */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-5">
          <h3 className="font-bold text-blue-800 dark:text-blue-300 text-sm mb-3">📞 {t("Need Help Applying?")}</h3>
          <div className="grid sm:grid-cols-3 gap-3 text-xs">
            {[
              { icon:"📱", label:"Kisan Call Centre",    value:"1800-180-1551", desc:t("Free helpline, 6 AM–10 PM") },
              { icon:"🏢", label:"Nearest KVK",          value:t("Visit in person"), desc:t("Krishi Vigyan Kendra — free advisory") },
              { icon:"💻", label:"PM-KISAN Helpline",    value:"155261 / 011-24300606", desc:t("For PM-KISAN queries") },
            ].map(({ icon, label, value, desc }) => (
              <div key={label} className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-blue-100 dark:border-slate-700">
                <div className="font-semibold text-blue-800 dark:text-blue-300">{icon} {label}</div>
                <div className="text-blue-700 dark:text-blue-400 font-bold mt-0.5">{value}</div>
                <div className="text-gray-500 dark:text-slate-400 mt-0.5">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-400 dark:text-slate-500 leading-relaxed">
          * {t("Scheme details are based on Government of India guidelines as of 2024-25. Eligibility may vary by state. Always verify at the official portal before applying.")}
        </p>
      </main>
      <Footer />
    </div>
  );
}
