/**
 * cropTimeline.js
 * Week-by-week farming activity timeline for each crop.
 * Used by the Seasonal Planner on the Dashboard.
 */

// Activity types and their colors
export const ACTIVITY_COLORS = {
  "Land Prep":    { bg: "bg-amber-100 dark:bg-amber-900/30",   text: "text-amber-800 dark:text-amber-300",   dot: "bg-amber-500"   },
  "Sowing":       { bg: "bg-emerald-100 dark:bg-emerald-900/30",text: "text-emerald-800 dark:text-emerald-300",dot: "bg-emerald-500" },
  "Fertilizer":   { bg: "bg-blue-100 dark:bg-blue-900/30",     text: "text-blue-800 dark:text-blue-300",     dot: "bg-blue-500"    },
  "Irrigation":   { bg: "bg-cyan-100 dark:bg-cyan-900/30",     text: "text-cyan-800 dark:text-cyan-300",     dot: "bg-cyan-500"    },
  "Pest Control": { bg: "bg-red-100 dark:bg-red-900/30",       text: "text-red-800 dark:text-red-300",       dot: "bg-red-500"     },
  "Weeding":      { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-800 dark:text-orange-300", dot: "bg-orange-500"  },
  "Harvest":      { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-800 dark:text-purple-300", dot: "bg-purple-500"  },
  "Post-Harvest": { bg: "bg-gray-100 dark:bg-slate-700",       text: "text-gray-700 dark:text-slate-300",    dot: "bg-gray-400"    },
};

// Timeline template per crop — week offsets from sowing date
// Each entry: { week, activity, task, type }
const BASE_TIMELINE = [
  { week: -2, activity: "Land Prep",  task: "Plow and harrow field. Apply FYM/compost @ 5–10 t/ha. Level the field." },
  { week: -1, activity: "Land Prep",  task: "Final tillage. Apply basal fertilizer (DAP/SSP). Prepare seedbed." },
  { week: 0,  activity: "Sowing",     task: "Sow seeds at recommended depth and spacing. Apply pre-emergence herbicide if needed." },
  { week: 2,  activity: "Irrigation", task: "First irrigation if no rain. Ensure uniform germination." },
  { week: 3,  activity: "Weeding",    task: "First weeding. Remove weeds manually or apply post-emergence herbicide." },
  { week: 4,  activity: "Fertilizer", task: "First top-dressing: apply Urea @ 50% of recommended N dose." },
  { week: 5,  activity: "Pest Control",task: "Scout for pests and diseases. Apply neem oil or recommended pesticide if threshold exceeded." },
  { week: 6,  activity: "Irrigation", task: "Second irrigation. Monitor soil moisture." },
  { week: 7,  activity: "Weeding",    task: "Second weeding if needed." },
  { week: 8,  activity: "Fertilizer", task: "Second top-dressing: remaining N dose + MOP if K deficient." },
  { week: 9,  activity: "Pest Control",task: "Check for fungal diseases. Apply fungicide (Mancozeb) if symptoms appear." },
  { week: 10, activity: "Irrigation", task: "Critical irrigation at flowering/grain filling stage." },
  { week: 11, activity: "Pest Control",task: "Final pest scouting. Avoid spraying within 2 weeks of harvest." },
];

// Crop-specific overrides and additions
const CROP_OVERRIDES = {
  rice: [
    { week: 0,  activity: "Sowing",     task: "Prepare nursery beds. Soak seeds 24h, broadcast sprouted seeds." },
    { week: 3,  activity: "Sowing",     task: "Transplant seedlings (25–30 days old) to puddled main field at 20×15 cm spacing." },
    { week: 4,  activity: "Irrigation", task: "Maintain 5 cm standing water in field." },
    { week: 6,  activity: "Fertilizer", task: "Apply Urea @ 40 kg/ha as top-dressing at tillering stage." },
    { week: 10, activity: "Fertilizer", task: "Apply Urea @ 40 kg/ha at panicle initiation stage." },
    { week: 14, activity: "Harvest",    task: "Harvest when 80% grains are golden yellow. Drain field 10 days before harvest." },
    { week: 15, activity: "Post-Harvest",task: "Thresh, dry to 14% moisture, store in clean bags." },
  ],
  wheat: [
    { week: 0,  activity: "Sowing",     task: "Drill seeds at 4–5 cm depth, 20–22 cm row spacing. Seed rate: 100–125 kg/ha." },
    { week: 3,  activity: "Irrigation", task: "Crown root initiation irrigation — most critical stage." },
    { week: 6,  activity: "Irrigation", task: "Tillering stage irrigation." },
    { week: 8,  activity: "Fertilizer", task: "Top-dress Urea @ 65 kg/ha at tillering." },
    { week: 10, activity: "Irrigation", task: "Jointing stage irrigation." },
    { week: 12, activity: "Irrigation", task: "Flowering stage irrigation." },
    { week: 14, activity: "Irrigation", task: "Grain filling irrigation." },
    { week: 16, activity: "Harvest",    task: "Harvest when grain moisture is 18–20%. Use combine harvester." },
    { week: 17, activity: "Post-Harvest",task: "Thresh, clean, dry to 12% moisture. Store in cool dry place." },
  ],
  maize: [
    { week: 0,  activity: "Sowing",     task: "Sow 2–3 seeds/hill at 5 cm depth. Row spacing 60–75 cm, plant spacing 20–25 cm." },
    { week: 2,  activity: "Weeding",    task: "Thin to 1 plant/hill. Apply pre-emergence herbicide." },
    { week: 4,  activity: "Fertilizer", task: "Apply Urea @ 50 kg/ha at knee-high stage." },
    { week: 6,  activity: "Fertilizer", task: "Apply Urea @ 50 kg/ha at tasseling stage." },
    { week: 8,  activity: "Irrigation", task: "Critical irrigation at tasseling and silking stage." },
    { week: 12, activity: "Harvest",    task: "Harvest when husks are brown and kernels dented. Dry cobs before shelling." },
  ],
  chickpea: [
    { week: 0,  activity: "Sowing",     task: "Treat seeds with Rhizobium. Drill at 5–7 cm depth, 30–45 cm rows." },
    { week: 4,  activity: "Irrigation", task: "Pre-flowering irrigation if soil is dry." },
    { week: 6,  activity: "Pest Control",task: "Scout for pod borer. Apply Imidacloprid if threshold exceeded." },
    { week: 8,  activity: "Irrigation", task: "Pod filling irrigation." },
    { week: 12, activity: "Harvest",    task: "Harvest when 80–90% pods are brown. Cut and sun-dry 2–3 days." },
  ],
  cotton: [
    { week: 0,  activity: "Sowing",     task: "Sow at 3–4 cm depth. Row spacing 90–120 cm, plant spacing 45–60 cm." },
    { week: 4,  activity: "Fertilizer", task: "Apply Urea @ 50 kg/ha at squaring stage." },
    { week: 6,  activity: "Pest Control",task: "Monitor for bollworm. Set pheromone traps. Spray if needed." },
    { week: 8,  activity: "Fertilizer", task: "Apply Urea @ 50 kg/ha at boll development." },
    { week: 10, activity: "Pest Control",task: "Second bollworm scouting. Apply Spinosad if threshold exceeded." },
    { week: 16, activity: "Harvest",    task: "First picking when bolls open. Pick every 2–3 weeks." },
  ],
};

/**
 * Generate a timeline for a crop starting from a given month.
 * @param {string} crop - lowercase crop name
 * @param {number} sowMonth - 1–12
 * @param {number} durationDays - growing duration
 * @returns {Array} sorted timeline events with dates
 */
export function generateTimeline(crop, sowMonth, durationDays = 90) {
  const cropKey = crop?.toLowerCase();
  const base = [...BASE_TIMELINE];
  const overrides = CROP_OVERRIDES[cropKey] || [];

  // Merge: overrides replace base entries at same week
  const overrideWeeks = new Set(overrides.map(o => o.week));
  const merged = [
    ...base.filter(b => !overrideWeeks.has(b.week)),
    ...overrides,
  ].sort((a, b) => a.week - b.week);

  // Add harvest if not already present
  const hasHarvest = merged.some(e => e.activity === "Harvest");
  if (!hasHarvest) {
    const harvestWeek = Math.round(durationDays / 7);
    merged.push({ week: harvestWeek, activity: "Harvest", task: `Harvest ${crop} when mature. Check moisture content before storage.` });
    merged.push({ week: harvestWeek + 1, activity: "Post-Harvest", task: "Thresh, clean, dry, and store in cool dry place." });
  }

  // Convert week offsets to actual dates
  const sowDate = new Date();
  sowDate.setMonth(sowMonth - 1, 1); // first of sow month
  if (sowDate < new Date()) sowDate.setFullYear(sowDate.getFullYear() + 1);

  return merged.map(e => {
    const date = new Date(sowDate);
    date.setDate(date.getDate() + e.week * 7);
    return {
      ...e,
      date: date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      dateObj: date,
      isPast: date < new Date(),
      isUpcoming: date >= new Date() && date <= new Date(Date.now() + 14 * 86400000),
    };
  });
}
