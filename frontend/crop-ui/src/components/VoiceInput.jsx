/**
 * VoiceInput.jsx
 * A mic 🎤 button that listens via Web Speech API and calls onResult(text).
 * Attach one next to any form field.
 *
 * Props:
 *   onResult(transcript: string)  — called with the recognised text
 *   speechCode                    — BCP-47 tag, e.g. "hi-IN"
 *   disabled                      — disables the button
 *   label                         — aria-label / tooltip (translated)
 *   listeningLabel                — text shown while mic is active
 *   size                          — "sm" | "md" (default "md")
 */

import { useEffect, useRef, useState } from "react";

const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export default function VoiceInput({
  onResult,
  speechCode = "hi-IN",
  disabled = false,
  label = "Tap to speak",
  listeningLabel = "Listening…",
  size = "md",
}) {
  const [listening, setListening] = useState(false);
  const [supported] = useState(() => Boolean(SpeechRecognition));
  const recognitionRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  // Re-create recognition when speechCode changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
  }, [speechCode]);

  function startListening() {
    if (!SpeechRecognition || listening) return;

    const recognition = new SpeechRecognition();
    recognition.lang = speechCode;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend   = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript || "";
      if (transcript) onResult(transcript.trim());
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  const sizeClasses =
    size === "sm"
      ? "h-7 w-7 rounded-lg text-xs"
      : "h-9 w-9 rounded-xl text-sm";

  const micIcon = listening ? (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  ) : (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );

  if (!supported) {
    return (
      <button
        type="button"
        disabled
        title="Voice input is not supported in this browser (try Chrome or Edge)"
        aria-label="Voice input not available in this browser"
        className={`relative flex shrink-0 cursor-not-allowed items-center justify-center border border-gray-200 bg-gray-50 text-gray-400 opacity-70 ${sizeClasses}`}
      >
        {micIcon}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={listening ? stopListening : startListening}
      disabled={disabled}
      title={listening ? listeningLabel : label}
      aria-label={listening ? listeningLabel : label}
      className={`
        relative flex shrink-0 items-center justify-center border transition
        focus:outline-none disabled:cursor-not-allowed disabled:opacity-50
        ${sizeClasses}
        ${
          listening
            ? "border-red-400 bg-red-50 text-red-600 shadow-md shadow-red-100"
            : "border-green-300 bg-green-50 text-green-700 hover:border-green-500 hover:bg-green-100"
        }
      `}
    >
      {/* Pulse ring while listening */}
      {listening && (
        <span className="absolute inset-0 animate-ping rounded-xl border-2 border-red-400 opacity-60" />
      )}

      {micIcon}
    </button>
  );
}