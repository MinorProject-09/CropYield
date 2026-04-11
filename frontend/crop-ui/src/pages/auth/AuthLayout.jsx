/**
 * AuthLayout — shared split-screen layout for all auth pages.
 * Left: dark brand panel with features list.
 * Right: white/dark form panel.
 */
const FEATURES = [
  { icon: "🤖", text: "AI crop recommendation with 99.7% accuracy" },
  { icon: "📡", text: "Real-time IoT soil monitoring" },
  { icon: "🌤", text: "Hyperlocal weather & risk alerts" },
  { icon: "💰", text: "Live mandi prices & profit analysis" },
  { icon: "🏛️", text: "Government scheme eligibility checker" },
  { icon: "🤝", text: "Farmer community & AI expert chat" },
];

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex font-[Outfit,system-ui,sans-serif]">
      {/* ── Left panel — brand ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] flex-col justify-between bg-[#0d1117] px-12 py-14 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-600/6 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        {/* Brand */}
        <div className="relative">
          <div className="flex items-center gap-2.5 mb-12">
            <span className="text-3xl">🌾</span>
            <span className="text-white font-bold text-xl">CropYield <span className="text-emerald-400">AI</span></span>
          </div>

          <h2 className="text-3xl font-bold text-white leading-tight mb-3">
            Smarter farming<br />
            <span className="text-emerald-400">starts here</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-10">
            AI-powered crop intelligence for Indian farmers — from soil to harvest.
          </p>

          <ul className="space-y-4">
            {FEATURES.map(({ icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-base flex-shrink-0">{icon}</span>
                <span className="text-slate-300 text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom badge */}
        <div className="relative flex items-center gap-2 text-xs text-slate-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          🇮🇳 Built for Indian farmers · 22 crops supported
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center bg-[#f8faf8] dark:bg-[#0d1117] px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="text-2xl">🌾</span>
            <span className="font-bold text-gray-900 dark:text-slate-100 text-lg">CropYield <span className="text-emerald-600 dark:text-emerald-400">AI</span></span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
