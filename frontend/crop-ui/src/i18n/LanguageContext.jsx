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