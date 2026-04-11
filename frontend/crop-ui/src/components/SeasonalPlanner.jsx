import { useState } from "react";
import { generateTimeline, ACTIVITY_COLORS } from "../data/cropTimeline";
import { getCropInfo } from "../data/cropInfo";

export default function SeasonalPlanner({ prediction }) {
  const [open, setOpen] = useState(false);
  if (!prediction?.recommendedCrop) return null;

  const { recommendedCrop, cropMonth, duration } = prediction;
  const info = getCropInfo(recommendedCrop);
  const timeline = generateTimeline(recommendedCrop, cropMonth || 6, duration || 90);
  const upcoming = timeline.filter(e => e.isUpcoming);
  const future   = timeline.filter(e => !e.isPast);

  return (
    <div className="bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/60 rounded-2xl overflow-hidden shadow-sm">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{info?.emoji || "🌾"}</span>
          <div>
            <p className="font-bold text-gray-900 dark:text-slate-100 text-sm capitalize">
              Seasonal Planner — {recommendedCrop}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
              {upcoming.length > 0
                ? `⚡ ${upcoming.length} task${upcoming.length > 1 ? "s" : ""} due in the next 2 weeks`
                : `${future.length} upcoming activities`}
            </p>
          </div>
        </div>
        <span className="text-gray-400 text-sm">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t border-gray-100 dark:border-slate-700/60">
          {/* Legend */}
          <div className="flex flex-wrap gap-2 px-5 py-3 border-b border-gray-50 dark:border-slate-700/40">
            {Object.entries(ACTIVITY_COLORS).map(([type, style]) => (
              <span key={type} className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                <span className={`w-2 h-2 rounded-full ${style.dot}`} />{type}
              </span>
            ))}
          </div>

          {/* Timeline */}
          <div className="px-5 py-4 space-y-2 max-h-96 overflow-y-auto">
            {timeline.map((event, i) => {
              const style = ACTIVITY_COLORS[event.activity] || ACTIVITY_COLORS["Post-Harvest"];
              return (
                <div key={i} className={`flex items-start gap-3 rounded-xl p-3 border transition ${
                  event.isUpcoming
                    ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 ring-1 ring-emerald-200 dark:ring-emerald-800"
                    : event.isPast
                    ? "border-gray-100 dark:border-slate-700/40 bg-gray-50/50 dark:bg-slate-800/30 opacity-50"
                    : `border-gray-100 dark:border-slate-700/40 ${style.bg}`
                }`}>
                  <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${style.dot} ${event.isUpcoming ? "animate-pulse" : ""}`} />
                    {i < timeline.length - 1 && <div className="w-px h-4 bg-gray-200 dark:bg-slate-700" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                        {event.activity}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-slate-500">{event.date}</span>
                      {event.isUpcoming && (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">⚡ Due soon</span>
                      )}
                      {event.isPast && (
                        <span className="text-xs text-gray-400 dark:text-slate-500">✓ Past</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-slate-400 mt-1 leading-relaxed">{event.task}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-5 py-3 border-t border-gray-50 dark:border-slate-700/40">
            <p className="text-xs text-gray-400 dark:text-slate-500">
              * Timeline based on sowing in month {cropMonth}. Adjust based on actual sowing date and local conditions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
