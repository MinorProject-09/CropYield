/**
 * fertilizerPlan.js
 * Ideal NPK ranges per crop (kg/ha) and fertilizer calculation logic.
 * Sources: ICAR crop production guides, TNAU agri portal.
 */

// Ideal NPK ranges (kg/ha) for each crop
export const IDEAL_NPK = {
  rice:          { N: [80, 120],  P: [40, 60],  K: [40, 60]  },
  wheat:         { N: [100, 150], P: [50, 60],  K: [40, 50]  },
  maize:         { N: [120, 150], P: [60, 75],  K: [40, 60]  },
  chickpea:      { N: [20, 30],   P: [40, 60],  K: [20, 30]  },
  "kidney beans":{ N: [20, 30],   P: [40, 60],  K: [30, 40]  },
  "pigeon peas": { N: [20, 25],   P: [50, 60],  K: [20, 30]  },
  "moth beans":  { N: [15, 20],   P: [30, 40],  K: [20, 25]  },
  "mung bean":   { N: [20, 25],   P: [40, 50],  K: [20, 30]  },
  "black gram":  { N: [20, 25],   P: [40, 50],  K: [20, 30]  },
  lentil:        { N: [20, 25],   P: [40, 50],  K: [20, 30]  },
  pomegranate:   { N: [50, 75],   P: [25, 50],  K: [50, 75]  },
  banana:        { N: [200, 250], P: [60, 80],  K: [200, 300]},
  mango:         { N: [50, 100],  P: [25, 50],  K: [50, 100] },
  grapes:        { N: [50, 75],   P: [30, 50],  K: [50, 75]  },
  watermelon:    { N: [80, 100],  P: [40, 60],  K: [60, 80]  },
  muskmelon:     { N: [80, 100],  P: [40, 60],  K: [60, 80]  },
  apple:         { N: [50, 75],   P: [25, 50],  K: [50, 75]  },
  orange:        { N: [50, 75],   P: [25, 50],  K: [50, 75]  },
  papaya:        { N: [100, 150], P: [50, 75],  K: [100, 150]},
  coconut:       { N: [50, 100],  P: [25, 50],  K: [100, 200]},
  cotton:        { N: [100, 150], P: [50, 75],  K: [50, 75]  },
  jute:          { N: [60, 80],   P: [30, 40],  K: [30, 40]  },
  coffee:        { N: [50, 75],   P: [25, 50],  K: [50, 75]  },
};

// Fertilizer products and their nutrient content (%)
export const FERTILIZERS = {
  N: {
    name: "Urea",
    content: 0.46,       // 46% N
    pricePerKg: 6.5,     // ₹/kg (subsidised rate)
    unit: "N",
    color: "emerald",
    note: "Apply in 2–3 splits: at sowing, tillering, and panicle initiation.",
  },
  P: {
    name: "DAP",
    content: 0.46,       // 46% P₂O₅ (≈ 20% P)
    pricePerKg: 27,      // ₹/kg
    unit: "P₂O₅",
    color: "amber",
    note: "Apply as basal dose at sowing. Mix into soil before planting.",
  },
  K: {
    name: "MOP",
    content: 0.60,       // 60% K₂O (≈ 50% K)
    pricePerKg: 17,      // ₹/kg
    unit: "K₂O",
    color: "blue",
    note: "Apply half as basal, half as top-dressing at 30 days after sowing.",
  },
};

/**
 * Calculate fertilizer plan for a crop given current NPK levels.
 * @param {string} crop - lowercase crop name
 * @param {number} currentN - current soil N (kg/ha)
 * @param {number} currentP - current soil P (kg/ha)
 * @param {number} currentK - current soil K (kg/ha)
 * @param {number} farmSizeHa - farm area in hectares
 * @returns {Array} array of fertilizer recommendations
 */
export function calcFertilizerPlan(crop, currentN, currentP, currentK, farmSizeHa = 1) {
  const ideal = IDEAL_NPK[crop?.toLowerCase()];
  if (!ideal) return null;

  const ha = Math.max(0.1, farmSizeHa);
  const results = [];

  const nutrients = [
    { key: "N", current: currentN, ideal: ideal.N, fert: FERTILIZERS.N },
    { key: "P", current: currentP, ideal: ideal.P, fert: FERTILIZERS.P },
    { key: "K", current: currentK, ideal: ideal.K, fert: FERTILIZERS.K },
  ];

  for (const { key, current, ideal: [lo, hi], fert } of nutrients) {
    const midIdeal = (lo + hi) / 2;
    const deficit = Math.max(0, midIdeal - (current ?? 0));
    const surplus = Math.max(0, (current ?? 0) - hi);
    const status = current == null ? "unknown"
      : current < lo ? "deficient"
      : current > hi ? "excess"
      : "optimal";

    // kg of fertilizer product needed per ha
    const fertKgPerHa = deficit > 0 ? Math.round(deficit / fert.content) : 0;
    const fertKgTotal = Math.round(fertKgPerHa * ha);
    const costTotal   = Math.round(fertKgTotal * fert.pricePerKg);

    results.push({
      nutrient:     key,
      fertName:     fert.name,
      current:      current ?? null,
      idealRange:   `${lo}–${hi} kg/ha`,
      deficit:      Math.round(deficit),
      surplus:      Math.round(surplus),
      status,
      fertKgPerHa,
      fertKgTotal,
      costTotal,
      note:         fert.note,
      color:        fert.color,
      unit:         fert.unit,
    });
  }

  return results;
}
