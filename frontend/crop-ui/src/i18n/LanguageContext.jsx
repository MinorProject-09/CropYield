/**
 * LanguageContext.jsx
 * Provides language state + t() translation helper to the whole app.
 * Usage:
 *   import { useLanguage } from "../i18n/LanguageContext";
 *   const { t, lang, setLang, speechCode } = useLanguage();
 *   <p>{t("pageTitle")}</p>
 */

import { createContext, useContext, useState } from "react";
import translations, { LANGUAGES } from "./translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    // Persist last-used language in localStorage
    try { return localStorage.getItem("cropLang") || "en"; } catch { return "en"; }
  });

  function changeLang(code) {
    setLang(code);
    try { localStorage.setItem("cropLang", code); } catch {}
  }

  /**
   * Translate a key.
   * If the value is a function (e.g. resultSpeech), pass args through.
   * Falls back to English, then to the key itself.
   */
  function t(key, ...args) {
    const entry = translations[key];
    if (!entry) return key;
    const val = entry[lang] ?? entry["en"] ?? key;
    return typeof val === "function" ? val(...args) : val;
  }

  const currentLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t, speechCode: currentLang.speechCode, currentLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return ctx;
}