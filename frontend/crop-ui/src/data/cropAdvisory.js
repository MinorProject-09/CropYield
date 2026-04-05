/**
 * cropAdvisory.js
 * Pest/disease alerts, fertilizer recommendations, and crop rotation advice.
 * All data sourced from ICAR, NIPHM, and state agricultural university guidelines.
 */

// ── Pest & Disease Alerts ─────────────────────────────────────────────────────
export const PEST_ALERTS = {
  rice: [
    { name: "Brown Plant Hopper", type: "pest",    severity: "high",   months: [7,8,9],   sign: "Yellowing and drying of plants in patches", action: "Spray Imidacloprid 17.8 SL @ 0.5 ml/L water. Avoid excess nitrogen." },
    { name: "Blast Disease",      type: "disease", severity: "high",   months: [7,8,9,10],sign: "Diamond-shaped lesions on leaves with grey centre", action: "Spray Tricyclazole 75 WP @ 0.6 g/L. Use resistant varieties." },
    { name: "Stem Borer",         type: "pest",    severity: "medium", months: [6,7,8],   sign: "Dead heart in vegetative stage, white ear in reproductive stage", action: "Apply Carbofuran 3G @ 25 kg/ha at 25 days after transplanting." },
  ],
  wheat: [
    { name: "Yellow Rust",        type: "disease", severity: "high",   months: [1,2,3],   sign: "Yellow stripes of pustules on leaves", action: "Spray Propiconazole 25 EC @ 1 ml/L. Sow resistant varieties like HD-2967." },
    { name: "Aphids",             type: "pest",    severity: "medium", months: [12,1,2],  sign: "Clusters of small insects on leaves and ears", action: "Spray Dimethoate 30 EC @ 1.5 ml/L when infestation exceeds 10 aphids/tiller." },
    { name: "Loose Smut",         type: "disease", severity: "medium", months: [2,3],     sign: "Ears replaced by black powdery mass", action: "Treat seeds with Carboxin 37.5% + Thiram 37.5% @ 2 g/kg seed." },
  ],
  maize: [
    { name: "Fall Armyworm",      type: "pest",    severity: "high",   months: [6,7,8,9], sign: "Ragged feeding damage on leaves, frass in whorl", action: "Spray Emamectin Benzoate 5 SG @ 0.4 g/L into the whorl. Early morning application." },
    { name: "Downy Mildew",       type: "disease", severity: "high",   months: [6,7,8],   sign: "White downy growth on lower leaf surface, stunted plants", action: "Seed treatment with Metalaxyl 35 WS @ 6 g/kg. Spray Metalaxyl 25 WP @ 2 g/L." },
    { name: "Stem Borer",         type: "pest",    severity: "medium", months: [7,8,9],   sign: "Dead heart, shot holes on leaves", action: "Apply Carbofuran 3G @ 20 kg/ha in whorl at 15 days after germination." },
  ],
  cotton: [
    { name: "Bollworm",           type: "pest",    severity: "high",   months: [8,9,10,11],sign: "Holes in bolls, damaged squares and flowers", action: "Spray Spinosad 45 SC @ 0.3 ml/L. Monitor with pheromone traps." },
    { name: "Whitefly",           type: "pest",    severity: "high",   months: [8,9,10],  sign: "Yellowing leaves, sticky honeydew, sooty mould", action: "Spray Spiromesifen 22.9 SC @ 1 ml/L. Avoid excess nitrogen." },
    { name: "Leaf Curl Virus",    type: "disease", severity: "high",   months: [8,9,10],  sign: "Upward curling of leaves, dark green veins, stunted growth", action: "Remove and destroy infected plants. Control whitefly vector. Use resistant varieties." },
  ],
  chickpea: [
    { name: "Pod Borer",          type: "pest",    severity: "high",   months: [1,2,3],   sign: "Circular holes in pods, caterpillars inside", action: "Spray Indoxacarb 14.5 SC @ 1 ml/L at 50% flowering. Use pheromone traps." },
    { name: "Wilt",               type: "disease", severity: "high",   months: [11,12,1], sign: "Sudden wilting of plants, dark discolouration of stem base", action: "Seed treatment with Trichoderma viride @ 4 g/kg. Use resistant varieties like JG-11." },
    { name: "Ascochyta Blight",   type: "disease", severity: "medium", months: [12,1,2],  sign: "Brown lesions on leaves, stems and pods", action: "Spray Mancozeb 75 WP @ 2 g/L at first sign of disease." },
  ],
  "mung bean": [
    { name: "Yellow Mosaic Virus",type: "disease", severity: "high",   months: [6,7,8],   sign: "Yellow mosaic pattern on leaves, stunted growth", action: "Control whitefly vector with Imidacloprid. Remove infected plants immediately." },
    { name: "Thrips",             type: "pest",    severity: "medium", months: [6,7,8,9], sign: "Silvery streaks on leaves, curling of leaves", action: "Spray Spinosad 45 SC @ 0.3 ml/L. Avoid water stress." },
  ],
  "black gram": [
    { name: "Yellow Mosaic Virus",type: "disease", severity: "high",   months: [6,7,8],   sign: "Yellow mosaic pattern on leaves", action: "Use resistant varieties. Control whitefly with Imidacloprid 17.8 SL @ 0.5 ml/L." },
    { name: "Leaf Crinkle",       type: "disease", severity: "medium", months: [7,8,9],   sign: "Crinkling and distortion of leaves", action: "Control thrips vector. Remove infected plants." },
  ],
  banana: [
    { name: "Panama Wilt",        type: "disease", severity: "high",   months: [1,2,3,4,5,6,7,8,9,10,11,12], sign: "Yellowing of lower leaves, brown discolouration inside stem", action: "Use disease-free tissue culture plants. Drench soil with Carbendazim 50 WP @ 1 g/L." },
    { name: "Sigatoka Leaf Spot", type: "disease", severity: "medium", months: [7,8,9,10],sign: "Yellow streaks turning brown on leaves", action: "Spray Propiconazole 25 EC @ 1 ml/L. Remove infected leaves." },
    { name: "Banana Weevil",      type: "pest",    severity: "medium", months: [6,7,8,9], sign: "Tunnelling in corm, yellowing and wilting", action: "Apply Chlorpyrifos 20 EC @ 5 ml/L around the base. Use clean planting material." },
  ],
  tomato: [
    { name: "Early Blight",       type: "disease", severity: "high",   months: [1,2,3,10,11,12], sign: "Dark brown spots with concentric rings on older leaves", action: "Spray Mancozeb 75 WP @ 2 g/L. Avoid overhead irrigation." },
    { name: "Fruit Borer",        type: "pest",    severity: "high",   months: [9,10,11,12,1,2],  sign: "Circular holes in fruits, caterpillar inside", action: "Spray Spinosad 45 SC @ 0.3 ml/L. Use pheromone traps." },
  ],
  mango: [
    { name: "Mango Hopper",       type: "pest",    severity: "high",   months: [1,2,3,4], sign: "Nymphs and adults sucking sap from inflorescence", action: "Spray Imidacloprid 17.8 SL @ 0.5 ml/L at bud burst stage." },
    { name: "Powdery Mildew",     type: "disease", severity: "high",   months: [1,2,3],   sign: "White powdery coating on inflorescence and young fruits", action: "Spray Wettable Sulphur 80 WP @ 2 g/L at first sign." },
    { name: "Anthracnose",        type: "disease", severity: "medium", months: [3,4,5,6], sign: "Dark spots on fruits, premature fruit drop", action: "Spray Carbendazim 50 WP @ 1 g/L before and after flowering." },
  ],
  grapes: [
    { name: "Downy Mildew",       type: "disease", severity: "high",   months: [7,8,9],   sign: "Yellow spots on upper leaf surface, white downy growth below", action: "Spray Metalaxyl + Mancozeb @ 2.5 g/L. Avoid overhead irrigation." },
    { name: "Powdery Mildew",     type: "disease", severity: "high",   months: [2,3,4,5], sign: "White powdery coating on leaves and berries", action: "Spray Wettable Sulphur 80 WP @ 3 g/L. Ensure good air circulation." },
    { name: "Thrips",             type: "pest",    severity: "medium", months: [3,4,5],   sign: "Silvery scarring on berries, distorted growth", action: "Spray Spinosad 45 SC @ 0.3 ml/L at berry set." },
  ],
};

// ── Fertilizer Recommendations based on soil deficiency ──────────────────────
// Thresholds: Low N < 280 kg/ha, Low P < 22 kg/ha, Low K < 108 kg/ha
export function getFertilizerAdvice(crop, N, P, K, ph) {
  const advice = [];

  // pH correction
  if (ph < 5.5) {
    advice.push({
      type: "pH",
      issue: "Soil is too acidic",
      fix: "Apply agricultural lime (CaCO₃) @ 2–4 tonnes/ha. Retest after 3 months.",
      urgency: "high",
      icon: "🧪",
    });
  } else if (ph > 8.0) {
    advice.push({
      type: "pH",
      issue: "Soil is too alkaline",
      fix: "Apply gypsum (CaSO₄) @ 2–3 tonnes/ha or elemental sulphur @ 500 kg/ha.",
      urgency: "high",
      icon: "🧪",
    });
  }

  // Nitrogen
  if (N < 100) {
    advice.push({
      type: "N",
      issue: "Low Nitrogen — expect pale yellow leaves and stunted growth",
      fix: "Apply Urea (46% N) @ 100–150 kg/ha in split doses. First dose at sowing, second at 30 days.",
      urgency: N < 50 ? "high" : "medium",
      icon: "🌿",
    });
  } else if (N > 250) {
    advice.push({
      type: "N",
      issue: "Excess Nitrogen — risk of lodging, pest attraction, delayed maturity",
      fix: "Reduce nitrogen application. Avoid urea top-dressing. Let soil balance naturally.",
      urgency: "medium",
      icon: "⚠️",
    });
  }

  // Phosphorus
  if (P < 20) {
    advice.push({
      type: "P",
      issue: "Low Phosphorus — poor root development and delayed flowering",
      fix: "Apply Single Super Phosphate (SSP) @ 250–375 kg/ha or DAP @ 100–150 kg/ha at sowing.",
      urgency: P < 10 ? "high" : "medium",
      icon: "🌱",
    });
  }

  // Potassium
  if (K < 40) {
    advice.push({
      type: "K",
      issue: "Low Potassium — weak stems, poor grain filling, disease susceptibility",
      fix: "Apply Muriate of Potash (MOP) @ 50–100 kg/ha or SOP @ 60–120 kg/ha.",
      urgency: K < 20 ? "high" : "medium",
      icon: "💪",
    });
  }

  // Crop-specific advice
  const cropSpecific = CROP_FERTILIZER[crop?.toLowerCase()];
  if (cropSpecific) {
    advice.push({
      type: "crop",
      issue: `Recommended fertilizer schedule for ${crop}`,
      fix: cropSpecific,
      urgency: "info",
      icon: "📋",
    });
  }

  return advice;
}

const CROP_FERTILIZER = {
  rice:          "Apply NPK 120:60:60 kg/ha. Basal: full P+K + 1/3 N. Top-dress 1/3 N at tillering, 1/3 N at panicle initiation.",
  wheat:         "Apply NPK 120:60:40 kg/ha. Basal: full P+K + 1/2 N. Top-dress 1/2 N at first irrigation (21 days).",
  maize:         "Apply NPK 120:60:40 kg/ha. Basal: full P+K + 1/3 N. Top-dress 1/3 N at knee-high, 1/3 N at tasseling.",
  chickpea:      "Apply NPK 20:60:40 kg/ha. Rhizobium seed treatment reduces N need. Full dose at sowing.",
  "mung bean":   "Apply NPK 20:40:30 kg/ha. Rhizobium seed treatment. Full dose at sowing.",
  "black gram":  "Apply NPK 20:40:30 kg/ha. Rhizobium seed treatment. Full dose at sowing.",
  cotton:        "Apply NPK 120:60:60 kg/ha. Basal: full P+K + 1/3 N. Top-dress at squaring and boll formation.",
  banana:        "Apply NPK 200:60:300 g/plant/year in 4 splits. High K requirement for fruit quality.",
  mango:         "Apply NPK 1000:500:1000 g/tree/year for bearing trees. Apply in 2 splits: pre-flowering and post-harvest.",
  grapes:        "Apply NPK 60:40:80 kg/ha. Apply before pruning and at berry development stage.",
  tomato:        "Apply NPK 120:60:60 kg/ha. Basal: full P+K + 1/3 N. Top-dress at flowering and fruiting.",
};

// ── Crop Rotation Recommendations ────────────────────────────────────────────
export const CROP_ROTATION = {
  rice:          { next: ["wheat", "chickpea", "lentil"],       reason: "Rice depletes N; legumes restore it. Wheat uses residual moisture well." },
  wheat:         { next: ["mung bean", "black gram", "maize"],  reason: "Wheat leaves good tilth; short-duration legumes fix nitrogen before next Kharif." },
  maize:         { next: ["chickpea", "wheat", "mustard"],      reason: "Maize is a heavy feeder; follow with legumes or low-demand Rabi crops." },
  chickpea:      { next: ["rice", "maize", "cotton"],           reason: "Chickpea fixes nitrogen; follow with high-N-demand crops." },
  "mung bean":   { next: ["wheat", "rice", "maize"],            reason: "Short-duration legume; excellent green manure. Follow with cereals." },
  "black gram":  { next: ["wheat", "rice", "maize"],            reason: "Nitrogen-fixing legume. Improves soil structure for cereals." },
  cotton:        { next: ["wheat", "chickpea", "sorghum"],      reason: "Cotton exhausts soil; follow with less-demanding Rabi crops." },
  "pigeon peas": { next: ["rice", "maize", "sorghum"],          reason: "Deep-rooted legume improves soil structure. Follow with shallow-rooted cereals." },
  banana:        { next: ["legumes", "vegetables"],             reason: "After banana, soil is rich in organic matter. Ideal for short-duration crops." },
  mango:         { next: ["intercrop with legumes"],            reason: "Intercrop with cowpea or groundnut in young orchards to utilise space and fix N." },
};

// ── Soil Health Score ─────────────────────────────────────────────────────────
export function getSoilHealthScore(N, P, K, ph) {
  let score = 100;
  const issues = [];

  // pH scoring (ideal 6.0–7.5)
  if (ph < 5.5 || ph > 8.5)      { score -= 25; issues.push("Critical pH"); }
  else if (ph < 6.0 || ph > 8.0) { score -= 15; issues.push("Suboptimal pH"); }
  else if (ph < 6.5 || ph > 7.5) { score -= 5;  }

  // N scoring (ideal 100–200 kg/ha)
  if (N < 50)       { score -= 20; issues.push("Very low N"); }
  else if (N < 100) { score -= 10; issues.push("Low N"); }
  else if (N > 280) { score -= 10; issues.push("Excess N"); }

  // P scoring (ideal 20–60 kg/ha)
  if (P < 10)      { score -= 15; issues.push("Very low P"); }
  else if (P < 20) { score -= 8;  issues.push("Low P"); }

  // K scoring (ideal 40–120 kg/ha)
  if (K < 20)      { score -= 15; issues.push("Very low K"); }
  else if (K < 40) { score -= 8;  issues.push("Low K"); }

  const clamped = Math.max(0, Math.min(100, score));
  const grade = clamped >= 80 ? "Good" : clamped >= 60 ? "Fair" : clamped >= 40 ? "Poor" : "Critical";
  const color = clamped >= 80 ? "green" : clamped >= 60 ? "amber" : "red";

  return { score: clamped, grade, color, issues };
}
