import { getCropRotation } from "../data/cropRotation";
import { getCropInfo } from "../data/cropInfo";

export default function CropRotationCard({ crop }) {
  const rotation = getCropRotation(crop);
  if (!rotation) return null;

  return (
    <div className="rounded-xl border border-violet-200 dark:border-violet-800/50 overflow-hidden">
      <div className="px-4 py-3 bg-violet-50 dark:bg-violet-950/30 flex items-center gap-2">
        <span className="text-lg">🔄</span>
        <div>
          <p className="text-sm font-bold text-violet-800 dark:text-violet-300">Next Season Rotation</p>
          <p className="text-xs text-violet-600 dark:text-violet-500">Recommended crops to grow after {crop}</p>
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-slate-800/80 space-y-3">
        {/* Reason */}
        <p className="text-xs text-gray-600 dark:text-slate-400 leading-relaxed bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-800/30 rounded-lg px-3 py-2">
          💡 {rotation.reason}
        </p>

        {/* Next crop options */}
        <div className="grid grid-cols-2 gap-2">
          {rotation.next.map(nextCrop => {
            const info = getCropInfo(nextCrop);
            return (
              <div key={nextCrop}
                className="flex items-center gap-2 bg-gray-50 dark:bg-slate-700/40 border border-gray-100 dark:border-slate-700 rounded-xl px-3 py-2.5 hover:border-violet-200 dark:hover:border-violet-700 transition">
                <span className="text-xl flex-shrink-0">{info?.emoji || "🌾"}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800 dark:text-slate-200 capitalize truncate">{nextCrop}</p>
                  {info?.season && (
                    <p className="text-xs text-gray-400 dark:text-slate-500">{info.season}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-400 dark:text-slate-500">
          * Rotation suggestions based on ICAR guidelines. Actual choice depends on market demand, water availability, and local conditions.
        </p>
      </div>
    </div>
  );
}
