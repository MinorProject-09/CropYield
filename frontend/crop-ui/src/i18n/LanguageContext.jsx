import { createContext, useContext, useState, useCallback, useRef } from "react";
import { LANGUAGES } from "./translations";

const LanguageContext = createContext(null);

// In-memory cache: { "text||langCode": "translatedText" }
const cache = {};

async function googleTranslate(text, targetLang) {
  if (!text || targetLang === "en") return text;
  const key = `${text}||${targetLang}`;
  if (cache[key]) return cache[key];

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    // Response shape: [ [ ["translated", "original", ...], ... ], ... ]
    const translated = data[0]?.map((chunk) => chunk[0]).join("") || text;
    cache[key] = translated;
    return translated;
  } catch {
    return text; // fallback to English on error
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem("cropLang") || "en"; } catch { return "en"; }
  });

  // translationMap holds { "originalText": "translatedText" } for current lang
  const [translationMap, setTranslationMap] = useState({});
  const pendingRef = useRef(new Set());

  function changeLang(code) {
    setLangState(code);
    setTranslationMap({}); // clear map so new lang translations load fresh
    try { localStorage.setItem("cropLang", code); } catch {}
  }

  // t() returns the cached translation synchronously, and triggers async fetch if missing
  const t = useCallback((text) => {
    if (!text || lang === "en") return text;
    if (translationMap[text] !== undefined) return translationMap[text];

    // Kick off translation if not already pending
    if (!pendingRef.current.has(`${text}||${lang}`)) {
      pendingRef.current.add(`${text}||${lang}`);
      googleTranslate(text, lang).then((translated) => {
        pendingRef.current.delete(`${text}||${lang}`);
        setTranslationMap((prev) => {
          if (prev[text] === translated) return prev;
          return { ...prev, [text]: translated };
        });
      });
    }

    // Return English text while translation loads
    return text;
  }, [lang, translationMap]);

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
