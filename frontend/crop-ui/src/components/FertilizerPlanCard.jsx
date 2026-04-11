import { useState } from "react";
import { calcFertilizerPlan } from "../data/fertilizerPlan";

const STATUS_STYLE = {
  deficient: { bg: "bg-red-50 dark:bg-red-950/30",     border: "border-red-200 dark:border-red-800",     badge: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400",     label: "⬇ Deficient" },
  optimal:   { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", badge: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400", label: "✅ Optimal" },
  excess:    { bg: "bg-amber-50 dark:bg-amber-950/30",  border: "border-amber-200 dark:border-amber-800",  badge: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400",  label: "⬆ Excess" },
  unknown:   { bg: "bg-gray-50 dark:bg-slate-800",      border: "border-gray-200 dark:border-slate-700",   badge: "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400",       label: "? Unknown" },
};

const NUTRIENT_COLOR = {
  N: { bar: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400" },
  P: { bar: "bg-amber-500",   text: "text-amber-700 dark:text-amber-400" },
  K: { bar: "bg-blue-500",    text: "text-blue-700 dark:text-blue-400" },
};

export default function FertilizerPlanCard({ crop, N, P, K, farmSizeHa = 1 }) {
  const [open, setOpen] = useState(false);

  const plan = calcFertilizerPlan(crop, N, P, K, farmSizeHa);
  if (!plan) return null;

  const totalCost = plan.reduce((s, r) => s + r.costTotal, 0);
  const hasDeficiency = plan.some(r => r.status === "deficient");

  return (
    <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-emerald-50 dark:bg-emerald-950/30 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🌿</span>
          <div>
            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Fertilizer Plan</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-500">
              {hasDeficiency ? "Deficiencies detected — see recommendations" : "Soil nutrients look good"}
            </p>
          </div>
        </div>
        <span className="text-emerald-600 dark:text-emerald-400 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="p-4 space-y-3 bg-white dark:bg-slate-800/80">
          {plan.map(row => {
            const S = STATUS_STYLE[row.status];
            const C = NUTRIENT_COLOR[row.nutrient];
            return (
              <div key={row.nutrient} className={`rounded-xl border p-3 ${S.bg} ${S.border}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${C.text}`}>{row.nutrient}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${S.badge}`}>{S.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                      Current: <span className="font-semibold text-gray-700 dark:text-slate-300">{row.current ?? "—"} kg/ha</span>
                      &nbsp;·&nbsp; Ideal: <span className="font-semibold">{row.idealRange}</span>
                    </p>
                  </div>
                  {row.fertKgPerHa > 0 && (
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${C.text}`}>{row.fertKgTotal} kg</p>
                      <p className="text-xs text-gray-400">total ({row.fertKgPerHa} kg/ha)</p>
                    </div>
                  )}
                </div>

                {row.fertKgPerHa > 0 ? (
                  <div className="bg-white dark:bg-slate-700/50 rounded-lg p-2.5 border border-white dark:border-slate-600 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-700 dark:text-slate-300">Apply: {row.fertName}</span>
                      <span className="font-bold text-gray-900 dark:text-slate-100">₹{row.costTotal.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-slate-600 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${C.bar}`}
                        style={{ width: `${Math.min(100, (row.deficit / 100) * 100)}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{row.note}</p>
                  </div>
                ) : row.status === "excess" ? (
                  <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-2.5 py-1.5">
                    ⚠ Skip {row.fertName} application this season. Excess {row.nutrient} can reduce yield.
                  </p>
                ) : (
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">No additional {row.fertName} needed.</p>
                )}
              </div>
            );
          })}

          {/* Total cost */}
          <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-700/40 rounded-xl px-3 py-2.5 border border-gray-100 dark:border-slate-700">
            <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">Estimated Fertilizer Cost</span>
            <span className="text-base font-bold text-emerald-700 dark:text-emerald-400">
              ₹{totalCost.toLocaleString("en-IN")}
            </span>
          </div>

          <p className="text-xs text-gray-400 dark:text-slate-500 leading-relaxed">
            * Based on ICAR recommended NPK rates. Actual requirements may vary by soil type, variety, and local conditions. Consult your nearest KVK for soil-test-based recommendations.
          </p>
        </div>
      )}
    </div>
  );
}
