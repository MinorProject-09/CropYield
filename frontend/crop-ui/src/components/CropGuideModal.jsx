/**
 * CropGuideModal.jsx
 * Full A-to-Z farming guide modal with read-aloud support.
 * Covers: overview, soil prep, varieties, sowing, irrigation,
 * fertilizer (with buy links), pest management, harvesting,
 * post-harvest, selling, government schemes, and tips.
 */
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { getCropGuide } from "../data/cropGuides";

const TABS = [
  { id: "overview",     label: "Overview",      icon: "📋" },
  { id: "soil",         label: "Soil & Sowing", icon: "🌱" },
  { id: "care",         label: "Care",          icon: "💧" },
  { id: "pest",         label: "Pest & Disease",icon: "🐛" },
  { id: "harvest",      label: "Harvest",       icon: "🌾" },
  { id: "market",       label: "Market & Sell", icon: "💰" },
];

function BuyLinks({ links, label }) {
  if (!links?.length) return null;
  return (
    <div className="mt-2">
      <span className="text-xs text-gray-500 dark:text-slate-400 font-semibold">{label}: </span>
      <div className="flex flex-wrap gap-1.5 mt-1">
        {links.map((l) => (
          <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-400 px-2 py-1 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition">
            🛒 {l.name} ↗
          </a>
        ))}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide">{title}</h4>
      {children}
    </div>
  );
}

export default function CropGuideModal({ cropName, onClose }) {
  const { t, lang, speechCode } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");
  const [speaking, setSpeaking] = useState(false);
  const [translatedText, setTranslatedText] = useState("");
  const utteranceRef = useRef(null);

  const guide = getCropGuide(cropName);

  // Translate readAloudText when language changes
  useEffect(() => {
    if (!guide?.readAloudText) return;
    if (lang === "en") { setTranslatedText(guide.readAloudText); return; }
    fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURIComponent(guide.readAloudText)}`)
      .then(r => r.json())
      .then(data => setTranslatedText(data[0]?.map(c => c[0]).join("") || guide.readAloudText))
      .catch(() => setTranslatedText(guide.readAloudText));
  }, [guide?.readAloudText, lang]);

  function speak() {
    if (!translatedText || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(translatedText);
    utt.lang = speechCode;
    utt.rate = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find(v => v.lang.startsWith(speechCode.split("-")[0]));
    if (match) utt.voice = match;
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    utteranceRef.current = utt;
    window.speechSynthesis.speak(utt);
  }

  function stopSpeak() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  if (!guide) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
        <p className="text-gray-500 dark:text-slate-400 mb-4">{t("Guide not available for this crop yet.")}</p>
        <button onClick={onClose} className="bg-green-700 text-white px-6 py-2 rounded-xl text-sm font-semibold">{t("Close")}</button>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >

        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-600 px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{guide.emoji}</span>
            <div>
              <h2 className="text-lg font-bold text-white capitalize">{guide.name}</h2>
              <p className="text-green-200 text-xs">{t(guide.tagline)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Read aloud button */}
            {translatedText && (
              <button type="button" onClick={speaking ? stopSpeak : speak}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                  speaking ? "bg-amber-400 text-amber-900" : "bg-white/20 text-white hover:bg-white/30"
                }`}>
                {speaking ? (
                  <><span className="flex items-end gap-0.5 h-3">{[1,2,3,2,1].map((h,i) => (
                    <span key={i} className="w-0.5 rounded-full bg-amber-800 animate-pulse" style={{height:`${h*3}px`,animationDelay:`${i*100}ms`}} />
                  ))}</span> {t("Stop")}</>
                ) : (
                  <><svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg> {t("Read Aloud")}</>
                )}
              </button>
            )}
            <button onClick={onClose} className="text-white/70 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition">✕</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex-shrink-0">
          {TABS.map(tab => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap transition border-b-2 ${
                activeTab === tab.id
                  ? "border-green-600 text-green-700 dark:text-green-400 bg-white dark:bg-slate-800"
                  : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
              }`}>
              {tab.icon} {t(tab.label)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">

          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <>
              <Section title={t("About this crop")}>
                <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{t(guide.overview)}</p>
              </Section>

              {guide.varieties?.length > 0 && (
                <Section title={t("Recommended Varieties")}>
                  <div className="space-y-2">
                    {guide.varieties.map(v => (
                      <div key={v.name} className="bg-gray-50 dark:bg-slate-700 rounded-xl p-3 border border-gray-100 dark:border-slate-600">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <span className="font-semibold text-sm text-gray-900 dark:text-slate-100">{v.name}</span>
                          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">{v.type}</span>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500 dark:text-slate-400">
                          <span>⏱ {v.duration}</span>
                          <span>📦 {v.yield}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">💡 {t(v.note)}</p>
                      </div>
                    ))}
                  </div>
                  <BuyLinks links={guide.seedLinks} label={t("Buy Seeds")} />
                </Section>
              )}

              {guide.tips?.length > 0 && (
                <Section title={t("Pro Tips")}>
                  <ul className="space-y-1.5">
                    {guide.tips.map((tip, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-slate-300">
                        <span className="text-green-600 dark:text-green-400 flex-shrink-0">✓</span>
                        <span>{t(tip)}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
            </>
          )}

          {/* ── SOIL & SOWING ── */}
          {activeTab === "soil" && (
            <>
              {guide.soilPrep && (
                <Section title={t(guide.soilPrep.title)}>
                  <ol className="space-y-2">
                    {guide.soilPrep.steps.map((s, i) => (
                      <li key={i} className="flex gap-2.5 text-sm text-gray-700 dark:text-slate-300">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold flex items-center justify-center">{i+1}</span>
                        <span>{t(s)}</span>
                      </li>
                    ))}
                  </ol>
                </Section>
              )}
              {guide.sowing && (
                <Section title={t(guide.sowing.title)}>
                  <ol className="space-y-2">
                    {guide.sowing.steps.map((s, i) => (
                      <li key={i} className="flex gap-2.5 text-sm text-gray-700 dark:text-slate-300">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold flex items-center justify-center">{i+1}</span>
                        <span>{t(s)}</span>
                      </li>
                    ))}
                  </ol>
                  <BuyLinks links={guide.seedLinks} label={t("Buy Seeds")} />
                </Section>
              )}
            </>
          )}

          {/* ── CARE (irrigation + fertilizer) ── */}
          {activeTab === "care" && (
            <>
              {guide.irrigation && (
                <Section title={t(guide.irrigation.title)}>
                  <ul className="space-y-1.5">
                    {guide.irrigation.steps.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-slate-300">
                        <span className="text-blue-500 flex-shrink-0">💧</span><span>{t(s)}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
              {guide.fertilizer && (
                <Section title={t(guide.fertilizer.title)}>
                  <div className="space-y-2">
                    {guide.fertilizer.schedule.map((row, i) => (
                      <div key={i} className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                        <div className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">{t(row.time)}</div>
                        <div className="text-sm text-gray-700 dark:text-slate-300">{t(row.dose)}</div>
                      </div>
                    ))}
                  </div>
                  <BuyLinks links={guide.fertilizer.links} label={t("Buy Fertilizers")} />
                </Section>
              )}
            </>
          )}

          {/* ── PEST & DISEASE ── */}
          {activeTab === "pest" && (
            <Section title={t("Pest & Disease Management")}>
              {guide.pestManagement?.length > 0 ? (
                <div className="space-y-3">
                  {guide.pestManagement.map((p, i) => (
                    <div key={i} className={`rounded-xl border p-3 ${
                      p.type === "Disease"
                        ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                        : "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
                    }`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span>{p.type === "Disease" ? "🦠" : "🐛"}</span>
                        <span className="font-semibold text-sm text-gray-900 dark:text-slate-100">{t(p.pest)}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          p.type === "Disease"
                            ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400"
                            : "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400"
                        }`}>{t(p.type)}</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-slate-400 mb-1"><strong>{t("Signs")}: </strong>{t(p.sign)}</p>
                      <p className="text-xs text-gray-700 dark:text-slate-300"><strong>💊 {t("Action")}: </strong>{t(p.action)}</p>
                    </div>
                  ))}
                  <BuyLinks links={guide.pesticideLinks} label={t("Buy Pesticides")} />
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-slate-400">{t("No major pest or disease data available.")}</p>
              )}
            </Section>
          )}

          {/* ── HARVEST ── */}
          {activeTab === "harvest" && (
            <>
              {guide.harvesting && (
                <Section title={t(guide.harvesting.title)}>
                  <ol className="space-y-2">
                    {guide.harvesting.steps.map((s, i) => (
                      <li key={i} className="flex gap-2.5 text-sm text-gray-700 dark:text-slate-300">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center justify-center">{i+1}</span>
                        <span>{t(s)}</span>
                      </li>
                    ))}
                  </ol>
                </Section>
              )}
              {guide.postHarvest && (
                <Section title={t(guide.postHarvest.title)}>
                  <ol className="space-y-2">
                    {guide.postHarvest.steps.map((s, i) => (
                      <li key={i} className="flex gap-2.5 text-sm text-gray-700 dark:text-slate-300">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold flex items-center justify-center">{i+1}</span>
                        <span>{t(s)}</span>
                      </li>
                    ))}
                  </ol>
                </Section>
              )}
            </>
          )}

          {/* ── MARKET & SELL ── */}
          {activeTab === "market" && (
            <>
              {guide.selling && (
                <Section title={t(guide.selling.title)}>
                  <ul className="space-y-2">
                    {guide.selling.options.map((o, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-slate-300">
                        <span className="text-green-600 dark:text-green-400 flex-shrink-0">💰</span><span>{t(o)}</span>
                      </li>
                    ))}
                  </ul>
                  <BuyLinks links={guide.selling.links} label={t("Market Portals")} />
                </Section>
              )}
              {guide.schemes?.length > 0 && (
                <Section title={t("Government Schemes")}>
                  <div className="space-y-2">
                    {guide.schemes.map((s, i) => (
                      <div key={i} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-3">
                        <div className="font-semibold text-sm text-blue-800 dark:text-blue-300 mb-0.5">{s.name}</div>
                        <p className="text-xs text-gray-600 dark:text-slate-400 mb-1.5">{t(s.desc)}</p>
                        <a href={s.link.url} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                          🔗 {t("Apply / Learn More")} ↗
                        </a>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 dark:border-slate-700 px-5 py-3 flex items-center justify-between bg-gray-50 dark:bg-slate-800/50 flex-shrink-0">
          <p className="text-xs text-gray-400 dark:text-slate-500">
            {t("Source: ICAR, NIPHM, KVK guidelines")}
          </p>
          <button onClick={onClose}
            className="bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-5 py-2 rounded-xl transition">
            {t("Close")}
          </button>
        </div>
      </div>
    </div>
  );
}
