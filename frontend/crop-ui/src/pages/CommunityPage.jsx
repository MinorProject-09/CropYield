/**
 * CommunityPage.jsx — Farmer Q&A Forum + Agri-Expert Chat
 * Farmers post questions, others answer, experts get a badge after 5+ answers.
 * The existing AI chatbot is embedded as "Ask AI Expert" for instant answers.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLanguage } from "../i18n/LanguageContext";
import { useAuth } from "../context/AuthContext";
import {
  getCommunityPosts, getCommunityPost, createCommunityPost,
  upvoteCommunityPost, addCommunityAnswer, upvoteCommunityAnswer,
  deleteCommunityPost,
} from "../api/api";
import api from "../api/api";

const CROPS = ["","rice","wheat","maize","chickpea","cotton","banana","mango",
  "grapes","tomato","onion","potato","sugarcane","soybean","groundnut","mustard"];
const SORT_OPTIONS = [
  { value:"recent",    label:"🕐 Recent" },
  { value:"popular",   label:"🔥 Popular" },
  { value:"unanswered",label:"❓ Unanswered" },
];
const CROP_EMOJI = {
  rice:"🌾",wheat:"🌿",maize:"🌽",chickpea:"🫘",cotton:"🌿",
  banana:"🍌",mango:"🥭",grapes:"🍇",tomato:"🍅",onion:"🧅",
  potato:"🥔",sugarcane:"🎋",soybean:"🫘",groundnut:"🥜",mustard:"🌼",
};

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400)return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

function Avatar({ name, size = "sm" }) {
  const sz = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  return (
    <div className={`${sz} rounded-full bg-green-700 text-white font-bold flex items-center justify-center flex-shrink-0`}>
      {(name || "F")[0].toUpperCase()}
    </div>
  );
}

// ── Post card (feed view) ─────────────────────────────────────────────────────
function PostCard({ post, currentUserId, onUpvote, onDelete, onClick, t }) {
  const upvoted = post.upvotedBy?.includes(currentUserId);
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm hover:border-green-200 dark:hover:border-green-700 transition cursor-pointer"
      onClick={() => onClick(post._id)}>
      <div className="flex items-start gap-3">
        {/* Upvote column */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5"
          onClick={e => { e.stopPropagation(); onUpvote(post._id); }}>
          <button type="button"
            className={`text-lg leading-none transition ${upvoted ? "text-green-600 dark:text-green-400" : "text-gray-300 dark:text-slate-600 hover:text-green-500"}`}>
            ▲
          </button>
          <span className="text-xs font-bold text-gray-600 dark:text-slate-400">{post.upvotes}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-sm leading-snug line-clamp-2">
              {post.title}
            </h3>
            {post.solved && (
              <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                ✅ Solved
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 line-clamp-2">{post.body}</p>

          <div className="flex items-center gap-3 mt-2.5 flex-wrap">
            {post.crop && (
              <span className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700 px-2 py-0.5 rounded-full">
                {CROP_EMOJI[post.crop] || "🌾"} {post.crop}
              </span>
            )}
            {post.tags?.slice(0,3).map(tag => (
              <span key={tag} className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
            <span className="text-xs text-gray-400 dark:text-slate-500 ml-auto flex items-center gap-2">
              <span>💬 {post.answers?.length || 0}</span>
              <span>👁 {post.views || 0}</span>
              <span>{timeAgo(post.createdAt)}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-2">
            <Avatar name={post.authorName} />
            <span className="text-xs text-gray-500 dark:text-slate-400">{post.authorName}</span>
            {post.author === currentUserId && (
              <button type="button"
                onClick={e => { e.stopPropagation(); onDelete(post._id); }}
                className="ml-auto text-xs text-red-400 hover:text-red-600 transition">
                🗑
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Post detail view ──────────────────────────────────────────────────────────
function PostDetail({ postId, currentUserId, onBack, t }) {
  const [post,    setPost]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [answer,  setAnswer]  = useState("");
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    setLoading(true);
    getCommunityPost(postId)
      .then(r => setPost(r.data.post))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [postId]);

  async function submitAnswer() {
    if (!answer.trim()) return;
    setSaving(true);
    try {
      const r = await addCommunityAnswer(postId, answer.trim());
      setPost(r.data.post);
      setAnswer("");
    } catch (e) { setError(e.response?.data?.message || e.message); }
    finally { setSaving(false); }
  }

  async function handleUpvoteAnswer(aid) {
    try {
      const r = await upvoteCommunityAnswer(postId, aid);
      setPost(p => ({
        ...p,
        answers: p.answers.map(a =>
          a._id === aid ? { ...a, upvotes: r.data.upvotes } : a
        ),
      }));
    } catch {}
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-green-700 dark:text-green-400">
      <span className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mr-3" />
      {t("Loading…")}
    </div>
  );
  if (!post) return <div className="text-center py-10 text-gray-400">{t("Post not found.")}</div>;

  return (
    <div className="space-y-6">
      <button type="button" onClick={onBack}
        className="text-sm text-green-700 dark:text-green-400 font-semibold hover:underline flex items-center gap-1">
        ← {t("Back to Forum")}
      </button>

      {/* Question */}
      <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <span className="text-lg text-gray-300 dark:text-slate-600">▲</span>
            <span className="text-sm font-bold text-gray-600 dark:text-slate-400">{post.upvotes}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {post.solved && <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-semibold">✅ Solved</span>}
              {post.crop && <span className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700 px-2 py-0.5 rounded-full">{CROP_EMOJI[post.crop] || "🌾"} {post.crop}</span>}
              {post.tags?.map(tag => <span key={tag} className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 px-2 py-0.5 rounded-full">#{tag}</span>)}
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-3">{post.title}</h2>
            <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{post.body}</p>
            <div className="flex items-center gap-2 mt-4 text-xs text-gray-400 dark:text-slate-500">
              <Avatar name={post.authorName} />
              <span>{post.authorName}</span>
              <span>·</span>
              <span>{timeAgo(post.createdAt)}</span>
              <span>·</span>
              <span>👁 {post.views}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Answers */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-3">
          💬 {post.answers?.length || 0} {t("Answers")}
        </h3>
        <div className="space-y-4">
          {(post.answers || [])
            .sort((a, b) => b.upvotes - a.upvotes)
            .map(ans => (
            <div key={ans._id} className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <button type="button" onClick={() => handleUpvoteAnswer(ans._id)}
                    className="text-lg text-gray-300 dark:text-slate-600 hover:text-green-500 transition">▲</button>
                  <span className="text-xs font-bold text-gray-600 dark:text-slate-400">{ans.upvotes}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{ans.body}</p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-400 dark:text-slate-500">
                    <Avatar name={ans.authorName} />
                    <span className="font-medium text-gray-600 dark:text-slate-400">{ans.authorName}</span>
                    {ans.isExpert && (
                      <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-semibold text-xs">
                        🏅 {t("Expert")}
                      </span>
                    )}
                    <span>·</span>
                    <span>{timeAgo(ans.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Write answer */}
      <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
          ✍️ {t("Your Answer")}
        </h3>
        <textarea
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          rows={5}
          placeholder={t("Share your farming experience or knowledge…")}
          className="w-full border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30 resize-y"
        />
        {error && <p className="text-xs text-red-600 dark:text-red-400">⚠ {error}</p>}
        <button type="button" onClick={submitAnswer} disabled={saving || !answer.trim()}
          className="bg-green-700 hover:bg-green-800 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition disabled:opacity-60 flex items-center gap-2">
          {saving ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{t("Posting…")}</> : `📤 ${t("Post Answer")}`}
        </button>
        <p className="text-xs text-gray-400 dark:text-slate-500">
          💡 {t("Answer 5+ questions to earn the 🏅 Expert badge.")}
        </p>
      </div>
    </div>
  );
}

// ── New post form ─────────────────────────────────────────────────────────────
function NewPostForm({ onCreated, onCancel, t }) {
  const [form, setForm] = useState({ title: "", body: "", crop: "", tags: "" });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState(null);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const cls = "w-full border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900/30";

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      setError("Title and question are required.");
      return;
    }
    setSaving(true); setError(null);
    try {
      const tags = form.tags.split(",").map(s => s.trim()).filter(Boolean);
      const r = await createCommunityPost({ ...form, tags });
      onCreated(r.data.post);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
      <h3 className="font-bold text-gray-800 dark:text-slate-200 text-sm uppercase tracking-wide">
        ✍️ {t("Ask the Community")}
      </h3>
      <div>
        <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1 block">{t("Question Title")}</label>
        <input value={form.title} onChange={set("title")} className={cls}
          placeholder={t("e.g. Which crop is best for black soil in Maharashtra?")} maxLength={200} />
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1 block">{t("Details")}</label>
        <textarea value={form.body} onChange={set("body")} rows={5} className={`${cls} resize-y`}
          placeholder={t("Describe your soil, location, water source, farm size, and what you want to know…")} maxLength={3000} />
        <div className="text-xs text-gray-400 dark:text-slate-500 text-right mt-0.5">{form.body.length}/3000</div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1 block">{t("Crop (optional)")}</label>
          <div className="relative">
            <select value={form.crop} onChange={set("crop")} className={`${cls} appearance-none pr-8`}>
              {CROPS.map(c => <option key={c} value={c}>{c ? `${CROP_EMOJI[c] || "🌾"} ${c}` : t("Select crop")}</option>)}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1 block">{t("Tags (comma separated)")}</label>
          <input value={form.tags} onChange={set("tags")} className={cls}
            placeholder={t("e.g. irrigation, pest, fertilizer")} />
        </div>
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">⚠ {error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="flex-1 bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-xl text-sm transition disabled:opacity-60 flex items-center justify-center gap-2">
          {saving ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{t("Posting…")}</> : `🌾 ${t("Post Question")}`}
        </button>
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition">
          {t("Cancel")}
        </button>
      </div>
    </form>
  );
}

// ── AI Expert panel (uses existing chatbot backend) ───────────────────────────
function AskAIPanel({ t, lang, currentLang, speechCode }) {
  const [open,    setOpen]    = useState(false);
  const [msgs,    setMsgs]    = useState([]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setMsgs(m => [...m, { role: "user", text }]);
    setInput(""); setLoading(true);
    try {
      const r = await api.post("/api/chat", { message: text, lang, langLabel: currentLang?.label || "English" });
      setMsgs(m => [...m, { role: "ai", text: r.data.reply || "No response." }]);
    } catch (e) {
      setMsgs(m => [...m, { role: "ai", text: "Could not reach AI. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-2xl overflow-hidden shadow-sm">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <div className="font-bold text-green-800 dark:text-green-300 text-sm">{t("Ask AI Agri-Expert")}</div>
            <div className="text-xs text-green-600 dark:text-green-400">{t("Instant answers powered by Gemini AI")}</div>
          </div>
        </div>
        <span className="text-green-600 dark:text-green-400 text-sm">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t border-green-200 dark:border-green-700">
          {/* Messages */}
          <div className="h-64 overflow-y-auto p-4 space-y-3 bg-white/50 dark:bg-slate-800/50">
            {msgs.length === 0 && (
              <div className="text-xs text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-700 rounded-xl p-3 border border-gray-100 dark:border-slate-600">
                <p className="font-semibold text-green-700 dark:text-green-400 mb-1">💡 {t("Try asking:")}</p>
                <ul className="space-y-1 list-disc pl-4">
                  <li>{t("Best crop for black soil in Vidarbha with 5 acres?")}</li>
                  <li>{t("My rice leaves are turning yellow — what to do?")}</li>
                  <li>{t("How to increase wheat yield in Punjab?")}</li>
                </ul>
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-green-600 text-white rounded-br-sm"
                    : "bg-white dark:bg-slate-700 border border-gray-100 dark:border-slate-600 text-gray-800 dark:text-slate-200 rounded-bl-sm"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <p className="text-xs text-green-600 dark:text-green-400 pl-1">{t("Thinking…")}</p>}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 p-3 border-t border-green-100 dark:border-green-800 bg-white dark:bg-slate-800">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
              placeholder={t("Ask about crops, soil, pests, market…")}
              disabled={loading}
              className="flex-1 border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2 text-xs bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 outline-none focus:border-green-500" />
            <button type="button" onClick={send} disabled={loading || !input.trim()}
              className="bg-green-700 hover:bg-green-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition disabled:opacity-50">
              {t("Ask")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CommunityPage() {
  const { t, lang, currentLang, speechCode } = useLanguage();
  const { user } = useAuth();
  const [posts,      setPosts]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [sort,       setSort]       = useState("recent");
  const [cropFilter, setCropFilter] = useState("");
  const [search,     setSearch]     = useState("");
  const [showForm,   setShowForm]   = useState(false);
  const [activePost, setActivePost] = useState(null); // postId for detail view
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = useCallback(async (pg = 1) => {
    setLoading(true); setError(null);
    try {
      const r = await getCommunityPosts({ sort, crop: cropFilter, page: pg, limit: 15 });
      setPosts(r.data.posts || []);
      setTotalPages(r.data.pages || 1);
      setPage(pg);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, [sort, cropFilter]);

  useEffect(() => { fetchPosts(1); }, [fetchPosts]);

  async function handleUpvote(id) {
    try {
      const r = await upvoteCommunityPost(id);
      setPosts(ps => ps.map(p => p._id === id ? { ...p, upvotes: r.data.upvotes } : p));
    } catch {}
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this post?")) return;
    try {
      await deleteCommunityPost(id);
      setPosts(ps => ps.filter(p => p._id !== id));
    } catch {}
  }

  function handleCreated(post) {
    setPosts(ps => [post, ...ps]);
    setShowForm(false);
  }

  // Client-side search filter
  const filtered = search.trim()
    ? posts.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.body.toLowerCase().includes(search.toLowerCase()) ||
        p.tags?.some(t => t.includes(search.toLowerCase()))
      )
    : posts;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-[Outfit,system-ui,sans-serif]">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-green-800 to-green-700 text-white px-6 py-10">
        <div className="max-w-5xl mx-auto flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-green-300 text-sm mb-1">👥 {t("Community")}</p>
            <h1 className="text-2xl md:text-3xl font-bold">{t("Farmer Q&A Forum")}</h1>
            <p className="text-green-200 text-sm mt-1 max-w-xl">
              {t("Ask questions, share knowledge, and get answers from fellow farmers and agri-experts.")}
            </p>
          </div>
          {!showForm && !activePost && (
            <button type="button" onClick={() => setShowForm(true)}
              className="bg-white text-green-800 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-green-50 transition shadow">
              ✍️ {t("Ask a Question")}
            </button>
          )}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-6">
        <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">

          {/* ── Main column ── */}
          <div className="space-y-6">

            {/* New post form */}
            {showForm && !activePost && (
              <NewPostForm onCreated={handleCreated} onCancel={() => setShowForm(false)} t={t} />
            )}

            {/* Post detail */}
            {activePost && (
              <PostDetail
                postId={activePost}
                currentUserId={user?._id}
                onBack={() => setActivePost(null)}
                t={t}
              />
            )}

            {/* Feed */}
            {!activePost && (
              <>
                {/* Search + filters */}
                <div className="space-y-3">
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder={t("Search questions…")}
                    className="w-full border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 outline-none focus:border-green-500" />

                  <div className="flex gap-2 flex-wrap">
                    {SORT_OPTIONS.map(s => (
                      <button key={s.value} type="button" onClick={() => setSort(s.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                          sort === s.value
                            ? "bg-green-700 text-white border-green-700"
                            : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-green-300"
                        }`}>
                        {s.label}
                      </button>
                    ))}
                    <select value={cropFilter} onChange={e => setCropFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 outline-none focus:border-green-500 appearance-none">
                      <option value="">{t("All Crops")}</option>
                      {CROPS.filter(Boolean).map(c => (
                        <option key={c} value={c}>{CROP_EMOJI[c] || "🌾"} {c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl p-4 text-red-700 dark:text-red-400 text-sm">
                    ⚠ {error}
                  </div>
                )}

                {/* Loading */}
                {loading ? (
                  <div className="space-y-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 animate-pulse h-28" />
                    ))}
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="bg-white dark:bg-slate-800 border border-dashed border-gray-200 dark:border-slate-700 rounded-2xl p-12 text-center">
                    <p className="text-4xl mb-3">🌱</p>
                    <p className="text-gray-500 dark:text-slate-400 text-sm mb-4">
                      {search ? t("No questions match your search.") : t("No questions yet. Be the first to ask!")}
                    </p>
                    <button type="button" onClick={() => setShowForm(true)}
                      className="bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-green-800 transition">
                      ✍️ {t("Ask a Question")}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filtered.map(post => (
                      <PostCard
                        key={post._id}
                        post={post}
                        currentUserId={user?._id}
                        onUpvote={handleUpvote}
                        onDelete={handleDelete}
                        onClick={setActivePost}
                        t={t}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button type="button" onClick={() => fetchPosts(page - 1)} disabled={page <= 1}
                      className="px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 text-sm text-gray-600 dark:text-slate-400 hover:border-green-300 disabled:opacity-40 transition">
                      ← {t("Prev")}
                    </button>
                    <span className="text-sm text-gray-500 dark:text-slate-400">
                      {page} / {totalPages}
                    </span>
                    <button type="button" onClick={() => fetchPosts(page + 1)} disabled={page >= totalPages}
                      className="px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 text-sm text-gray-600 dark:text-slate-400 hover:border-green-300 disabled:opacity-40 transition">
                      {t("Next")} →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-5 lg:sticky lg:top-6">

            {/* AI Expert */}
            <AskAIPanel t={t} lang={lang} currentLang={currentLang} speechCode={speechCode} />

            {/* Community stats */}
            <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
                📊 {t("Community")}
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>📝 {t("Total Questions")}</span>
                  <span className="font-semibold text-gray-900 dark:text-slate-100">{posts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>💬 {t("Answered")}</span>
                  <span className="font-semibold text-green-700 dark:text-green-400">
                    {posts.filter(p => p.answers?.length > 0).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>❓ {t("Unanswered")}</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    {posts.filter(p => !p.answers?.length).length}
                  </span>
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-green-800 dark:text-green-300 uppercase tracking-wide">
                💡 {t("How It Works")}
              </h3>
              <ul className="space-y-2 text-xs text-gray-600 dark:text-slate-400">
                {[
                  { icon:"✍️", text: t("Post your farming question with details about your soil, location, and crop.") },
                  { icon:"👥", text: t("Fellow farmers and experts answer from their experience.") },
                  { icon:"▲",  text: t("Upvote helpful answers to push them to the top.") },
                  { icon:"🏅", text: t("Answer 5+ questions to earn the Expert badge.") },
                  { icon:"🤖", text: t("Use Ask AI Expert for instant answers from Gemini AI.") },
                ].map(({ icon, text }, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="flex-shrink-0">{icon}</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick links */}
            <div className="space-y-2">
              {[
                { to:"/prediction", icon:"🌾", label:t("Crop Prediction") },
                { to:"/schemes",    icon:"🏛️", label:t("Govt. Schemes") },
                { to:"/market",     icon:"💰", label:t("Market Prices") },
              ].map(({ to, icon, label }) => (
                <Link key={to} to={to}
                  className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-3 text-sm font-medium text-gray-700 dark:text-slate-300 hover:border-green-300 dark:hover:border-green-600 transition">
                  <span>{icon}</span>{label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
