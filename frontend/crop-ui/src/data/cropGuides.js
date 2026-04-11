// cropGuides.js — Complete farming guides for all 22 crops
// Sources: ICAR, NIPHM, KVK guidelines, Agmarknet, eNAM

const L = {
  seeds: {
    bh: { name: "BigHaat",      url: "https://www.bighaat.com/collections/seeds" },
    dh: { name: "DeHaat",       url: "https://www.dehaat.com/seeds" },
    as: { name: "AgroStar",     url: "https://www.agrostar.in/seeds" },
    if: { name: "IFFCO eBazar", url: "https://www.iffcoebazar.in" },
  },
  fertilizer: {
    bh: { name: "BigHaat",      url: "https://www.bighaat.com/collections/fertilizers" },
    as: { name: "AgroStar",     url: "https://www.agrostar.in/fertilizers" },
    if: { name: "IFFCO eBazar", url: "https://www.iffcoebazar.in/fertilizers" },
    km: { name: "KrishiMart",   url: "https://www.krishimart.com/fertilizers" },
  },
  pesticide: {
    bh: { name: "BigHaat",    url: "https://www.bighaat.com/collections/pesticides" },
    as: { name: "AgroStar",   url: "https://www.agrostar.in/pesticides" },
    km: { name: "KrishiMart", url: "https://www.krishimart.com/pesticides" },
  },
  market: {
    en: { name: "eNAM (Govt. Mandi)", url: "https://www.enam.gov.in" },
    ag: { name: "Agmarknet Prices",   url: "https://agmarknet.gov.in" },
  },
  schemes: {
    fb: { name: "PM Fasal Bima Yojana", url: "https://pmfby.gov.in" },
    kc: { name: "Kisan Credit Card",    url: "https://www.nabard.org/content1.aspx?id=572" },
    sh: { name: "Soil Health Card",     url: "https://soilhealth.dac.gov.in" },
  },
};

const S = (cat, keys) => keys.map((k) => L[cat][k]).filter(Boolean);
const MKT = [L.market.en, L.market.ag];
const SCH = [
  { name: "PM Fasal Bima Yojana", desc: "Crop insurance at subsidised premium.", link: L.schemes.fb },
  { name: "Kisan Credit Card",    desc: "Short-term credit at 4% interest for inputs.", link: L.schemes.kc },
  { name: "Soil Health Card",     desc: "Free soil testing and nutrient recommendations.", link: L.schemes.sh },
];

export const CROP_GUIDES = {

  // ── RICE ──────────────────────────────────────────────────────────────────
  rice: {
    name: "Rice", emoji: "🌾",
    tagline: "India's most important staple — grown in flooded fields across Kharif season.",
    overview: "Rice (Oryza sativa) is grown on 44 million hectares in India. It thrives in warm, humid conditions with abundant water. Grown in Kharif (Jun–Nov), Rabi (Nov–Apr in some states), and Boro (winter rice in eastern India).",
    soilPrep: { title: "Land Preparation", steps: [
      "Plough 2–3 times to 15–20 cm depth using disc plough or rotavator.",
      "Flood and puddle the soil to destroy weeds and create a water-retaining layer.",
      "Level the field with a laser leveller for uniform water distribution.",
      "Apply 10–15 t/ha well-decomposed FYM 2–3 weeks before transplanting.",
      "Ideal soil: Heavy clay or clay-loam. pH 5.5–7.0.",
    ]},
    varieties: [
      { name: "Swarna (MTU 7029)", type: "High Yield", duration: "145–150 days", yield: "5–6 t/ha", note: "Most popular in eastern India" },
      { name: "Pusa Basmati 1121", type: "Basmati",    duration: "140–145 days", yield: "4–5 t/ha", note: "Premium export quality, long grain" },
      { name: "IR-64",             type: "High Yield", duration: "110–115 days", yield: "5–6 t/ha", note: "Short duration, drought tolerant" },
      { name: "Samba Mahsuri",     type: "Fine Grain", duration: "145–150 days", yield: "4–5 t/ha", note: "Popular in AP and Tamil Nadu" },
    ],
    sowing: { title: "Nursery & Transplanting", steps: [
      "1000 sq m nursery is sufficient for 1 hectare of main field.",
      "Seed rate: 20–25 kg/ha for transplanted; 80–100 kg/ha for direct seeded.",
      "Soak seeds 24 hours, incubate 24–48 hours until germination.",
      "Transplant 25–30 day old seedlings at 2–3 per hill, spacing 20×15 cm.",
      "Best transplanting time: June–July for Kharif season.",
    ]},
    irrigation: { title: "Water Management", steps: [
      "Maintain 2–5 cm standing water from transplanting to panicle initiation.",
      "Drain field for 7–10 days at tillering (mid-season drainage) to promote roots.",
      "Maintain 5 cm water from panicle initiation to grain filling.",
      "Stop irrigation 10–15 days before harvest.",
      "AWD (Alternate Wetting and Drying) saves 30% water without yield loss.",
    ]},
    fertilizer: { title: "Fertilizer Schedule", schedule: [
      { time: "Basal (at transplanting)", dose: "Full P 60 kg/ha (SSP) + Full K 60 kg/ha (MOP) + 1/3 N 40 kg/ha (Urea)" },
      { time: "21–25 DAT (tillering)",    dose: "1/3 N — 40 kg/ha Urea" },
      { time: "45–50 DAT (panicle init)", dose: "1/3 N — 40 kg/ha Urea" },
      { time: "Zinc deficiency",          dose: "Zinc Sulphate 25 kg/ha basal or 0.5% foliar spray" },
    ], links: S("fertilizer", ["bh", "if", "as"]) },
    pestManagement: [
      { pest: "Brown Plant Hopper", type: "Pest",    sign: "Yellowing in patches, hopper burn",       action: "Spray Imidacloprid 17.8 SL @ 0.5 ml/L. Drain field 3 days." },
      { pest: "Blast Disease",      type: "Disease", sign: "Diamond-shaped grey lesions on leaves",   action: "Spray Tricyclazole 75 WP @ 0.6 g/L. Use resistant varieties." },
      { pest: "Stem Borer",         type: "Pest",    sign: "Dead heart / white ear",                  action: "Carbofuran 3G @ 25 kg/ha at 25 DAT." },
      { pest: "Sheath Blight",      type: "Disease", sign: "Oval lesions on leaf sheath",             action: "Spray Hexaconazole 5 EC @ 2 ml/L." },
    ],
    harvesting: { title: "Harvesting & Threshing", steps: [
      "Harvest when 80–85% grains turn golden yellow (~30 days after flowering).",
      "Moisture at harvest: 20–25%. Dry to 14% for safe storage.",
      "Use combine harvester for large fields; sickle for small farms.",
      "Expected yield: 4–6 t/ha (40–60 q/ha) under good management.",
    ]},
    postHarvest: { title: "Post-Harvest & Storage", steps: [
      "Dry paddy to 14% moisture before storage to prevent fungal growth.",
      "Store in gunny bags or hermetic bags in a cool, dry place.",
      "Use PUSA bins or metal silos for long-term storage.",
      "Milling recovery: 65–68% for raw rice, 60–63% for parboiled rice.",
    ]},
    selling: { title: "Where to Sell", options: [
      "Government procurement at MSP through FCI/state agencies — register on eNAM.",
      "Local APMC mandi — check daily prices on Agmarknet before selling.",
      "Rice mills — negotiate directly for better price.",
      "Export: Basmati has strong export demand. Contact APEDA for registration.",
    ], links: MKT },
    schemes: SCH,
    seedLinks: S("seeds", ["bh", "dh", "as", "if"]),
    pesticideLinks: S("pesticide", ["bh", "as", "km"]),
    tips: [
      "Use certified seeds from government seed corporations for guaranteed germination.",
      "Transplant in the evening to reduce transplanting shock.",
      "AWD irrigation saves 30% water — flood, let dry to 15 cm below surface, re-flood.",
      "Join a Farmer Producer Organisation (FPO) for better input prices and market access.",
    ],
    readAloudText: "Rice is India's most important food crop. Prepare the field by ploughing and puddling. Sow seeds in nursery for 25 to 30 days, then transplant at 20 by 15 centimetre spacing. Maintain 2 to 5 centimetres of standing water throughout the season. Apply nitrogen in three splits: at transplanting, at tillering, and at panicle initiation. Watch for brown plant hopper and blast disease. Harvest when 80 percent grains turn golden. Dry to 14 percent moisture before storage. Sell at government mandi at MSP or directly to rice mills.",
  },

  // ── WHEAT ─────────────────────────────────────────────────────────────────
  wheat: {
    name: "Wheat", emoji: "🌿",
    tagline: "India's second most important cereal — backbone of Rabi farming.",
    overview: "Wheat (Triticum aestivum) is grown across 30 million hectares in India, primarily in Punjab, Haryana, UP, and MP. It is a cool-season Rabi crop sown in October–November and harvested in March–April.",
    soilPrep: { title: "Land Preparation", steps: [
      "Deep plough once after Kharif harvest to break hardpan.",
      "Give 2–3 cross harrowings to achieve fine tilth.",
      "Apply 10 t/ha FYM or compost 3–4 weeks before sowing.",
      "Ideal soil: Well-drained loamy or clay-loam. pH 6.0–7.5.",
    ]},
    varieties: [
      { name: "HD-2967 (Arjun)", type: "High Yield", duration: "120–125 days", yield: "5–6 t/ha", note: "Most popular in north India, rust resistant" },
      { name: "PBW-343",         type: "High Yield", duration: "155–160 days", yield: "5–6 t/ha", note: "Punjab, Haryana — excellent chapati quality" },
      { name: "K-307",           type: "High Yield", duration: "120–125 days", yield: "4–5 t/ha", note: "UP, Bihar — good for late sowing" },
    ],
    sowing: { title: "Sowing", steps: [
      "Seed rate: 100–125 kg/ha timely; 125–150 kg/ha late sowing.",
      "Treat seeds with Carboxin 37.5% + Thiram 37.5% @ 2 g/kg.",
      "Sow in rows 20–22.5 cm apart at 5–6 cm depth using seed drill.",
      "Optimal sowing: 1–15 November. Yield drops 1–1.5% per day of delay after 15 Dec.",
    ]},
    irrigation: { title: "Irrigation Schedule", steps: [
      "1st: Crown root initiation (20–25 DAS) — most critical.",
      "2nd: Tillering (40–45 DAS).",
      "3rd: Jointing (60–65 DAS).",
      "4th: Flowering (80–85 DAS).",
      "5th: Grain filling (100–105 DAS).",
      "Total: 5–6 irrigations of 6–7 cm each.",
    ]},
    fertilizer: { title: "Fertilizer Schedule", schedule: [
      { time: "Basal (at sowing)",        dose: "Full P 60 kg/ha (DAP) + Full K 40 kg/ha (MOP) + 1/2 N 60 kg/ha (Urea)" },
      { time: "1st irrigation (20–25 DAS)", dose: "1/2 N — 60 kg/ha Urea" },
    ], links: S("fertilizer", ["bh", "if", "as"]) },
    pestManagement: [
      { pest: "Yellow Rust",  type: "Disease", sign: "Yellow stripes of pustules on leaves",    action: "Spray Propiconazole 25 EC @ 1 ml/L at first sign." },
      { pest: "Aphids",       type: "Pest",    sign: "Clusters on leaves and ears, honeydew",   action: "Spray Dimethoate 30 EC @ 1.5 ml/L when >10 aphids/tiller." },
      { pest: "Loose Smut",   type: "Disease", sign: "Ears replaced by black powder",           action: "Seed treatment with Carboxin + Thiram @ 2 g/kg." },
    ],
    harvesting: { title: "Harvesting", steps: [
      "Harvest when grains are hard and straw turns golden yellow (March–April).",
      "Moisture at harvest: 20–25%. Dry to 12% for storage.",
      "Use combine harvester for large fields; sickle for small farms.",
      "Expected yield: 4–6 t/ha (40–60 q/ha).",
    ]},
    postHarvest: { title: "Post-Harvest", steps: [
      "Clean grain to remove chaff and broken grains.",
      "Dry to 12% moisture before storage.",
      "Store in clean, dry gunny bags. Fumigate with Aluminium Phosphide tablets.",
      "Wheat can be stored for 2–3 years under proper conditions.",
    ]},
    selling: { title: "Where to Sell", options: [
      "Government procurement at MSP through FCI — register on eNAM portal.",
      "Local flour mills — often pay above MSP for good quality wheat.",
      "APMC mandi — check Agmarknet for daily prices.",
    ], links: MKT },
    schemes: SCH,
    seedLinks: S("seeds", ["bh", "dh", "if"]),
    pesticideLinks: S("pesticide", ["bh", "as"]),
    tips: [
      "Timely sowing (1–15 November) gives 15–20% higher yield than late sowing.",
      "Use seed drill for uniform sowing depth and spacing.",
      "Apply first irrigation exactly at crown root initiation — missing this reduces yield by 20%.",
    ],
    readAloudText: "Wheat is a Rabi crop sown in October to November. Prepare fine tilth by ploughing and harrowing. Treat seeds with fungicide before sowing. Sow in rows 20 centimetres apart at 5 centimetre depth. Apply nitrogen in two splits: half at sowing and half at first irrigation. Give 5 to 6 irrigations at critical stages. Watch for yellow rust and aphids. Harvest in March to April when grains are hard. Dry to 12 percent moisture and store in clean bags. Sell at government mandi at MSP or to flour mills.",
  },

  // ── MAIZE ─────────────────────────────────────────────────────────────────
  maize: {
    name: "Maize", emoji: "🌽",
    tagline: "Versatile cereal used for food, feed, starch, and ethanol.",
    overview: "Maize (Zea mays) is grown in Kharif, Rabi, and Zaid seasons across India. Major states: Karnataka, AP, Telangana, Bihar, UP, Rajasthan. Hybrid varieties dominate commercial cultivation.",
    soilPrep: { title: "Land Preparation", steps: [
      "Deep plough to 20–25 cm. Give 2–3 harrowings for fine tilth.",
      "Apply 10–15 t/ha FYM before final ploughing.",
      "Ideal soil: Well-drained sandy loam to clay loam. pH 5.8–7.0.",
      "Make ridges and furrows for better drainage in heavy rainfall areas.",
    ]},
    varieties: [
      { name: "DHM-117",  type: "Hybrid",     duration: "90–95 days",   yield: "8–10 t/ha",  note: "Most popular hybrid, high yield" },
      { name: "HQPM-1",   type: "QPM Hybrid", duration: "85–90 days",   yield: "6–8 t/ha",   note: "Quality Protein Maize — better nutrition" },
      { name: "NK-6240",  type: "Hybrid",     duration: "100–105 days", yield: "9–11 t/ha",  note: "Rabi season, high yield" },
    ],
    sowing: { title: "Sowing", steps: [
      "Seed rate: 20–25 kg/ha for hybrids; 15–20 kg/ha for composites.",
      "Treat seeds with Thiram 75 WS @ 2 g/kg + Imidacloprid 70 WS @ 5 g/kg.",
      "Sow in rows 60–75 cm apart, plant-to-plant 20–25 cm, depth 4–5 cm.",
      "Kharif sowing: June–July. Rabi sowing: October–November.",
    ]},
    irrigation: { title: "Irrigation", steps: [
      "Critical stages: knee-high (30 DAS), tasseling (55–60 DAS), silking (65–70 DAS), grain filling (80–85 DAS).",
      "Total: 4–6 irrigations. Each 5–6 cm.",
      "Drip irrigation saves 40% water and increases yield by 20%.",
    ]},
    fertilizer: { title: "Fertilizer Schedule", schedule: [
      { time: "Basal",                  dose: "Full P 60 kg/ha + Full K 40 kg/ha + 1/3 N 40 kg/ha" },
      { time: "Knee-high (30 DAS)",     dose: "1/3 N — 40 kg/ha Urea" },
      { time: "Tasseling (55–60 DAS)", dose: "1/3 N — 40 kg/ha Urea" },
    ], links: S("fertilizer", ["bh", "if", "as"]) },
    pestManagement: [
      { pest: "Fall Armyworm", type: "Pest",    sign: "Ragged feeding, frass in whorl",       action: "Spray Emamectin Benzoate 5 SG @ 0.4 g/L into whorl." },
      { pest: "Stem Borer",    type: "Pest",    sign: "Dead heart, shot holes on leaves",     action: "Carbofuran 3G @ 20 kg/ha in whorl at 15 DAS." },
      { pest: "Downy Mildew",  type: "Disease", sign: "White downy growth, stunted plants",   action: "Seed treatment with Metalaxyl 35 WS @ 6 g/kg." },
    ],
    harvesting: { title: "Harvesting", steps: [
      "Harvest when husks turn brown and dry, grains are hard (moisture 25–30%).",
      "Dry cobs in sun 5–7 days before shelling.",
      "Shell using maize sheller. Dry grain to 12–14% moisture.",
      "Expected yield: 6–10 t/ha for hybrids.",
    ]},
    postHarvest: { title: "Post-Harvest", steps: [
      "Dry shelled grain to 12% moisture before storage.",
      "Store in hermetic bags or metal bins to prevent weevil damage.",
      "Fumigate with Aluminium Phosphide @ 3 tablets per tonne.",
    ]},
    selling: { title: "Where to Sell", options: [
      "Poultry feed companies — largest buyers of maize in India.",
      "Starch and glucose manufacturers — contact NAFED or state agencies.",
      "APMC mandi — check Agmarknet for daily prices.",
    ], links: MKT },
    schemes: SCH,
    seedLinks: S("seeds", ["bh", "dh", "as"]),
    pesticideLinks: S("pesticide", ["bh", "as"]),
    tips: [
      "Use hybrid seeds for 30–40% higher yield than composites.",
      "Fall armyworm is the biggest threat — scout fields weekly from germination.",
      "Intercrop with soybean or cowpea to improve income and soil health.",
    ],
    readAloudText: "Maize is a versatile crop grown in Kharif and Rabi seasons. Prepare well-drained soil with fine tilth. Treat seeds with fungicide and insecticide before sowing. Sow in rows 60 to 75 centimetres apart. Apply nitrogen in three splits. Irrigate at knee-high, tasseling, silking, and grain filling stages. Watch for fall armyworm — spray Emamectin Benzoate into the whorl. Harvest when husks turn brown. Dry to 12 percent moisture. Sell to poultry feed companies or at APMC mandi.",
  },

  // ── CHICKPEA ──────────────────────────────────────────────────────────────
  chickpea: {
    name: "Chickpea", emoji: "🫘",
    tagline: "India's most important pulse — drought-tolerant and nitrogen-fixing.",
    overview: "Chickpea (Cicer arietinum) is the largest pulse crop in India, grown on 9–10 million hectares. Rabi crop sown October–November. Major states: MP, Rajasthan, Maharashtra, UP, Karnataka.",
    soilPrep: { title: "Land Preparation", steps: [
      "One deep ploughing followed by 2 harrowings for fine tilth.",
      "Apply 5 t/ha FYM. Avoid excess nitrogen.",
      "Ideal soil: Well-drained sandy loam to clay loam. pH 6.0–8.0.",
      "Chickpea is sensitive to waterlogging — ensure good drainage.",
    ]},
    varieties: [
      { name: "JG-11",    type: "Desi",   duration: "95–100 days",  yield: "2–2.5 t/ha", note: "Wilt resistant, most popular in MP" },
      { name: "Pusa-372", type: "Desi",   duration: "130–135 days", yield: "2–2.5 t/ha", note: "North India, good for late sowing" },
      { name: "KAK-2",    type: "Kabuli", duration: "120–125 days", yield: "2–2.5 t/ha", note: "Large seed, premium export price" },
    ],
    sowing: { title: "Sowing", steps: [
      "Seed rate: 60–80 kg/ha desi; 80–100 kg/ha kabuli.",
      "Treat seeds with Rhizobium culture (Ca-1) + Trichoderma viride @ 4 g/kg.",
      "Sow in rows 30–45 cm apart, seed-to-seed 10 cm, depth 8–10 cm.",
      "Optimal sowing: 15 October–15 November.",
    ]},
    irrigation: { title: "Irrigation", steps: [
      "Largely rainfed. 1–2 irrigations sufficient.",
      "1st: Pre-sowing if soil is dry.",
      "2nd: Pod filling stage (65–70 DAS) — most critical.",
      "Avoid irrigation at flowering — causes flower drop.",
    ]},
    fertilizer: { title: "Fertilizer", schedule: [
      { time: "Basal", dose: "P: 60 kg/ha (SSP) + K: 40 kg/ha (MOP) + N: 20 kg/ha starter dose only" },
      { time: "Rhizobium inoculation", dose: "Reduces N requirement by 80%. Always inoculate seeds." },
    ], links: S("fertilizer", ["bh", "if"]) },
    pestManagement: [
      { pest: "Pod Borer (Helicoverpa)", type: "Pest",    sign: "Circular holes in pods, caterpillar inside", action: "Spray Indoxacarb 14.5 SC @ 1 ml/L at 50% flowering." },
      { pest: "Wilt",                   type: "Disease", sign: "Sudden wilting, dark stem base",              action: "Use resistant varieties. Seed treatment with Trichoderma." },
      { pest: "Ascochyta Blight",       type: "Disease", sign: "Brown lesions on leaves and pods",           action: "Spray Mancozeb 75 WP @ 2 g/L." },
    ],
    harvesting: { title: "Harvesting", steps: [
      "Harvest when 70–80% pods turn brown (February–March).",
      "Cut plants at ground level, dry in sun 3–4 days.",
      "Thresh by beating or using thresher. Dry to 10–12% moisture.",
      "Expected yield: 1.5–2.5 t/ha (15–25 q/ha).",
    ]},
    postHarvest: { title: "Post-Harvest", steps: [
      "Dry to 10–12% moisture. Store in hermetic bags or metal bins.",
      "Fumigate with Aluminium Phosphide to prevent weevil damage.",
      "Can be stored 1–2 years under proper conditions.",
    ]},
    selling: { title: "Where to Sell", options: [
      "Dal mills — largest buyers. Negotiate directly for better price.",
      "Government procurement at MSP through NAFED.",
      "Export: Kabuli chickpea has strong demand in Middle East and Europe.",
    ], links: MKT },
    schemes: SCH,
    seedLinks: S("seeds", ["bh", "dh", "if"]),
    pesticideLinks: S("pesticide", ["bh", "as"]),
    tips: [
      "Always inoculate seeds with Rhizobium — saves 80% of nitrogen cost.",
      "Avoid irrigation at flowering — it causes flower drop and reduces yield.",
      "Intercrop with mustard or linseed for better income and pest management.",
    ],
    readAloudText: "Chickpea is a Rabi pulse crop sown in October to November. Prepare well-drained soil. Always treat seeds with Rhizobium culture to fix nitrogen naturally. Sow in rows 30 to 45 centimetres apart. Give only 1 to 2 irrigations — avoid irrigation at flowering. Watch for pod borer — spray Indoxacarb at 50 percent flowering. Harvest in February to March when pods turn brown. Dry to 12 percent moisture. Sell to dal mills or at government mandi at MSP.",
  },

  // ── KIDNEY BEANS ──────────────────────────────────────────────────────────
  "kidney beans": {
    name: "Kidney Beans", emoji: "🫘",
    tagline: "High-protein pulse with strong domestic and export demand.",
    overview: "Kidney beans (Phaseolus vulgaris) are grown as Kharif in hilly regions (J&K, HP, Uttarakhand) and Rabi in plains. Rich in protein (22–24%), they command premium prices.",
    soilPrep: { title: "Land Preparation", steps: [
      "Deep plough once, 2 harrowings for fine tilth.",
      "Apply 5–8 t/ha FYM. Ideal soil: well-drained loamy. pH 6.0–7.5.",
      "Avoid waterlogging — very sensitive to standing water.",
    ]},
    varieties: [
      { name: "Contender",  type: "Bush",      duration: "80–90 days",  yield: "1.5–2 t/ha",          note: "Popular in hills" },
      { name: "Arka Komal", type: "Bush",      duration: "45–50 days",  yield: "8–10 t/ha green pods", note: "Vegetable type" },
      { name: "PDR-14",     type: "Climbing",  duration: "90–100 days", yield: "2–2.5 t/ha",           note: "Dry grain type" },
    ],
    sowing: { title: "Sowing", steps: [
      "Seed rate: 80–100 kg/ha. Treat with Rhizobium + Trichoderma.",
      "Rows 30–45 cm apart, plant-to-plant 10 cm, depth 4–5 cm.",
      "Kharif: June–July. Rabi: October–November.",
    ]},
    irrigation: { title: "Irrigation", steps: [
      "2–3 irrigations. Critical: pre-flowering and pod filling.",
      "Avoid waterlogging at any stage.",
    ]},
    fertilizer: { title: "Fertilizer", schedule: [
      { time: "Basal", dose: "N: 30 kg/ha + P: 60 kg/ha + K: 40 kg/ha. Rhizobium inoculation reduces N need." },
    ], links: S("fertilizer", ["bh", "if"]) },
    pestManagement: [
      { pest: "Pod Borer",   type: "Pest",    sign: "Holes in pods",              action: "Spray Indoxacarb 14.5 SC @ 1 ml/L." },
      { pest: "Anthracnose", type: "Disease", sign: "Dark lesions on pods/leaves", action: "Spray Mancozeb 75 WP @ 2 g/L." },
      { pest: "Aphids",      type: "Pest",    sign: "Curling leaves, honeydew",    action: "Spray Dimethoate 30 EC @ 1.5 ml/L." },
    ],
    harvesting: { title: "Harvesting", steps: [
      "Harvest when pods turn yellow-brown and seeds are hard.",
      "Pull plants or cut at ground level. Dry 3–4 days.",
      "Thresh and dry to 12% moisture.",
      "Expected yield: 1.5–2.5 t/ha.",
    ]},
    postHarvest: { title: "Post-Harvest", steps: [
      "Dry to 12% moisture. Store in hermetic bags.",
      "Fumigate with Aluminium Phosphide to prevent weevil.",
    ]},
    selling: { title: "Where to Sell", options: [
      "Dal mills and grocery wholesalers.",
      "Export to Middle East and Europe — contact APEDA.",
      "APMC mandi — check Agmarknet for daily prices.",
    ], links: MKT },
    schemes: SCH,
    seedLinks: S("seeds", ["bh", "dh"]),
    pesticideLinks: S("pesticide", ["bh", "as"]),
    tips: [
      "Inoculate seeds with Rhizobium to fix nitrogen and reduce fertilizer cost.",
      "Avoid excess nitrogen — it promotes vegetative growth at the expense of pods.",
    ],
    readAloudText: "Kidney beans are a high-protein pulse crop. Prepare well-drained soil. Treat seeds with Rhizobium culture. Sow in rows 30 to 45 centimetres apart. Give 2 to 3 irrigations — avoid waterlogging. Watch for pod borer and anthracnose. Harvest when pods turn yellow-brown. Dry to 12 percent moisture. Sell to dal mills or export to Middle East.",
  },

  // ── PIGEON PEAS ───────────────────────────────────────────────────────────
  "pigeon peas": {
    name: "Pigeon Peas", emoji: "🌱",
    tagline: "Drought-resistant pulse — excellent for dry regions and intercropping.",
    overview: "Pigeon peas (Cajanus cajan) are grown on 4–5 million hectares in India. Major states: Maharashtra, Karnataka, MP, UP, Gujarat. Drought-resistant with deep taproot. Excellent for intercropping with cereals.",
    soilPrep: { title: "Land Preparation", steps: [
      "One deep ploughing, 2 harrowings for fine tilth.",
      "Apply 5 t/ha FYM. Ideal soil: well-drained loamy to sandy loam. pH 5.0–7.5.",
      "Avoid waterlogging — deep taproot makes it drought-tolerant but not flood-tolerant.",
    ]},
    varieties: [
      { name: "ICPL-87119 (Asha)", type: "Short Duration", duration: "120–130 days", yield: "1.5–2 t/ha", note: "Most popular, wilt resistant" },
      { name: "BDN-2",             type: "Medium Duration", duration: "150–160 days", yield: "1.5–2 t/ha", note: "Maharashtra" },
      { name: "Pusa-992",          type: "Short Duration", duration: "120–125 days", yield: "1.5–2 t/ha", note: "North India" },
    ],
    sowing: { title: "Sowing", steps: [
      "Seed rate: 15–20 kg/ha. Treat with Rhizobium + Trichoderma.",
      "Rows 60–75 cm apart, plant-to-plant 20–25 cm, depth 5–6 cm.",
      "Kharif sowing: June–July.",
      "Intercrop with sorghum, maize, or cotton at 1:2 or 1:3 ratio.",
    ]},
    irrigation: { title: "Irrigation", steps: [
      "Largely rainfed. 1–2 irrigations if available.",
      "Critical: flowering (60–70 DAS) and pod filling (90–100 DAS).",
    ]},
    fertilizer: { title: "Fertilizer", schedule: [
      { time: "Basal", dose: "P: 50 kg/ha + K: 30 kg/ha + N: 20 kg/ha starter dose. Rhizobium inoculation essential." },
    ], links: S("fertilizer", ["bh", "if"]) },
    pestManagement: [
      { pest: "Pod Borer (Helicoverpa)", type: "Pest",    sign: "Holes in pods, caterpillar inside", action: "Spray Indoxacarb 14.5 SC @ 1 ml/L at 50% flowering." },
      { pest: "Wilt",                   type: "Disease", sign: "Sudden wilting, dark stem base",     action: "Use resistant varieties. Seed treatment with Trichoderma." },
      { pest: "Sterility Mosaic",       type: "Disease", sign: "Mosaic pattern, no pods",            action: "Control mite vector. Remove infected plants." },
    ],
    harvesting: { title: "Harvesting", steps: [
      "Harvest when 75–80% pods turn brown (December–February).",
      "Cut plants, dry 3–4 days, thresh.",
      "Dry to 10–12% moisture.",
      "Expected yield: 1–2 t/ha (10–20 q/ha).",
    ]},
    postHarvest: { title: "Post-Harvest", steps: [
      "Dry to 10–12% moisture. Store in hermetic bags.",
      "Fumigate with Aluminium Phosphide.",
    ]},
    selling: { title: "Where to Sell", options: [
      "Dal mills — largest buyers of pigeon peas (tur dal).",
      "Government procurement at MSP through NAFED.",
      "APMC mandi — check Agmarknet for daily prices.",
    ], links: MKT },
    schemes: SCH,
    seedLinks: S("seeds", ["bh", "dh", "if"]),
    pesticideLinks: S("pesticide", ["bh", "as"]),
    tips: [
      "Intercropping pigeon peas with sorghum or maize increases total income by 30–40%.",
      "Always inoculate seeds with Rhizobium — saves fertilizer cost.",
      "Use pheromone traps for pod borer monitoring — 5 traps per hectare.",
    ],
    readAloudText: "Pigeon peas are a drought-resistant Kharif pulse crop. Prepare well-drained soil. Treat seeds with Rhizobium culture. Sow in rows 60 to 75 centimetres apart. Intercrop with sorghum or maize for better income. Give 1 to 2 irrigations at flowering and pod filling. Watch for pod borer — spray Indoxacarb at 50 percent flowering. Harvest in December to February when pods turn brown. Sell to dal mills or at government mandi at MSP.",
  },

  // ── MOTH BEANS ────────────────────────────────────────────────────────────
  "moth beans": {
    name: "Moth Beans", emoji: "🫘",
    tagline: "Extremely drought-tolerant — ideal for arid and semi-arid regions.",
    overview: "Moth beans (Vigna aconitifolia) are grown in Rajasthan, Gujarat, and MP. They are the most drought-tolerant pulse crop in India, suited for arid zones with low rainfall (200–400 mm).",
    soilPrep: { title: "Land Preparation", steps: [
      "Minimum tillage — one ploughing and one harrowing.",
      "Ideal soil: Sandy loam to loamy sand. pH 7.0–8.5.",
      "No FYM needed — grows well in poor soils.",
    ]},
    varieties: [
      { name: "RMO-40",  type: "Improved", duration: "65–70 days", yield: "0.8–1.2 t/ha", note: "Rajasthan — most popular" },
      { name: "Jadia",   type: "Local",    duration: "70–80 days", yield: "0.6–1.0 t/ha", note: "Traditional variety" },
    ],
    sowing: { title: "Sowing", steps: [
      "Seed rate: 8–10 kg/ha. Treat with Rhizobium.",
      "Broadcast or sow in rows 30–45 cm apart, depth 3–4 cm.",
      "Sowing: July–August after first monsoon rains.",
    ]},
    irrigation: { title: "Irrigation", steps: [
      "Rainfed crop. No irrigation needed if rainfall is 200–400 mm.",
      "1 irrigation at pod filling if available.",
    ]},
    fertilizer: { title: "Fertilizer", schedule: [
      { time: "Basal", dose: "P: 30 kg/ha + K: 20 kg/ha. No nitrogen needed with Rhizobium inoculation." },
    ], links: S("fertilizer", ["bh", "if"]) },
    pestManagement: [
      { pest: "Pod Borer",   type: "Pest",    sign: "Holes in pods",              action: "Spray Indoxacarb 14.5 SC @ 1 ml/L." },
      { pest: "Leaf Webber", type: "Pest",    sign: "Webbed leaves, defoliation", action: "Spray Chlorpyrifos 20 EC @ 2 ml/L." },
    ],
    harvesting: { title: "Harvesting", steps: [
      "Harvest when 70–80% pods turn brown (September–October).",
      "Pull plants, dry 2–3 days, thresh.",
      "Expected yield: 0.6–1.2 t/ha (6–12 q/ha).",
    ]},
    postHarvest: { title: "Post-Harvest", steps: [
      "Dry to 10–12% moisture. Store in hermetic bags.",
    ]},
    selling: { title: "Where to Sell", options: [
      "Dal mills in Rajasthan and Gujarat.",
      "APMC mandi — check Agmarknet for daily prices.",
      "Government procurement at MSP through NAFED.",
    ], links: MKT },
    schemes: SCH,
    seedLinks: S("seeds", ["bh", "dh"]),
    pesticideLinks: S("pesticide", ["bh", "as"]),
    tips: [
      "Moth beans grow well in poor, sandy soils where other crops fail.",
      "Inoculate seeds with Rhizobium to fix nitrogen.",
      "Intercrop with pearl millet for better income in arid regions.",
    ],
    readAloudText: "Moth beans are the most drought-tolerant pulse crop. They grow in sandy soils with low rainfall. Treat seeds with Rhizobium. Sow in July to August after first monsoon rains. No irrigation needed if rainfall is adequate. Watch for pod borer. Harvest in September to October when pods turn brown. Sell to dal mills or at government mandi.",
  },

  // ── MUNG BEAN ─────────────────────────────────────────────────────────────
  "mung bean": {
    name: "Mung Bean", emoji: "🫘",
    tagline: "Short-duration pulse — excellent for soil health and quick income.",
    overview: "Mung bean (Vigna radiata) is grown in Kharif and Zaid seasons across India. Short duration (60–90 days) makes it ideal for intercropping and crop rotation. Rich in protein and vitamins.",
    soilPrep: { title: "Land Preparation", steps: [
      "One deep ploughing, 2 harrowings for fine tilth.",
      "Apply 5 t/ha FYM. Ideal soil: well-drained loamy. pH 6.2–7.2.",
      "Avoid waterlogging.",
    ]},
    varieties: [
      { name: "Pusa Vishal",  type: "Improved", duration: "60–65 days", yield: "1.2–1.5 t/ha", note: "Most popular, high yield" },
      { name: "SML-668",      type: "Improved", duration: "60–65 days", yield: "1.2–1.5 t/ha", note: "Punjab, Haryana" },
      { name: "Pusa Ratna",   type: "Improved", duration: "65–70 days", yield: "1.0–1.2 t/ha", note: "Good for Zaid season" },
    ],
    sowing: { title: "Sowing", steps: [
      "Seed rate: 15–20 kg/ha. Treat with Rhizobium + Thiram.",
      "Rows 30–45 cm apart, plant-to-plant 10 cm, depth 3–4 cm.",
      "Kharif: June–July. Zaid: March–April.",
    ]},
    irrigation: { title: "Irrigation", steps: [
      "2–3 irrigations. Critical: flowering (30–35 DAS) and pod filling (45–50 DAS).",
      "Avoid waterlogging.",
    ]},
    fertilizer: { title: "Fertilizer", schedule: [
      { time: "Basal", dose: "P: 40 kg/ha + K: 30 kg/ha + N: 20 kg/ha starter. Rhizobium inoculation essential." },
    ], links: S("fertilizer", ["bh", "if"]) },
    pestManagement: [
      { pest: "Yellow Mosaic Virus", type: "Disease", sign: "Yellow mosaic pattern on leaves", action: "Control whitefly with Imidacloprid. Remove infected plants." },
      { pest: "Thrips",              type: "Pest",    sign: "Silvery streaks on leaves",       action: "Spray Spinosad 45 SC @ 0.3 ml/L." },
      { pest: "Pod Borer",           type: "Pest",    sign: "Holes in pods",                   action: "Spray Indoxacarb 14.5 SC @ 1 ml/L." },
    ],
    harvesting: { title: "Harvesting", steps: [
      "Harvest in 2–3 pickings when pods turn black (60–90 DAS).",
      "Pick mature pods every 3–4 days to avoid shattering.",
      "Dry to 10–12% moisture.",
      "Expected yield: 1.0–1.5 t/ha (10–15 q/ha).",
    ]},
    postHarvest: { title: "Post-Harvest", steps: [
      "Dry to 10–12% moisture. Store in hermetic bags.",
      "Fumigate with Aluminium Phosphide.",
    ]},
    selling: { title: "Where to Sell", options: [
      "Dal mills — mung dal has premium price.",
      "Sprout manufacturers — growing demand for mung sprouts.",
      "Government procurement at MSP through NAFED.",
    ], links: MKT },
    schemes: SCH,
    seedLinks: S("seeds", ["bh", "dh", "if"]),
    pesticideLinks: S("pesticide", ["bh", "as"]),
    tips: [
      "Mung bean is an excellent green manure crop — plough it in before flowering to enrich soil.",
      "Harvest in multiple pickings to maximise yield.",
      "Intercrop with maize or sorghum for better income.",
    ],
    readAloudText: "Mung bean is a short-duration pulse crop grown in Kharif and Zaid seasons. Treat seeds with Rhizobium. Sow in rows 30 to 45 centimetres apart. Give 2 to 3 irrigations at flowering and pod filling. Watch for yellow mosaic virus — control whitefly. Harvest in 2 to 3 pickings when pods turn black. Dry to 12 percent moisture. Sell to dal mills or at government mandi.",
  },

  // ── BLACK GRAM ────────────────────────────────────────────────────────────
  "black gram": {
    name: "Black Gram", emoji: "🫘",
    tagline: "High-value pulse — rich in protein and essential for urad dal.",
    overview: "Black gram (Vigna mungo) is grown in Kharif and Rabi seasons across India. Major states: AP, Telangana, MP, UP, Tamil Nadu. It is the source of urad dal, a staple in Indian cuisine.",
    soilPrep: { title: "Land Preparation", steps: [
      "One deep ploughing, 2 harrowings for fine tilth.",
      "Apply 5 t/ha FYM. Ideal soil: well-drained loamy. pH 6.0–7.5.",
      "Avoid waterlogging — raised beds recommended in heavy soils.",
    ]},
    varieties: [
      { name: "Pant U-19",  type: "Improved", duration: "70–75 days", yield: "1.2–1.5 t/ha", note: "North India" },
      { name: "LBG-17",     type: "Improved", duration: "70–75 days", yield: "1.2–1.5 t/ha", note: "AP, Telangana" },
      { name: "TAU-1",      type: "Improved", duration: "65–70 days", yield: "1.0–1.2 t/ha", note: "Tamil Nadu" },
    ],
    sowing: { title: "Sowing", steps: [
      "Seed rate: 15–20 kg/ha. Treat with Rhizobium + Thiram.",
      "Rows 30–45 cm apart, plant-to-plant 10 cm, depth 3–4 cm.",
      "Kharif: June–July. Rabi: October–November.",
    ]},
    irrigation: { title: "Irrigation", steps: [
      "2–3 irrigations. Critical: flowering and pod filling.",
      "Avoid waterlogging — use raised beds in heavy soils.",
    ]},
    fertilizer: { title: "Fertilizer", schedule: [
      { time: "Basal", dose: "P: 40 kg/ha + K: 30 kg/ha + N: 20 kg/ha starter. Rhizobium inoculation essential." },
    ], links: S("fertilizer", ["bh", "if"]) },
    pestManagement: [
      { pest: "Yellow Mosaic Virus", type: "Disease", sign: "Yellow mosaic on leaves, stunted growth", action: "Control whitefly with Imidacloprid. Remove infected plants." },
      { pest: "Leaf Crinkle",        type: "Disease", sign: "Crinkling and distortion of leaves",      action: "Control thrips vector. Remove infected plants." },
      { pest: "Pod Borer",           type: "Pest",    sign: "Holes in pods",                           action: "Spray Indoxacarb 14.5 SC @ 1 ml/L." },
    ],
    harvesting: { title: "Harvesting", steps: [
      "Harvest in 2–3 pickings when pods turn black (70–90 DAS).",
      "Dry to 10–12% moisture.",
      "Expected yield: 1.0–1.5 t/ha (10–15 q/ha).",
    ]},
    postHarvest: { title: "Post-Harvest", steps: [
      "Dry to 10–12% moisture. Store in hermetic bags.",
      "Fumigate with Aluminium Phosphide.",
    ]},
    selling: { title: "Where to Sell", options: [
      "Dal mills — urad dal commands premium price.",
      "Government procurement at MSP through NAFED.",
      "APMC mandi — check Agmarknet for daily prices.",
    ], links: MKT },
    schemes: SCH,
    seedLinks: S("seeds", ["bh", "dh", "if"]),
    pesticideLinks: S("pesticide", ["bh", "as"]),
    tips: [
      "Black gram tolerates light shade — good for intercropping with taller crops.",
      "Harvest in multiple pickings to maximise yield and avoid shattering.",
      "Inoculate seeds with Rhizobium to fix nitrogen.",
    ],
    readAloudText: "Black gram is a high-value pulse crop grown in Kharif and Rabi seasons. Treat seeds with Rhizobium. Sow in rows 30 to 45 centimetres apart. Give 2 to 3 irrigations. Watch for yellow mosaic virus — control whitefly. Harvest in 2 to 3 pickings when pods turn black. Sell to dal mills or at government mandi at MSP.",
  },

  // ── LENTIL ────────────────────────────────────────────────────────────────
  lentil: {
    name: "Lentil", emoji: "🫘",
    tagline: "Cool-season pulse — high protein, low water requirement.",
    overview: "Lentil (Lens culinaris) is a Rabi pulse crop grown in MP, UP, Bihar, West Bengal, and Rajasthan. It is a cool-season crop with low water requirement, ideal for rainfed conditions.",
    soilPrep: { title: "Land Preparation", steps: [
      "One deep ploughing, 2 harrowings for fine tilth.",
      "Apply 5 t/ha FYM. Ideal soil: well-drained loamy. pH 6.0–8.0.",
      "Lentil is sensitive to salinity — avoid saline soils.",
    ]},
    varieties: [
      { name: "Pant L-406",  type: "Improved", duration: "110–115 days", yield: "1.5–2 t/ha", note: "UP, Bihar — most popular" },
      { name: "DPL-62",      type: "Improved", duration: "105–110 days", yield: "1.5–2 t/ha", note: "MP, Rajasthan" },
      { name: "Moitree",     type: "Improved", duration: "100–105 days", yield: "1.5–2 t/ha", note: "West Bengal" },
    ],
    sowing: { title: "Sowing", steps: [
      "Seed rate: 40–50 kg/ha. Treat with Rhizobium + Thiram.",
      "Rows 25–30 cm apart, plant-to-plant 5–7 cm, depth 4–5 cm.",
      "Optimal sowing: October–November.",
    ]},
    irrigation: { title: "Irrigation", steps: [
      "Largely rainfed. 1–2 irrigations if available.",
      "Critical: pre-sowing and pod filling (80–90 DAS).",
      "Avoid waterlogging.",
    ]},
    fertilizer: { title: "Fertilizer", schedule: [
      { time: "Basal", dose: "P: 40 kg/ha + K: 20 kg/ha + N: 20 kg/ha starter. Rhizobium inoculation essential." },
    ], links: S("fertilizer", ["bh", "if"]) },
    pestManagement: [
      { pest: "Aphids",       type: "Pest",    sign: "Clusters on leaves and pods",  action: "Spray Dimethoate 30 EC @ 1.5 ml/L." },
      { pest: "Rust",         type: "Disease", sign: "Orange pustules on leaves",    action: "Spray Mancozeb 75 WP @ 2 g/L." },
      { pest: "Wilt",         type: "Disease", sign: "Sudden wilting of plants",     action: "Use resistant varieties. Seed treatment with Trichoderma." },
    ],
    harvesting: { title: "Harvesting", steps: [
      "Harvest when 70–80% pods turn brown (March–April).",
      "Cut plants, dry 3–4 days, thresh.",
      "Dry to 10–12% moisture.",
      "Expected yield: 1.0–2.0 t/ha (10–20 q/ha).",
    ]},
    postHarvest: { title: "Post-Harvest", steps: [
      "Dry to 10–12% moisture. Store in hermetic bags.",
      "Fumigate with Aluminium Phosphide.",
    ]},
    selling: { title: "Where to Sell", options: [
      "Dal mills — masoor dal has strong domestic demand.",
      "Government procurement at MSP through NAFED.",
      "Export to Middle East and Europe.",
    ], links: MKT },
    schemes: SCH,
    seedLinks: S("seeds", ["bh", "dh", "if"]),
    pesticideLinks: S("pesticide", ["bh", "as"]),
    tips: [
      "Inoculate seeds with Rhizobium to fix nitrogen.",
      "Lentil is an excellent crop for soil health — fixes 80–100 kg N/ha.",
      "Intercrop with mustard for better income.",
    ],
    readAloudText: "Lentil is a cool-season Rabi pulse crop. Treat seeds with Rhizobium. Sow in rows 25 to 30 centimetres apart in October to November. Give 1 to 2 irrigations. Watch for aphids and rust. Harvest in March to April when pods turn brown. Sell to dal mills or at government mandi at MSP.",
  },

  // ── COTTON ────────────────────────────────────────────────────────────────
  cotton: {
    name: "Cotton", emoji: "🌿",
    tagline: "White gold of India — the most important commercial fibre crop.",
    overview: "Cotton (Gossypium hirsutum) is grown on 12–13 million hectares in India. Major states: Gujarat, Maharashtra, Telangana, AP, Punjab, Haryana. Bt cotton hybrids dominate 95% of area. Kharif crop sown April–June.",
    soilPrep: { title: "Land Preparation", steps: [
      "Deep plough to 30–35 cm to break hardpan and improve drainage.",
      "Give 2–3 harrowings for fine tilth.",
      "Apply 10–15 t/ha FYM before final ploughing.",
      "Ideal soil: Deep, well-drained black cotton soil or red loam. pH 5.8–8.0.",
    ]},
    varieties: [
      { name: "Bollgard-II (various)", type: "Bt Hybrid", duration: "160–180 days", yield: "20–25 q/ha", note: "Bollworm resistant, most popular" },
      { name: "RCH-2 BG-II",          type: "Bt Hybrid", duration: "165–170 days", yield: "18–22 q/ha", note: "Gujarat, Maharashtra" },
    ],
    sowing: { title: "Sowing", steps: [
      "Seed rate: 2.5–3 kg/ha for Bt hybrids (delinted seeds).",
      "Sow in rows 90–120 cm apart, plant-to-plant 45–60 cm, depth 3–4 cm.",
      "Optimal sowing: April–May south India; May–June north India.",
      "Treat seeds with Imidacloprid 70 WS @ 5 g/kg for sucking pest protection.",
    ]},
    irrigation: { title: "Irrigation", steps: [
      "Critical stages: squaring (45–50 DAS), flowering (65–70 DAS), boll development (90–100 DAS).",
      "Total: 6–8 irrigations of 6–8 cm each.",
      "Drip irrigation saves 40–50% water and increases yield by 25–30%.",
    ]},
    fertilizer: { title: "Fertilizer Schedule", schedule: [
      { time: "Basal",                    dose: "P: 60 kg/ha + K: 60 kg/ha + 1/3 N: 40 kg/ha" },
      { time: "Squaring (45–50 DAS)",     dose: "1/3 N: 40 kg/ha" },
      { time: "Boll formation (80–90 DAS)", dose: "1/3 N: 40 kg/ha" },
    ], links: S("fertilizer", ["bh", "if", "as"]) },
    pestManagement: [
      { pest: "Bollworm",        type: "Pest",    sign: "Holes in bolls, damaged squares",       action: "Spray Spinosad 45 SC @ 0.3 ml/L. Use pheromone traps." },
      { pest: "Whitefly",        type: "Pest",    sign: "Yellowing, sticky honeydew, sooty mould", action: "Spray Spiromesifen 22.9 SC @ 1 ml/L." },
      { pest: "Leaf Curl Virus", type: "Disease", sign: "Upward curling, dark veins, stunted",   action: "Control whitefly. Remove infected plants." },
    ],
    harvesting: { title: "Harvesting", steps: [
      "Pick bolls when fully open and fluffy (October–February).",
      "Pick in 3–4 rounds at 15–20 day intervals.",
      "Expected yield: 15–25 q/ha seed cotton (kapas).",
    ]},
    postHarvest: { title: "Post-Harvest", steps: [
      "Dry picked cotton in sun 1–2 days.",
      "Take to ginning factory for separation of lint and seed.",
      "Cotton seed is valuable — sell to oil mills or use as cattle feed.",
    ]},
    selling: { title: "Where to Sell", options: [
      "Cotton Corporation of India (CCI) — government procurement at MSP.",
      "Private ginning factories — often pay above MSP for good quality.",
      "APMC mandi — check Agmarknet for daily prices.",
    ], links: MKT },
    schemes: SCH,
    seedLinks: S("seeds", ["bh", "dh", "as"]),
    pesticideLinks: S("pesticide", ["bh", "as", "km"]),
    tips: [
      "Use pheromone traps for bollworm monitoring — 5 traps per hectare.",
      "Drip irrigation with fertigation increases yield by 30% and saves water.",
      "Never spray synthetic pyrethroids in early season — they kill natural enemies.",
    ],
    readAloudText: "Cotton is a Kharif commercial crop sown in April to June. Prepare deep, well-drained soil. Use Bt hybrid seeds at 2.5 to 3 kilograms per hectare. Sow in rows 90 to 120 centimetres apart. Apply nitrogen in three splits. Irrigate at squaring, flowering, and boll development stages. Watch for bollworm and whitefly — use pheromone traps. Pick bolls in 3 to 4 rounds when fully open. Sell to Cotton Corporation of India at MSP or to private ginning factories.",
  },

  // ── JUTE ──────────────────────────────────────────────────────────────────
  jute: {
    name: "Jute", emoji: "🌿",
    tagline: "Golden fibre of India — eco-friendly natural fibre with strong export demand.",
    overview: "Jute (Corchorus olitorius/capsularis) is grown on 0.7 million hectares in India. Major states: West Bengal, Bihar, Assam, Odisha. India is the world's largest jute producer. Kharif crop sown March–May.",
    soilPrep: { title: "Land Preparation", steps: [
      "Deep plough to 20–25 cm. Give 2–3 harrowings for fine tilth.",
      "Apply 10 t/ha FYM before final ploughing.",
      "Ideal soil: Well-drained alluvial loamy soil. pH 6.0–7.5.",
      "Jute needs warm, humid climate with high rainfall (1500–2000 mm).",
    ]},
    varieties: [
      { name: "JRO-524 (Suren)", type: "Olitorius", duration: "100–110 days", yield: "25–30 q/ha fibre", note: "Most popular, high fibre quality" },
      { name: "JRC-212",         type: "Capsularis", duration: "110–120 days", yield: "20–25 q/ha fibre", note: "Waterlogging tolerant" },
    ],
    sowing: { title: "Sowing", steps: [
      "Seed rate: 5–7 kg/ha. Treat with Thiram 75 WS @ 2 g/kg.",
      "Broadcast or sow in rows 25–30 cm apart, depth 2–3 cm.",
      "Optimal sowing: March–April for olitorius; April–May for capsularis.",
      "Thin to 5–7 cm plant-to-plant spacing at 15–20 DAS.",
    ]},
    irrigation: { title: "Irrigation", steps: [
      "Largely rainfed. 2–3 irrigations if rainfall is inadequate.",
      "Critical: establishment (0–30 DAS) and rapid growth (30–60 DAS).",
    ]},
    fertilizer: { title: "Fertilizer Schedule", schedule: [
      { time: "Basal",          dose: "P: 30 kg/ha + K: 30 kg/ha + 1/2 N: 30 kg/ha" },
      { time: "30–35 DAS",      dose: "1/2 N: 30 kg/ha" },
    ], links: S("fertilizer", ["bh", "if"]) },
    pestManagement: [
      { pest: "Jute Semilooper", type: "Pest",    sign: "Defoliation, looper caterpillar",  action: "Spray Quinalphos 25 EC @ 2 ml/L." },
      { pest: "Stem Rot",        type: "Disease", sign: "Rotting at stem base, wilting",    action: "Spray Carbendazim 50 WP @ 1 g/L." },
      { pest: "Hairy Caterpillar",type:"Pest",    sign: "Mass defoliation",                 action: "Spray Chlorpyrifos 20 EC @ 2 ml/L." },
    ],
    harvesting: { title: "Harvesting", steps: [
      "Harvest before flowering for best fibre quality (100–120 DAS).",
      "Cut plants at ground level. Bundle and ret in water for 10–15 days.",
      "Retting: Submerge bundles in slow-moving water for fibre extraction.",
      "Wash, dry, and grade fibres.",
      "Expected yield: 20–30 q/ha dry fibre.",
    ]},
    postHarvest: { title: "Post-Harvest", steps: [
      "Grade fibres by colour, strength, and fineness.",
      "Dry to 12–14% moisture before storage.",
      "Store in dry, ventilated place.",
    ]},
    selling: { title: "Where to Sell", options: [
      "Jute mills — largest buyers. Contact National Jute Board.",
      "Government procurement through Jute Corporation of India (JCI) at MSP.",
      "Export: India exports jute to Bangladesh, China, Europe.",
    ], links: MKT },
    schemes: SCH,
    seedLinks: S("seeds", ["bh", "dh"]),
    pesticideLinks: S("pesticide", ["bh", "as"]),
    tips: [
      "Harvest before flowering — fibre quality deteriorates rapidly after flowering.",
      "Proper retting is critical — under-retted fibre is coarse, over-retted is weak.",
      "Use bio-retting with Bacillus subtilis to improve fibre quality.",
    ],
    readAloudText: "Jute is a Kharif fibre crop sown in March to May. Prepare well-drained alluvial soil. Sow seeds by broadcasting or in rows. Apply nitrogen in two splits. Harvest before flowering for best fibre quality. Ret bundles in slow-moving water for 10 to 15 days to extract fibre. Dry and grade fibres. Sell to jute mills or through Jute Corporation of India at MSP.",
  },

  // ── BANANA ────────────────────────────────────────────────────────────────
  banana: {
    name: "Banana", emoji: "🍌",
    tagline: "India's most produced fruit — year-round income for farmers.",
    overview: "Banana (Musa spp.) is grown on 0.9 million hectares in India. Major states: Tamil Nadu, Maharashtra, Gujarat, AP, Karnataka. Perennial crop with year-round production. Grand Naine (Cavendish) dominates commercial cultivation.",
    soilPrep: { title: "Land Preparation", steps: [
      "Deep plough to 30–45 cm. Remove previous crop residues.",
      "Dig pits of 45×45×45 cm at planting spacing.",
      "Fill pits with topsoil + 10 kg FYM + 250 g Neem cake + 100 g SSP.",
      "Ideal soil: Deep, well-drained loamy soil. pH 5.5–7.0.",
    ]},
    varieties: [
      { name: "Grand Naine (G9)", type: "Cavendish", duration: "11–12 months", yield: "40–50 t/ha", note: "Export quality, most popular commercial variety" },
      { name: "Robusta",          type: "Cavendish", duration: "12–13 months", yield: "35–45 t/ha", note: "Good for domestic market" },
      { name: "Nendran",          type: "Plantain",  duration: "14–15 months", yield: "20–25 t/ha", note: "Kerala — cooking banana, premium price" },
    ],
    sowing: { title: "Planting", steps: [
      "Use tissue culture (TC) plants for disease-free, uniform crop.",
      "Planting density: 1800–2000 plants/ha at 1.8×2.7 m spacing.",
      "Best planting time: February–March or June–July.",
      "Plant TC plants at 5–7 cm depth. Irrigate immediately after planting.",
    ]},
    irrigation: { title: "Irrigation", steps: [
      "Banana requires 1800–2000 mm water per year.",
      "Drip irrigation: 8–10 litres/plant/day in summer; 4–6 litres/plant/day in winter.",
      "Avoid water stress at flowering and bunch development stages.",
    ]},
    fertilizer: { title: "Fertilizer Schedule (per plant/year)", schedule: [
      { time: "At planting",    dose: "FYM 10 kg + SSP 100 g + MOP 100 g per pit" },
      { time: "2 months",       dose: "Urea 100 g + MOP 100 g per plant" },
      { time: "4 months",       dose: "Urea 100 g + SSP 50 g + MOP 150 g per plant" },
      { time: "6 months",       dose: "Urea 100 g + MOP 200 g per plant" },
      { time: "8 months",       dose: "Urea 50 g + MOP 200 g per plant" },
      { time: "Total per year", dose: "N: 200 g, P: 60 g, K: 300 g — split in 4–5 doses" },
    ], links: S("fertilizer", ["bh", "if", "as"]) },
    pestManagement: [
      { pest: "Panama Wilt",        type: "Disease", sign: "Yellowing lower leaves, brown inside stem", action: "Use disease-free TC plants. Drench with Carbendazim 50 WP @ 1 g/L." },
      { pest: "Sigatoka Leaf Spot", type: "Disease", sign: "Yellow streaks turning brown on leaves",    action: "Spray Propiconazole 25 EC @ 1 ml/L. Remove infected leaves." },
      { pest: "Banana Weevil",      type: "Pest",    sign: "Tunnelling in corm, wilting",               action: "Apply Chlorpyrifos 20 EC @ 5 ml/L around base." },
    ],
    harvesting: { title: "Harvesting", steps: [
      "Harvest 11–14 months after planting when fingers are plump and angular edges round off.",
      "Cut bunch with a sharp knife. Leave 30 cm of pseudostem above bunch.",
      "Handle bunches carefully to avoid bruising.",
      "Expected yield: 30–50 t/ha (300–500 q/ha).",
    ]},
    postHarvest: { title: "Post-Harvest", steps: [
      "Grade bunches by size and quality. Remove damaged fingers.",
      "Pack in corrugated boxes for export or gunny bags for local market.",
      "Ripen in ethylene chamber (100 ppm for 24 hours) for uniform ripening.",
      "Store at 13–14°C for 2–3 weeks for export.",
    ]},
    selling: { title: "Where to Sell", options: [
      "APMC mandi — check Agmarknet for daily prices.",
      "Direct sale to supermarkets and retail chains for premium price.",
      "Export: Grand Naine to Middle East, Europe. Contact APEDA.",
      "Processing: Banana chips, flour, powder — value addition for better income.",
    ], links: MKT },
    schemes: SCH,
    seedLinks: S("seeds", ["bh", "dh"]),
    pesticideLinks: S("pesticide", ["bh", "as"]),
    tips: [
      "Always use tissue culture plants — disease-free and 20–30% higher yield.",
      "Drip irrigation with fertigation is the most efficient way to grow banana.",
      "Remove suckers regularly — keep only one ratoon sucker per plant.",
      "Prop plants with bamboo poles at bunch emergence to prevent lodging.",
    ],
    readAloudText: "Banana is a perennial fruit crop. Use tissue culture plants for disease-free, high-yield crop. Plant at 1.8 by 2.7 metre spacing. Install drip irrigation — banana needs 8 to 10 litres of water per plant per day in summer. Apply nitrogen, phosphorus, and potassium in 4 to 5 splits throughout the year. Watch for Panama wilt and Sigatoka leaf spot. Harvest 11 to 14 months after planting when fingers are plump. Handle bunches carefully. Sell at APMC mandi or directly to supermarkets.",
  },

  // ── MANGO ─────────────────────────────────────────────────────────────────
  mango: {
    name: "Mango", emoji: "🥭",
    tagline: "King of fruits — India's most exported fruit with premium market value.",
    overview: "Mango (Mangifera indica) is grown on 2.3 million hectares in India. Major states: UP, AP, Karnataka, Bihar, Gujarat. India produces 50% of world's mangoes. Alphonso, Dasheri, Langra, Kesar command premium prices.",
    soilPrep: { title: "Pit Preparation", steps: [
      "Dig pits of 1×1×1 m at planting spacing 6–10 m apart.",
      "Fill pits with topsoil + 30–40 kg FYM + 1 kg SSP + 500 g Neem cake.",
      "Allow pits to weather for 30 days before planting.",
      "Ideal soil: Deep, well-drained loamy soil. pH 5.5–7.5.",
    ]},
    varieties: [
      { name: "Alphonso (Hapus)", type: "Premium",    duration: "4–5 months fruiting", yield: "100–150 kg/tree", note: "Maharashtra — highest export value" },
      { name: "Dasheri",          type: "Commercial", duration: "4–5 months",          yield: "80–120 kg/tree",  note: "UP — sweet, fibreless" },
      { name: "Kesar",            type: "Premium",    duration: "4–5 months",          yield: "80–120 kg/tree",  note: "Gujarat — export quality" },
      { name: "Totapuri",         type: "Processing", duration: "4–5 months",          yield: "100–150 kg/tree", note: "South India — for pulp and processing" },
    ],
    sowing: { title: "Planting", steps: [
      "Plant grafted seedlings (veneer or stone grafts) from certified nurseries.",
      "Best planting time: June–July (onset of monsoon).",
      "Spacing: 10×10 m regular; 6×6 m for high-density planting.",
      "High-density planting (HDP): 400–1600 plants/ha — 3–4× higher yield.",
    ]},
    irrigation: { title: "Irrigation", steps: [
      "Young trees (1–3 years): Irrigate every 7–10 days in summer.",
      "Bearing trees: Withhold irrigation October–January to induce flowering.",
      "Resume irrigation at fruit set (February–March).",
      "Drip irrigation: 40–60 litres/tree/day in summer.",
    ]},
    fertilizer: { title: "Fertilizer (per tree/year)", schedule: [
      { time: "Young trees (1–3 years)", dose: "N: 100–300 g, P: 50–150 g, K: 100–300 g (increase each year)" },
      { time: "Bearing trees (4+ years)", dose: "N: 1000 g, P: 500 g, K: 1000 g per tree per year" },
      { time: "Application timing",       dose: "Split in 2: post-harvest (June–July) and pre-flowering (October)" },
    ], links: S("fertilizer", ["bh", "if", "as"]) },
    pestManagement: [
      { pest: "Mango Hopper",   type: "Pest",    sign: "Nymphs on inflorescence, honeydew",  action: "Spray Imidacloprid 17.8 SL @ 0.5 ml/L at bud burst." },
      { pest: "Powdery Mildew", type: "Disease", sign: "White powder on inflorescence",      action: "Spray Wettable Sulphur 80 WP @ 2 g/L." },
      { pest: "Anthracnose",    type: "Disease", sign: "Dark spots on fruits, premature drop", action: "Spray Carbendazim 50 WP @ 1 g/L before and after flowering." },
      { pest: "Fruit Fly",      type: "Pest",    sign: "Maggots inside fruit, premature drop", action: "Use methyl eugenol traps. Spray Malathion 50 EC @ 2 ml/L." },
    ],
    harvesting: { title: "Harvesting", steps: [
      "Harvest when fruits show colour change and shoulders become full (April–June).",
      "Use harvesting poles with net bags to avoid bruising.",
      "Harvest in cool morning hours.",
      "Expected yield: 80–150 kg/tree; 10–20 t/ha.",
    ]},
    postHarvest: { title: "Post-Harvest", steps: [
      "Wash fruits in clean water. Grade by size and quality.",
      "Hot water treatment (48°C for 60 minutes) for export to control fruit fly.",
      "Pack in corrugated boxes with paper padding.",
      "Store at 8–12°C for 2–4 weeks.",
    ]},
    selling: { title: "Where to Sell", options: [
      "APMC mandi — check Agmarknet for daily prices.",
      "Direct sale to exporters — contact APEDA for export registration.",
      "Supermarkets and retail chains — premium price for graded fruit.",
      "Processing units — mango pulp factories in Maharashtra, AP, Karnataka.",
    ], links: MKT },
    schemes: SCH,
    seedLinks: S("seeds", ["bh", "dh"]),
    pesticideLinks: S("pesticide", ["bh", "as"]),
    tips: [
      "Withhold irrigation October–January to induce uniform flowering.",
      "High-density planting (400+ trees/ha) gives 3–4× higher income.",
      "Spray Paclobutrazol @ 5 g/tree in September to induce early, uniform flowering.",
      "Register with APEDA for mango export — premium prices for Alphonso and Kesar.",
    ],
    readAloudText: "Mango is a perennial fruit crop. Plant grafted seedlings in June to July at 10 by 10 metre spacing. Withhold irrigation from October to January to induce flowering. Apply 1 kilogram each of nitrogen and potassium per bearing tree per year in two splits. Watch for mango hopper and powdery mildew at flowering. Harvest in April to June when fruits show colour change. Grade and pack carefully. Sell at APMC mandi or directly to exporters for premium price.",
  },

  // ── GRAPES ────────────────────────────────────────────────────────────────
  grapes: {
    name: "Grapes", emoji: "🍇",
    tagline: "High-value fruit with strong export demand — premium income for farmers.",
    overview: "Grapes (Vitis vinifera) are grown on 0.15 million hectares in India. Major states: Maharashtra (Nashik), Karnataka, AP, Tamil Nadu. India is a major exporter of table grapes to Europe and Middle East.",
    soilPrep: { title: "Land Preparation", steps: [
      "Deep plough to 60–90 cm. Remove stones and debris.",
      "Dig pits of 90×90×90 cm at planting spacing.",
      "Fill pits with topsoil + 30 kg FYM + 500 g SSP + 250 g Neem cake.",
      "Ideal soil: Well-drained sandy loam to loamy. pH 6.0–7.5.",
    ]},
    varieties: [
      { name: "Thompson Seedless", type: "Table/Raisin", duration: "150–180 days", yield: "20–25 t/ha", note: "Most popular export variety" },
      { name: "Sharad Seedless",   type: "Table",        duration: "150–160 days", yield: "20–25 t/ha", note: "Black grape, premium price" },
      { name: "Flame Seedless",    type: "Table",        duration: "140–150 days", yield: "18–22 t/ha", note: "Red grape, export quality" },
    ],
    sowing: { title: "Planting", steps: [
      "Plant rooted cuttings or grafted vines from certified nurseries.",
      "Spacing: 3×3 m or 3×1.5 m for high-density. Trellis system essential.",
      "Best planting time: June–July or January–February.",
      "Install trellis (T-bar or Y-trellis) before planting.",
    ]},
    irrigation: { title: "Irrigation", steps: [
      "Drip irrigation is essential — 8–12 litres/vine/day in summer.",
      "Withhold irrigation 4–6 weeks before pruning to induce dormancy.",
      "Resume irrigation at bud burst. Increase at berry development.",
      "Stop irrigation 10–15 days before harvest for better sugar content.",
    ]},
    fertilizer: { title: "Fertilizer (per vine/year)", schedule: [
      { time: "Pre-pruning",      dose: "FYM 20 kg + SSP 200 g + MOP 200 g per vine" },
      { time: "Bud burst",        dose: "Urea 100 g per vine" },
      { time: "Berry development",dose: "Urea 100 g + MOP 200 g per vine" },
      { time: "Foliar spray",     dose: "Boron 0.1% + Zinc Sulphate 0.5% at flowering" },
    ], links: S("fertilizer", ["bh", "if", "as"]) },
    pestManagement: [
      { pest: "Downy Mildew",  type: "Disease", sign: "Yellow spots on upper leaf, white downy below", action: "Spray Metalaxyl + Mancozeb @ 2.5 g/L. Avoid overhead irrigation." },
      { pest: "Powdery Mildew",type: "Disease", sign: "White powdery coating on leaves and berries",  action: "Spray Wettable Sulphur 80 WP @ 3 g/L." },
      { pest: "Thrips",        type: "Pest",    sign: "Silvery scarring on berries",                  action: "Spray Spinosad 45 SC @ 0.3 ml/L at berry set." },
    ],
    harvesting: { title: "Harvesting", steps: [
      "Harvest when berries reach target sugar content (18–22° Brix for export).",
      "Cut bunches with sharp scissors. Handle carefully to avoid bruising.",
      "Grade by bunch weight, berry size, and colour.",
      "Expected yield: 18–25 t/ha.",
    ]},
    postHarvest: { title: "Post-Harvest", steps: [
      "Pre-cool to 2–4°C within 2 hours of harvest.",
      "Fumigate with SO₂ pads to prevent Botrytis rot.",
      "Pack in ventilated boxes with SO₂ pads.",
      "Store at 0–2°C for 4–6 weeks.",
    ]},
    selling: { title: "Where to Sell", options: [
      "Export to Europe and Middle East — contact APEDA for registration.",
      "Domestic supermarkets and retail chains.",
      "Wineries — for wine grape varieties.",
      "APMC mandi — check Agmarknet for daily prices.",
    ], links: MKT },
    schemes: SCH,
    seedLinks: S("seeds", ["bh", "dh"]),
    pesticideLinks: S("pesticide", ["bh", "as", "km"]),
    tips: [
      "Drip irrigation with fertigation is essential for high-quality grapes.",
      "Proper pruning is the most critical operation — attend KVK training.",
      "Export certification (GlobalGAP) increases price by 30–40%.",
    ],
    readAloudText: "Grapes are a high-value fruit crop. Plant rooted cuttings on a trellis system. Install drip irrigation — grapes need 8 to 12 litres per vine per day. Withhold irrigation before pruning to induce dormancy. Watch for downy mildew and powdery mildew. Harvest when berries reach 18 to 22 degrees Brix sugar content. Pre-cool immediately after harvest. Sell to exporters or domestic supermarkets for premium price.",
  },

  // ── WATERMELON ────────────────────────────────────────────────────────────
  watermelon: {
    name: "Watermelon", emoji: "🍉",
    tagline: "High-value summer fruit — quick returns in 70–90 days.",
    overview: "Watermelon (Citrullus lanatus) is a Zaid season crop grown in February–March. Major states: UP, Karnataka, AP, Rajasthan, MP. It is a quick-return crop with high market demand in summer.",
    soilPrep: { title: "Land Preparation", steps: [
      "Deep plough to 30–40 cm. Give 2–3 harrowings for fine tilth.",
      "Apply 20–25 t/ha FYM before final ploughing.",
      "Ideal soil: Well-drained sandy loam. pH 6.0–7.0.",
      "Make raised beds or ridges for better drainage.",
    ]},
    varieties: [
      { name: "Sugar Baby",    type: "Open Pollinated", duration: "75–80 days", yield: "25–30 t/ha", note: "Small fruit, popular in north India" },
      { name: "Arka Manik",    type: "Hybrid",          duration: "70–75 days", yield: "35–40 t/ha", note: "IIHR variety, high yield" },
      { name: "Kiran",         type: "Hybrid",          duration: "70–75 days", yield: "35–40 t/ha", note: "Seedless, premium price" },
    ],
    sowing: { title: "Sowing", steps: [
      "Seed rate: 2–3 kg/ha for open pollinated; 500 g/ha for hybrids.",
      "Sow 2–3 seeds per pit, spacing 2×2 m or 2×1.5 m.",
      "Thin to 1 plant per pit at 10–15 DAS.",
      "Optimal sowing: February–March for Zaid season.",
    ]},
    irrigation: { title: "Irrigation", steps: [
      "Drip irrigation: 4–6 litres/plant/day.",
      "Critical: vine development (20–30 DAS), flowering (35–45 DAS), fruit development (50–65 DAS).",
      "Reduce irrigation 10 days before harvest for better sweetness.",
    ]},
    fertilizer: { title: "Fertilizer Schedule", schedule: [
      { time: "Basal",              dose: "FYM 25 t/ha + P: 40 kg/ha + K: 60 kg/ha + 1/3 N: 40 kg/ha" },
      { time: "Vine development",   dose: "1/3 N: 40 kg/ha" },
      { time: "Fruit development",  dose: "1/3 N: 40 kg/ha + K: 30 kg/ha" },
    ], links: S("fertilizer", ["bh", "if", "as"]) },
    pestManagement: [
      { pest: "Fruit Fly",      type: "Pest",    sign: "Maggots inside fruit, premature drop", action: "Use protein hydrolysate bait traps. Spray Malathion 50 EC @ 2 ml/L." },
      { pest: "Downy Mildew",   type: "Disease", sign: "Yellow spots on upper leaf surface",   action: "Spray Metalaxyl + Mancozeb @ 2.5 g/L." },
      { pest: "Powdery Mildew", type: "Disease", sign: "White powdery coating on leaves",      action: "Spray Wettable Sulphur 80 WP @ 2 g/L." },
    ],
    harvesting: { title: "Harvesting", steps: [
      "Harvest when tendril near fruit dries up and fruit sounds hollow when tapped.",
      "Cut with 5 cm stalk. Handle carefully to avoid bruising.",
      "Expected yield: 25–40 t/ha.",
    ]},
    postHarvest: { title: "Post-Harvest", steps: [
      "Store at 10–15°C for 2–3 weeks.",
      "Grade by size and weight. Pack in straw or foam nets.",
    ]},
    selling: { title: "Where to Sell", options: [
      "APMC mandi — check Agmarknet for daily prices.",
      "Direct sale to fruit vendors and supermarkets.",
      "Roadside stalls during summer — high demand.",
    ], links: MKT },
    schemes: SCH,
    seedLinks: S("seeds", ["bh", "dh", "as"]),
    pesticideLinks: S("pesticide", ["bh", "as"]),
    tips: [
      "Reduce irrigation 10 days before harvest for sweeter fruit.",
      "Use black plastic mulch to conserve moisture and suppress weeds.",
      "Bee pollination is essential — keep beehives near the field.",
    ],
    readAloudText: "Watermelon is a Zaid season crop sown in February to March. Prepare well-drained sandy loam soil. Sow 2 to 3 seeds per pit at 2 by 2 metre spacing. Install drip irrigation. Apply fertilizers in three splits. Watch for fruit fly and downy mildew. Harvest when tendril near fruit dries up and fruit sounds hollow. Sell at APMC mandi or directly to fruit vendors.",
  },

  // ── MUSKMELON ─────────────────────────────────────────────────────────────
  muskmelon: {
    name: "Muskmelon", emoji: "🍈",
    tagline: "Aromatic summer fruit — high demand and quick returns.",
    overview: "Muskmelon (Cucumis melo) is a Zaid season crop similar to watermelon. Major states: UP, Punjab, Rajasthan, AP. It has a shorter shelf life than watermelon but commands premium price for its aroma.",
    soilPrep: { title: "Land Preparation", steps: [
      "Deep plough to 30–40 cm. Give 2–3 harrowings.",
      "Apply 20–25 t/ha FYM. Ideal soil: well-drained sandy loam. pH 6.0–7.0.",
      "Make raised beds for better drainage.",
    ]},
    varieties: [
      { name: "Pusa Sharbati",  type: "Open Pollinated", duration: "75–80 days", yield: "15–20 t/ha", note: "Popular in north India" },
      { name: "Arka Rajhans",   type: "Hybrid",          duration: "70–75 days", yield: "20–25 t/ha", note: "IIHR variety, high yield" },
    ],
    sowing: { title: "Sowing", steps: [
      "Seed rate: 1.5–2 kg/ha. Sow 2–3 seeds per pit, spacing 1.5×1.5 m.",
      "Thin to 1 plant per pit at 10–15 DAS.",
      "Optimal sowing: February–March.",
    ]},
    irrigation: { title: "Irrigation", steps: [
      "Drip irrigation: 3–5 litres/plant/day.",
      "Stop irrigation 10 days before harvest for better flavour and aroma.",
    ]},
    fertilizer: { title: "Fertilizer", schedule: [
      { time: "Basal",             dose: "FYM 25 t/ha + P: 40 kg/ha + K: 60 kg/ha + 1/3 N: 40 kg/ha" },
      { time: "Vine development",  dose: "1/3 N: 40 kg/ha" },
      { time: "Fruit development", dose: "1/3 N: 40 kg/ha" },
    ], links: S("fertilizer", ["bh", "if"]) },
    pestManagement: [
      { pest: "Fruit Fly",      type: "Pest",    sign: "Maggots inside fruit", action: "Use protein hydrolysate bait traps." },
      { pest: "Powdery Mildew", type: "Disease", sign: "White powder on leaves", action: "Spray Wettable Sulphur 80 WP @ 2 g/L." },
    ],
    harvesting: { title: "Harvesting", steps: [
      "Harvest when fruit develops aroma and skin colour changes (70–90 DAS).",
      "Slip test: fruit separates easily from vine when ripe.",
      "Expected yield: 15–25 t/ha.",
    ]},
    postHarvest: { title: "Post-Harvest", steps: [
      "Store at 7–10°C for 1–2 weeks. Short shelf life — sell quickly.",
      "Grade by size and aroma.",
    ]},
    selling: { title: "Where to Sell", options: [
      "APMC mandi — check Agmarknet for daily prices.",
      "Direct sale to fruit vendors and supermarkets.",
    ], links: MKT },
    schemes: SCH,
    seedLinks: S("seeds", ["bh", "dh"]),
    pesticideLinks: S("pesticide", ["bh", "as"]),
    tips: [
      "Stop irrigation 10 days before harvest for better flavour and aroma.",
      "Muskmelon has short shelf life — plan harvest and sale together.",
      "Bee pollination is essential for good fruit set.",
    ],
    readAloudText: "Muskmelon is a Zaid season crop sown in February to March. Prepare well-drained sandy loam soil. Sow 2 to 3 seeds per pit at 1.5 by 1.5 metre spacing. Stop irrigation 10 days before harvest for better flavour. Harvest when fruit develops aroma and separates easily from vine. Sell quickly at APMC mandi or to fruit vendors.",
  },

  // ── APPLE ─────────────────────────────────────────────────────────────────
  apple: {
    name: "Apple", emoji: "🍎",
    tagline: "Premium temperate fruit — high income in hilly regions.",
    overview: "Apple (Malus domestica) is grown in J&K, Himachal Pradesh, Uttarakhand, and Arunachal Pradesh. It requires chilling hours (1000–1500 hours below 7°C) for proper flowering. India produces 2.5 million tonnes annually.",
    soilPrep: { title: "Land Preparation", steps: [
      "Dig pits of 1×1×1 m at planting spacing.",
      "Fill pits with topsoil + 30–40 kg FYM + 500 g SSP + 250 g Neem cake.",
      "Ideal soil: Well-drained loamy soil. pH 5.5–6.5.",
      "Avoid waterlogging — apple is very sensitive to standing water.",
    ]},
    varieties: [
      { name: "Royal Delicious",  type: "Standard",    duration: "150–180 days", yield: "20–30 t/ha", note: "Most popular in HP and J&K" },
      { name: "Red Delicious",    type: "Standard",    duration: "150–180 days", yield: "20–30 t/ha", note: "Good colour, export quality" },
      { name: "Fuji",             type: "Spur type",   duration: "160–180 days", yield: "25–35 t/ha", note: "Late season, excellent flavour" },
      { name: "HRMN-99",          type: "Low Chill",   duration: "120–140 days", yield: "15–20 t/ha", note: "Plains apple — low chilling requirement" },
    ],
    sowing: { title: "Planting", steps: [
      "Plant grafted trees (M-9 or M-111 rootstock) from certified nurseries.",
      "Spacing: 6×6 m standard; 3×1.5 m for high-density planting.",
      "Best planting time: January–February (dormant season).",
      "High-density planting (HDP): 1000–2000 trees/ha — 3–4× higher yield.",
    ]},
    irrigation: { title: "Irrigation", steps: [
      "Young trees: Irrigate every 7–10 days in summer.",
      "Bearing trees: Drip irrigation 40–60 litres/tree/day in summer.",
      "Critical: fruit development (June–August).",
      "Stop irrigation 2 weeks before harvest.",
    ]},
    fertilizer: { title: "Fertilizer (per tree/year)", schedule: [
      { time: "Young trees (1–3 years)", dose: "N: 70–210 g, P: 35–105 g, K: 70–210 g (increase each year)" },
      { time: "Bearing trees (4+ years)", dose: "N: 700 g, P: 350 g, K: 700 g per tree per year" },
      { time: "Application timing",       dose: "Split in 2: pre-flowering (March) and post-fruit set (June)" },
      { time: "Foliar spray",             dose: "Calcium Nitrate 0.5% at fruit development for better quality" },
    ], links: S("fertilizer", ["bh", "if", "as"]) },
    pestManagement: [
      { pest: "Scab",           type: "Disease", sign: "Olive-green spots on leaves and fruits",  action: "Spray Mancozeb 75 WP @ 2 g/L at green tip stage." },
      { pest: "Woolly Aphid",   type: "Pest",    sign: "White woolly masses on branches",         action: "Spray Chlorpyrifos 20 EC @ 2 ml/L." },
      { pest: "Codling Moth",   type: "Pest",    sign: "Maggots inside fruit, entry hole",        action: "Use pheromone traps. Spray Indoxacarb 14.5 SC @ 1 ml/L." },
      { pest: "Fire Blight",    type: "Disease", sign: "Shoots turn brown and die, shepherd's crook", action: "Prune infected shoots 30 cm below infection. Spray Streptomycin." },
    ],
    harvesting: { title: "Harvesting", steps: [
      "Harvest when fruit reaches target colour, size, and firmness (August–October).",
      "Starch-iodine test: apply iodine solution — blue-black indicates unripe.",
      "Pick by hand with a twisting motion. Handle carefully.",
      "Expected yield: 20–35 t/ha under good management.",
    ]},
    postHarvest: { title: "Post-Harvest", steps: [
      "Pre-cool to 0–2°C within 24 hours of harvest.",
      "Store in CA (Controlled Atmosphere) storage for 6–9 months.",
      "Grade by size, colour, and firmness.",
      "Pack in corrugated boxes with foam nets.",
    ]},
    selling: { title: "Where to Sell", options: [
      "APMC mandi in Shimla, Srinagar — check Agmarknet for daily prices.",
      "Direct sale to supermarkets and retail chains.",
      "Export to Middle East and Southeast Asia — contact APEDA.",
      "Processing: Apple juice, cider, jam — value addition for better income.",
    ], links: MKT },
    schemes: SCH,
    seedLinks: S("seeds", ["bh", "dh"]),
    pesticideLinks: S("pesticide", ["bh", "as", "km"]),
    tips: [
      "High-density planting (1000+ trees/ha) gives 3–4× higher income.",
      "Thinning fruits early (June) gives larger, better-quality apples.",
      "CA storage allows selling in off-season at premium prices.",
      "Join apple grower cooperatives for better market access.",
    ],
    readAloudText: "Apple is a temperate fruit crop grown in hilly regions. Plant grafted trees in January to February. Install drip irrigation. Apply nitrogen, phosphorus, and potassium in two splits. Watch for scab and codling moth. Harvest in August to October when fruit reaches target colour and firmness. Pre-cool immediately after harvest. Store in cold storage for off-season sale. Sell at APMC mandi or directly to supermarkets.",
  },

  // ── ORANGE ────────────────────────────────────────────────────────────────
  orange: {
    name: "Orange", emoji: "🍊",
    tagline: "Popular citrus fruit — strong domestic demand and export potential.",
    overview: "Orange (Citrus sinensis) is grown on 0.5 million hectares in India. Major states: Maharashtra (Nagpur), MP, Rajasthan, Punjab, AP. Nagpur mandarin is world-famous. Perennial crop with 20–30 year productive life.",
    soilPrep: { title: "Land Preparation", steps: [
      "Dig pits of 60×60×60 cm at planting spacing.",
      "Fill pits with topsoil + 20 kg FYM + 500 g SSP + 250 g Neem cake.",
      "Ideal soil: Well-drained loamy soil. pH 6.0–7.5.",
      "Avoid waterlogging — citrus is very sensitive to standing water.",
    ]},
    varieties: [
      { name: "Nagpur Mandarin",  type: "Mandarin", duration: "180–240 days", yield: "15–20 t/ha", note: "World-famous, GI tagged" },
      { name: "Kinnow",           type: "Mandarin", duration: "180–200 days", yield: "20–25 t/ha", note: "Punjab, Rajasthan — high yield" },
      { name: "Mosambi (Sweet Lime)", type: "Sweet Lime", duration: "180–200 days", yield: "15–20 t/ha", note: "Juice variety, high demand" },
    ],
    sowing: { title: "Planting", steps: [
      "Plant budded plants from certified nurseries.",
      "Spacing: 6×6 m standard; 4×4 m for high-density.",
      "Best planting time: June–July (onset of monsoon).",
    ]},
    irrigation: { title: "Irrigation", steps: [
      "Drip irrigation: 30–50 litres/tree/day in summer.",
      "Withhold irrigation 4–6 weeks before flowering to induce stress.",
      "Resume irrigation at fruit set.",
      "Avoid waterlogging at any stage.",
    ]},
    fertilizer: { title: "Fertilizer (per tree/year)", schedule: [
      { time: "Young trees (1–3 years)", dose: "N: 100–300 g, P: 50–150 g, K: 100–300 g" },
      { time: "Bearing trees",           dose: "N: 800 g, P: 400 g, K: 800 g per tree per year" },
      { time: "Application timing",      dose: "Split in 3: pre-flowering, post-fruit set, post-harvest" },
      { time: "Micronutrients",          dose: "Foliar spray of Zinc Sulphate 0.5% + Manganese Sulphate 0.3% annually" },
    ], links: S("fertilizer", ["bh", "if", "as"]) },
    pestManagement: [
      { pest: "Citrus Psylla",    type: "Pest",    sign: "Curling of new shoots, honeydew",     action: "Spray Imidacloprid 17.8 SL @ 0.5 ml/L at new flush." },
      { pest: "Citrus Canker",    type: "Disease", sign: "Raised corky lesions on leaves/fruits", action: "Spray Copper Oxychloride 50 WP @ 3 g/L." },
      { pest: "Gummosis",         type: "Disease", sign: "Gum exudation from trunk/branches",   action: "Scrape affected area. Apply Bordeaux paste." },
    ],
    harvesting: { title: "Harvesting", steps: [
      "Harvest when fruits develop full colour and TSS reaches 10–12° Brix (November–February).",
      "Clip fruits with 1 cm stalk. Handle carefully.",
      "Expected yield: 15–25 t/ha.",
    ]},
    postHarvest: { title: "Post-Harvest", steps: [
      "Grade by size and colour. Wax coating extends shelf life.",
      "Store at 5–8°C for 4–6 weeks.",
      "Pack in ventilated boxes.",
    ]},
    selling: { title: "Where to Sell", options: [
      "APMC mandi — check Agmarknet for daily prices.",
      "Juice processing units — Nagpur mandarin juice has strong demand.",
      "Export to Middle East and Southeast Asia — contact APEDA.",
    ], links: MKT },
    schemes: SCH,
    seedLinks: S("seeds", ["bh", "dh"]),
    pesticideLinks: S("pesticide", ["bh", "as"]),
    tips: [
      "Withhold irrigation before flowering to induce stress — increases fruit set.",
      "Foliar spray of micronutrients annually prevents deficiency symptoms.",
      "Nagpur mandarin has GI tag — use it for premium pricing.",
    ],
    readAloudText: "Orange is a perennial citrus crop. Plant budded plants in June to July. Install drip irrigation. Withhold irrigation before flowering to induce stress. Apply fertilizers in three splits. Watch for citrus psylla and canker. Harvest in November to February when fruits develop full colour. Grade and pack carefully. Sell at APMC mandi or to juice processing units.",
  },

  // ── PAPAYA ────────────────────────────────────────────────────────────────
  papaya: {
    name: "Papaya", emoji: "🍈",
    tagline: "Fast-growing fruit — income within 9 months of planting.",
    overview: "Papaya (Carica papaya) is grown across India in tropical and subtropical regions. It is one of the fastest-growing fruit crops, bearing fruit within 9–12 months. Rich in vitamins A and C, it has strong domestic and export demand.",
    soilPrep: { title: "Land Preparation", steps: [
      "Deep plough to 30–45 cm. Give 2–3 harrowings.",
      "Dig pits of 60×60×60 cm at planting spacing.",
      "Fill pits with topsoil + 20 kg FYM + 250 g SSP + 100 g Neem cake.",
      "Ideal soil: Well-drained loamy soil. pH 6.0–7.0.",
      "Plant on raised beds in heavy soils to prevent waterlogging.",
    ]},
    varieties: [
      { name: "Pusa Dwarf",    type: "Dioecious",   duration: "9–10 months", yield: "40–50 t/ha", note: "Most popular, compact plant" },
      { name: "Pusa Nanha",    type: "Dioecious",   duration: "9–10 months", yield: "35–45 t/ha", note: "Dwarf, suitable for high density" },
      { name: "Red Lady",      type: "Gynodioecious",duration: "9–10 months", yield: "50–60 t/ha", note: "Taiwan hybrid, all female plants" },
      { name: "CO-7",          type: "Gynodioecious",duration: "9–10 months", yield: "45–55 t/ha", note: "Tamil Nadu — high yield" },
    ],
    sowing: { title: "Planting", steps: [
      "Raise seedlings in nursery for 30–45 days before transplanting.",
      "Spacing: 1.8×1.8 m or 2×2 m. Plant 3 seedlings per pit, thin to 1 after sex determination.",
      "For dioecious varieties: maintain 1 male plant per 10 female plants.",
      "Best planting time: June–July or February–March.",
    ]},
    irrigation: { title: "Irrigation", steps: [
      "Drip irrigation: 6–8 litres/plant/day in summer.",
      "Avoid waterlogging — papaya is very sensitive to standing water.",
      "Critical: fruit development stage.",
    ]},
    fertilizer: { title: "Fertilizer (per plant/year)", schedule: [
      { time: "At planting",    dose: "FYM 20 kg + SSP 250 g + MOP 250 g per pit" },
      { time: "Monthly",        dose: "Urea 100 g + MOP 100 g per plant per month" },
      { time: "Total per year", dose: "N: 200 g, P: 100 g, K: 200 g per plant" },
    ], links: S("fertilizer", ["bh", "if", "as"]) },
    pestManagement: [
      { pest: "Papaya Mosaic Virus", type: "Disease", sign: "Mosaic pattern on leaves, distorted fruits", action: "Control aphid vector with Imidacloprid. Remove infected plants." },
      { pest: "Powdery Mildew",      type: "Disease", sign: "White powder on leaves",                    action: "Spray Wettable Sulphur 80 WP @ 2 g/L." },
      { pest: "Fruit Fly",           type: "Pest",    sign: "Maggots inside fruit",                      action: "Use protein hydrolysate bait traps." },
    ],
    harvesting: { title: "Harvesting", steps: [
      "Harvest for fresh market when 1–2 yellow stripes appear on fruit.",
      "Harvest for processing (papain extraction) when fruit is fully mature green.",
      "Cut with 2–3 cm stalk. Handle carefully.",
      "Expected yield: 40–60 t/ha.",
    ]},
    postHarvest: { title: "Post-Harvest", steps: [
      "Store at 10–13°C for 1–2 weeks.",
      "Grade by size and ripeness.",
      "Value addition: Papain enzyme extraction — premium price.",
    ]},
    selling: { title: "Where to Sell", options: [
      "APMC mandi — check Agmarknet for daily prices.",
      "Papain extraction units — premium price for green papaya.",
      "Supermarkets and retail chains.",
    ], links: MKT },
    schemes: SCH,
    seedLinks: S("seeds", ["bh", "dh", "as"]),
    pesticideLinks: S("pesticide", ["bh", "as"]),
    tips: [
      "Use gynodioecious varieties (Red Lady, CO-7) — all plants bear fruit.",
      "Plant on raised beds in heavy soils to prevent waterlogging.",
      "Papain extraction from green papaya gives 3–4× higher income than fresh fruit.",
    ],
    readAloudText: "Papaya is a fast-growing fruit crop that bears fruit within 9 to 12 months. Plant seedlings at 1.8 by 1.8 metre spacing on raised beds. Install drip irrigation. Apply fertilizers monthly. Watch for papaya mosaic virus — control aphids. Harvest when 1 to 2 yellow stripes appear on fruit. Sell at APMC mandi or to papain extraction units for premium price.",
  },

  // ── COCONUT ───────────────────────────────────────────────────────────────
  coconut: {
    name: "Coconut", emoji: "🥥",
    tagline: "Tree of life — every part is useful, year-round income.",
    overview: "Coconut (Cocos nucifera) is grown on 2.1 million hectares in India. Major states: Kerala, Karnataka, Tamil Nadu, AP, Odisha. It is a perennial crop with 60–80 year productive life. Every part of the tree has commercial value.",
    soilPrep: { title: "Land Preparation", steps: [
      "Dig pits of 1×1×1 m at planting spacing.",
      "Fill pits with topsoil + 50 kg FYM + 2 kg SSP + 500 g Neem cake.",
      "Ideal soil: Well-drained sandy loam to laterite. pH 5.5–8.0.",
      "Coconut tolerates saline soils — suitable for coastal areas.",
    ]},
    varieties: [
      { name: "West Coast Tall",  type: "Tall",   duration: "6–8 years to bearing", yield: "80–100 nuts/palm/year", note: "Most popular, long productive life" },
      { name: "Chowghat Orange Dwarf", type: "Dwarf", duration: "3–4 years to bearing", yield: "70–80 nuts/palm/year", note: "Early bearing, tender coconut" },
      { name: "D×T Hybrid",       type: "Hybrid", duration: "4–5 years to bearing", yield: "150–200 nuts/palm/year", note: "High yield, recommended for commercial planting" },
    ],
    sowing: { title: "Planting", steps: [
      "Plant seedlings (9–12 months old) from certified nurseries.",
      "Spacing: 7.5×7.5 m triangular or 8×8 m square.",
      "Best planting time: June–July (onset of monsoon).",
      "Intercrop with banana, cocoa, or vegetables in young orchards.",
    ]},
    irrigation: { title: "Irrigation", steps: [
      "Coconut requires 1500–2000 mm water per year.",
      "Drip irrigation: 40–200 litres/palm/day depending on age and season.",
      "Basin irrigation: 200 litres/palm every 3–4 days in summer.",
      "Avoid water stress during nut development.",
    ]},
    fertilizer: { title: "Fertilizer (per palm/year)", schedule: [
      { time: "Young palms (1–3 years)", dose: "N: 100–300 g, P: 40–120 g, K: 200–600 g (increase each year)" },
      { time: "Bearing palms",           dose: "N: 1000 g, P: 400 g, K: 2000 g per palm per year" },
      { time: "Application timing",      dose: "Split in 2: May–June and September–October" },
      { time: "Micronutrients",          dose: "Borax 50 g/palm/year for better nut set" },
    ], links: S("fertilizer", ["bh", "if", "as"]) },
    pestManagement: [
      { pest: "Rhinoceros Beetle",  type: "Pest",    sign: "V-shaped cuts on fronds, holes in crown", action: "Apply Naphthalene balls in crown. Use pheromone traps." },
      { pest: "Red Palm Weevil",    type: "Pest",    sign: "Oozing from trunk, wilting crown",         action: "Inject Chlorpyrifos 20 EC @ 5 ml/L into holes. Use pheromone traps." },
      { pest: "Bud Rot",            type: "Disease", sign: "Rotting of crown bud, foul smell",         action: "Remove infected tissue. Apply Bordeaux mixture." },
    ],
    harvesting: { title: "Harvesting", steps: [
      "Harvest tender coconuts at 7–8 months for water.",
      "Harvest mature nuts at 11–12 months for copra and oil.",
      "Harvest every 45–60 days using trained climbers or mechanical harvesters.",
      "Expected yield: 80–200 nuts/palm/year; 8–20 t/ha.",
    ]},
    postHarvest: { title: "Post-Harvest", steps: [
      "Tender coconuts: sell fresh within 1–2 weeks.",
      "Mature nuts: process into copra (dried kernel) for oil extraction.",
      "Value addition: coconut oil, coconut milk, desiccated coconut, coir.",
    ]},
    selling: { title: "Where to Sell", options: [
      "Coconut Development Board procurement centres.",
      "Oil mills for copra.",
      "Tender coconut vendors — high demand in summer.",
      "Export: desiccated coconut, coconut oil — contact APEDA.",
    ], links: MKT },
    schemes: SCH,
    seedLinks: S("seeds", ["bh", "dh"]),
    pesticideLinks: S("pesticide", ["bh", "as"]),
    tips: [
      "Use D×T hybrid varieties for 2× higher yield than tall varieties.",
      "Intercrop with banana or cocoa in young orchards for additional income.",
      "Pheromone traps for rhinoceros beetle and red palm weevil are essential.",
      "Coconut Development Board provides subsidies for drip irrigation installation.",
    ],
    readAloudText: "Coconut is a perennial tree crop with 60 to 80 year productive life. Plant seedlings at 7.5 by 7.5 metre spacing. Install drip irrigation — coconut needs 40 to 200 litres per palm per day. Apply potassium-rich fertilizer — 2 kilograms per palm per year. Watch for rhinoceros beetle and red palm weevil — use pheromone traps. Harvest tender coconuts at 7 to 8 months and mature nuts at 11 to 12 months. Sell to oil mills or tender coconut vendors.",
  },

  // ── POMEGRANATE ───────────────────────────────────────────────────────────
  pomegranate: {
    name: "Pomegranate", emoji: "🍎",
    tagline: "Drought-tolerant fruit with premium export value.",
    overview: "Pomegranate (Punica granatum) is grown on 0.25 million hectares in India. Major states: Maharashtra, Karnataka, Gujarat, AP, Rajasthan. It is drought-tolerant once established and has strong export demand to Middle East and Europe.",
    soilPrep: { title: "Land Preparation", steps: [
      "Dig pits of 60×60×60 cm at planting spacing.",
      "Fill pits with topsoil + 20 kg FYM + 500 g SSP + 250 g Neem cake.",
      "Ideal soil: Well-drained loamy to sandy loam. pH 5.5–7.5.",
      "Pomegranate tolerates slightly alkaline and saline soils.",
    ]},
    varieties: [
      { name: "Bhagwa",       type: "Commercial", duration: "5–7 months", yield: "20–25 t/ha", note: "Most popular export variety, deep red arils" },
      { name: "Ganesh",       type: "Commercial", duration: "5–7 months", yield: "15–20 t/ha", note: "Maharashtra — good for domestic market" },
      { name: "Mridula",      type: "Commercial", duration: "5–7 months", yield: "18–22 t/ha", note: "Soft seeds, premium price" },
    ],
    sowing: { title: "Planting", steps: [
      "Plant rooted cuttings or air-layered plants from certified nurseries.",
      "Spacing: 5×3 m or 4.5×3 m. High-density: 3×2 m.",
      "Best planting time: June–July or February–March.",
    ]},
    irrigation: { title: "Irrigation", steps: [
      "Drip irrigation: 20–40 litres/plant/day in summer.",
      "Withhold irrigation 4–6 weeks before flowering to induce stress.",
      "Resume irrigation at fruit set. Maintain uniform moisture during fruit development.",
      "Irregular irrigation causes fruit cracking.",
    ]},
    fertilizer: { title: "Fertilizer (per plant/year)", schedule: [
      { time: "Young plants (1–2 years)", dose: "N: 100–200 g, P: 50–100 g, K: 100–200 g" },
      { time: "Bearing plants",           dose: "N: 625 g, P: 250 g, K: 375 g per plant per year" },
      { time: "Application timing",       dose: "Split in 3: pre-flowering, fruit set, post-harvest" },
    ], links: S("fertilizer", ["bh", "if", "as"]) },
    pestManagement: [
      { pest: "Fruit Borer (Deudorix)",  type: "Pest",    sign: "Holes in fruit, frass, premature drop", action: "Spray Indoxacarb 14.5 SC @ 1 ml/L at fruit set." },
      { pest: "Bacterial Blight",        type: "Disease", sign: "Water-soaked lesions on leaves/fruits", action: "Spray Copper Oxychloride 50 WP @ 3 g/L." },
      { pest: "Cercospora Fruit Spot",   type: "Disease", sign: "Dark spots on fruit surface",           action: "Spray Mancozeb 75 WP @ 2 g/L." },
    ],
    harvesting: { title: "Harvesting", steps: [
      "Harvest when fruit develops full colour and metallic sound when tapped (5–7 months after fruit set).",
      "Cut with 2–3 cm stalk. Handle carefully to avoid bruising.",
      "Expected yield: 15–25 t/ha.",
    ]},
    postHarvest: { title: "Post-Harvest", steps: [
      "Grade by size, colour, and weight.",
      "Store at 5–8°C for 2–3 months.",
      "Pack in corrugated boxes for export.",
    ]},
    selling: { title: "Where to Sell", options: [
      "Export to Middle East and Europe — contact APEDA for registration.",
      "Domestic supermarkets and retail chains.",
      "Juice processing units — pomegranate juice has premium price.",
      "APMC mandi — check Agmarknet for daily prices.",
    ], links: MKT },
    schemes: SCH,
    seedLinks: S("seeds", ["bh", "dh"]),
    pesticideLinks: S("pesticide", ["bh", "as"]),
    tips: [
      "Bhagwa variety has GI tag — use it for premium export pricing.",
      "Maintain uniform soil moisture during fruit development to prevent cracking.",
      "Bag fruits with paper bags to prevent fruit borer and improve colour.",
      "Register with APEDA for export — premium prices for Bhagwa pomegranate.",
    ],
    readAloudText: "Pomegranate is a drought-tolerant fruit crop. Plant rooted cuttings at 5 by 3 metre spacing. Install drip irrigation. Withhold irrigation before flowering to induce stress. Apply fertilizers in three splits. Watch for fruit borer — spray Indoxacarb at fruit set. Harvest when fruit develops full colour and metallic sound when tapped. Grade and pack carefully. Sell to exporters or domestic supermarkets for premium price.",
  },

  // ── COFFEE ────────────────────────────────────────────────────────────────
  coffee: {
    name: "Coffee", emoji: "☕",
    tagline: "Premium plantation crop — India's coffee is world-renowned.",
    overview: "Coffee (Coffea arabica/canephora) is grown on 0.45 million hectares in India. Major states: Karnataka (Coorg), Kerala, Tamil Nadu. India produces Arabica and Robusta varieties. Indian coffee is exported to Italy, Germany, and Russia.",
    soilPrep: { title: "Land Preparation", steps: [
      "Dig pits of 60×60×60 cm at planting spacing.",
      "Fill pits with topsoil + 20 kg FYM + 250 g SSP + 100 g Neem cake.",
      "Ideal soil: Well-drained loamy soil with high organic matter. pH 6.0–6.5.",
      "Coffee needs shade — plant shade trees (silver oak, Grevillea) before coffee.",
    ]},
    varieties: [
      { name: "Cauvery (Catimor)", type: "Arabica", duration: "3–4 years to bearing", yield: "1.5–2 t/ha", note: "Disease resistant, most popular" },
      { name: "Selection-9",       type: "Arabica", duration: "3–4 years to bearing", yield: "1.5–2 t/ha", note: "High quality, premium price" },
      { name: "CxR",               type: "Robusta", duration: "3–4 years to bearing", yield: "2–3 t/ha",   note: "High yield, used for instant coffee" },
    ],
    sowing: { title: "Planting", steps: [
      "Raise seedlings in nursery for 12–18 months before transplanting.",
      "Spacing: 2.7×2.7 m for Arabica; 3×3 m for Robusta.",
      "Best planting time: June–July (onset of monsoon).",
      "Plant shade trees 1–2 years before coffee planting.",
    ]},
    irrigation: { title: "Irrigation", steps: [
      "Coffee requires 1500–2000 mm rainfall or equivalent irrigation.",
      "Drip irrigation: 10–20 litres/plant/day in summer.",
      "Critical: blossom showers (February–March) for uniform flowering.",
      "Blossom irrigation: 25–30 mm water after dry spell to trigger flowering.",
    ]},
    fertilizer: { title: "Fertilizer (per ha/year)", schedule: [
      { time: "Pre-blossom (February)", dose: "N: 40 kg/ha + P: 20 kg/ha + K: 40 kg/ha" },
      { time: "Post-blossom (April)",   dose: "N: 40 kg/ha + K: 40 kg/ha" },
      { time: "Post-harvest (October)", dose: "N: 40 kg/ha + P: 20 kg/ha + K: 40 kg/ha + FYM 5 t/ha" },
      { time: "Total per year",         dose: "N: 80 kg/ha, P: 40 kg/ha, K: 80 kg/ha" },
    ], links: S("fertilizer", ["bh", "if", "as"]) },
    pestManagement: [
      { pest: "White Stem Borer",    type: "Pest",    sign: "Wilting branches, holes in stem",      action: "Inject Chlorpyrifos 20 EC @ 5 ml/L into holes. Remove infested branches." },
      { pest: "Coffee Berry Borer",  type: "Pest",    sign: "Holes in berries, premature drop",     action: "Spray Endosulfan 35 EC @ 2 ml/L. Use pheromone traps." },
      { pest: "Leaf Rust",           type: "Disease", sign: "Orange powdery spots on lower leaves", action: "Spray Copper Oxychloride 50 WP @ 3 g/L." },
    ],
    harvesting: { title: "Harvesting", steps: [
      "Harvest when berries turn bright red (November–February).",
      "Selective picking: pick only ripe red berries. Repeat every 10–15 days.",
      "Strip picking: strip all berries at once — lower quality but faster.",
      "Expected yield: 1.5–3 t/ha clean coffee.",
    ]},
    postHarvest: { title: "Post-Harvest Processing", steps: [
      "Wet processing (washed): pulp berries, ferment 24–48 hours, wash, dry.",
      "Dry processing (natural): dry whole berries in sun for 3–4 weeks.",
      "Hull dried coffee to remove parchment. Grade by size and density.",
      "Store in jute bags in cool, dry place.",
    ]},
    selling: { title: "Where to Sell", options: [
      "Coffee Board of India — register for procurement and export support.",
      "Export to Italy, Germany, Russia — contact Coffee Board for export registration.",
      "Specialty coffee buyers — premium price for single-origin, traceable coffee.",
      "Direct-to-consumer: farm-to-cup model for maximum income.",
    ], links: MKT },
    schemes: SCH,
    seedLinks: S("seeds", ["bh", "dh"]),
    pesticideLinks: S("pesticide", ["bh", "as"]),
    tips: [
      "Shade management is critical — 30–40% shade increases quality and reduces pest pressure.",
      "Selective picking gives 20–30% premium over strip picking.",
      "Register with Coffee Board for export support and quality certification.",
      "Specialty coffee (single-origin, organic) commands 3–5× premium price.",
    ],
    readAloudText: "Coffee is a premium plantation crop grown in hilly regions. Plant seedlings at 2.7 by 2.7 metre spacing under shade trees. Apply fertilizers in three splits: pre-blossom, post-blossom, and post-harvest. Watch for white stem borer and leaf rust. Harvest when berries turn bright red by selective picking. Process by wet or dry method. Register with Coffee Board for export support. Specialty coffee commands premium prices.",
  },
};

// ── ML label → guide key normalisation ───────────────────────────────────────
// The ML model outputs compact labels (no spaces). Map them to guide keys.
const ML_LABEL_MAP = {
  mothbeans:   "moth beans",
  pigeonpeas:  "pigeon peas",
  kidneybeans: "kidney beans",
  mungbean:    "mung bean",
  blackgram:   "black gram",
};

// ── Lookup function ───────────────────────────────────────────────────────────
export function getCropGuide(cropName) {
  if (!cropName) return null;
  const key = cropName.toLowerCase().trim();
  return CROP_GUIDES[ML_LABEL_MAP[key] || key] || null;
}
