/**
 * VoiceSpeaker.jsx
 * "Read aloud" button that speaks text using SpeechSynthesis.
 * Automatically translates text to the currently selected language before speaking.
 */

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";

export default function VoiceSpeaker({ text, label = "Read result aloud", speechCode: speechCodeProp }) {
  const { lang, speechCode: ctxSpeechCode } = useLanguage();
  const speechCode = speechCodeProp || ctxSpeechCode;
  const [speaking, setSpeaking] = useState(false);
  const [translatedText, setTranslatedText] = useState(text);
  const utteranceRef = useRef(null);

  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  // Translate text whenever lang or text changes
  useEffect(() => {
    if (!text) { setTranslatedText(""); return; }
    if (lang === "en") { setTranslatedText(text); return; }
    const key = `${text}||${lang}`;
    // Use the same cache from LanguageContext via the translate endpoint
    fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`)
      .then(r => r.json())
      .then(data => {
        const translated = data[0]?.map(chunk => chunk[0]).join("") || text;
        setTranslatedText(translated);
      })
      .catch(() => setTranslatedText(text));
  }, [text, lang]);

  // Stop speaking when text changes
  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, [text]);

  function speak() {
    if (!supported || !translatedText) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = speechCode;
    utterance.rate = 0.9;
    utterance.pitch = 1;

    // Try to find a voice matching the language
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((v) => v.lang.startsWith(speechCode.split("-")[0]));
    if (match) utterance.voice = match;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend   = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }

  function stop() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  if (!supported || !text) return null;

  return (
    <button
      type="button"
      onClick={speaking ? stop : speak}
      className={`
        inline-flex items-center gap-2  flex-col px-5 py-4 text-large font-sm transition bg-white shadow-lg bottom-6 right-6 z-50 bg-gradient-to-br from-green-600 to-emerald-800 text-white w-14 h-14 rounded-full hover:shadow-xl hover:scale-105  justify-center text-2xl border-2 border-white/20
        ${  
          speaking
            ? "border-amber-400 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
            : "border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700 text-green-800 dark:text-green-300 hover:bg-slate-100 dark:hover:bg-green-900/40 "
        }
      `}
    >
      {speaking ? (
        <>
          {/* Animated soundwave */}
          <span className="flex items-end gap-0.5 h-4">
            {[1, 2, 3, 2, 1].map((h, i) => (
              <span
                key={i}
                className="w-0.5 rounded-full bg-white animate-pulse"
                style={{ height: `${h * 4}px`, animationDelay: `${i * 100}ms` }}
              />
            ))}
          </span>
          
        </>
      ) : (
        <>
          {/* Speaker icon */}
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        </>
      )}
    </button>
  );
}