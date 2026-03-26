/**
 * VoiceSpeaker.jsx
 * "Read aloud" button that speaks the prediction result using SpeechSynthesis.
 *
 * Props:
 *   text        — string to speak
 *   label       — button label (translated)
 *   speechCode  — BCP-47, e.g. "hi-IN"
 */

import { useEffect, useRef, useState } from "react";

export default function VoiceSpeaker({ text, label = "Read result aloud", speechCode = "en-IN" }) {
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef(null);

  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  // Stop speaking when component unmounts or text changes
  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, [text]);

  function speak() {
    if (!supported || !text) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
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
        inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition
        ${
          speaking
            ? "border-amber-400 bg-amber-50 text-amber-800"
            : "border-green-300 bg-green-50 text-green-800 hover:bg-green-100"
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
                className="w-0.5 rounded-full bg-amber-500 animate-pulse"
                style={{ height: `${h * 4}px`, animationDelay: `${i * 100}ms` }}
              />
            ))}
          </span>
          Stop
        </>
      ) : (
        <>
          {/* Speaker icon */}
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}