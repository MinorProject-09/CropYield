import { useState, useRef } from "react";
import api from "../api/api";
import { useLanguage } from "../i18n/LanguageContext";
import VoiceInput from "./VoiceInput";

function renderInlineMarkdown(text) {
  const parts = String(text || "").split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
  );
}

const MAX_FILES = 5;
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ACCEPT =
  "image/*,.pdf,.ppt,.pptx,.doc,.docx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const { lang, currentLang, t, speechCode } = useLanguage();

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const onPickFiles = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    setAttachments((prev) => {
      const next = [...prev];
      for (const f of files) {
        if (next.length >= MAX_FILES) break;
        if (f.size > MAX_FILE_BYTES) continue;
        next.push(f);
      }
      return next;
    });
  };

  const sendMessage = async () => {
    const text = message.trim();
    if ((!text && attachments.length === 0) || loading) return;

    const userMsg = text || t("Please help with the attached file(s).");
    const userLabel =
      attachments.length > 0
        ? `${userMsg}\n📎 ${attachments.map((f) => f.name).join(", ")}`
        : userMsg;

    setChat((prev) => [...prev, { type: "user", text: userLabel }]);
    setMessage("");
    const filesToSend = [...attachments];
    setAttachments([]);
    setLoading(true);

    try {
      let res;
      if (filesToSend.length > 0) {
        const fd = new FormData();
        fd.append("message", userMsg);
        fd.append("lang", lang);
        fd.append("langLabel", currentLang?.label || "English");
        filesToSend.forEach((f) => fd.append("files", f));
        res = await api.post("/api/chat", fd);
      } else {
        res = await api.post("/api/chat", {
          message: userMsg,
          lang,
          langLabel: currentLang?.label || "English",
        });
      }
      const replyText =
        res.data?.reply ||
        res.data?.error ||
        "No response from assistant.";
      setChat((prev) => [...prev, { type: "bot", text: replyText }]);
    } catch (e) {
      const detail =
        e.response?.data?.reply ||
        e.response?.data?.message ||
        e.response?.data?.error ||
        e.message;
      setChat((prev) => [
        ...prev,
        {
          type: "bot",
          text:
            typeof detail === "string"
              ? detail
              : "Could not reach the assistant. Check that the backend is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const canSend =
    !loading && (message.trim().length > 0 || attachments.length > 0);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        accept={ACCEPT}
        onChange={onPickFiles}
      />

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-green-600 to-emerald-800 text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition flex items-center justify-center text-2xl border-2 border-white/20 dark:border-slate-600 dark:shadow-emerald-950/50"
        aria-label="Open farming assistant"
      >
        🌾
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[min(100vw-1.5rem,22rem)] bg-white rounded-2xl shadow-2xl border border-green-100 flex flex-col overflow-hidden max-h-[min(85vh,28rem)] dark:bg-slate-900 dark:border-slate-700 dark:shadow-black/40">
          <div className="bg-gradient-to-r from-green-700 via-green-600 to-emerald-700 text-white px-4 py-3 shrink-0 dark:from-slate-800 dark:via-slate-800 dark:to-emerald-900">
            <div className="font-semibold text-sm tracking-wide">
              {t("CropYield Assistant")}
            </div>
            <p className="text-[11px] text-green-100 mt-0.5 leading-snug">
              {t("Ask in your selected language about crop, yield, and profit")}
            </p>
          </div>

          <div className="flex-1 min-h-[12rem] max-h-[18rem] overflow-y-auto p-3 space-y-2.5 text-sm bg-gradient-to-b from-green-50/50 to-white dark:from-slate-900 dark:to-slate-900">
            {chat.length === 0 && (
              <div className="rounded-xl bg-white/90 border border-green-100 p-3 text-gray-600 text-xs leading-relaxed shadow-sm dark:bg-slate-800/90 dark:border-slate-600 dark:text-slate-300">
                <p className="font-medium text-green-800 mb-1 dark:text-green-400">Try asking:</p>
                <ul className="list-disc pl-4 space-y-1 text-gray-600 dark:text-slate-400">
                  <li>{t("My soil pH is 6.5 and I have 3 acres. Which crop will be best?")}</li>
                  <li>{t("Black soil in Maharashtra, 5 acres, borewell water: suggest best crop and rough profit.")}</li>
                </ul>
              </div>
            )}
            {chat.map((c, i) => (
              <div
                key={i}
                className={`flex ${c.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-3 py-2 rounded-2xl max-w-[88%] text-[13px] leading-snug shadow-sm ${
                    c.type === "user"
                      ? "bg-green-600 text-white rounded-br-md dark:bg-emerald-700"
                      : "bg-white border border-gray-100 text-gray-800 rounded-bl-md dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
                  } whitespace-pre-wrap`}
                >
                  {renderInlineMarkdown(c.text)}
                </div>
              </div>
            ))}
            {loading && (
              <p className="text-xs text-green-600/80 pl-1 dark:text-emerald-400/90">{t("Thinking…")}</p>
            )}
          </div>

          {attachments.length > 0 && (
            <div className="px-2 pt-2 flex flex-wrap gap-1 border-t border-green-50 bg-white dark:border-slate-700 dark:bg-slate-900">
              {attachments.map((f, i) => (
                <span
                  key={`${f.name}-${i}`}
                  className="inline-flex items-center gap-1 text-[10px] bg-green-50 text-green-800 px-2 py-0.5 rounded-full border border-green-100 max-w-full dark:bg-slate-800 dark:text-emerald-200 dark:border-slate-600"
                >
                  <span className="truncate max-w-[140px]">{f.name}</span>
                  <button
                    type="button"
                    className="text-green-600 hover:text-red-600 font-bold"
                    onClick={() => removeAttachment(i)}
                    aria-label="Remove file"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex border-t border-green-100 bg-white p-1.5 gap-1 shrink-0 items-center dark:border-slate-700 dark:bg-slate-900">
            <VoiceInput
              speechCode={speechCode || "hi-IN"}
              disabled={loading}
              onResult={(transcript) =>
                setMessage((prev) => (prev ? `${prev} ${transcript}` : transcript))
              }
              label={t("Speak")}
              listeningLabel={t("Listening…")}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || attachments.length >= MAX_FILES}
              className="shrink-0 h-9 w-9 rounded-xl border border-green-300 bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-lg dark:border-slate-600 dark:bg-slate-800 dark:text-emerald-300 dark:hover:bg-slate-700"
              title={t("Attach file")}
              aria-label={t("Attach file")}
            >
              📎
            </button>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={t("Region, soil, water, farm size, goals…")}
              disabled={loading}
              className="flex-1 min-w-0 px-3 py-2.5 text-sm outline-none rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-200 disabled:opacity-60 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-800 dark:focus:ring-emerald-700/50"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!canSend}
              className="px-4 py-2 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0"
            >
              {t("Send")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
