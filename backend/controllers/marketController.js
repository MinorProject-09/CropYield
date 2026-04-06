/**
 * marketController.js
 * Market Intelligence — live mandi prices, best time/place to sell.
 *
 * Data source: data.gov.in Agmarknet API (free, requires API key).
 * Fallback: MSP-based price simulation with seasonal factors when API key not set.
 *
 * Endpoints:
 *   GET /api/market/prices?commodity=rice&state=Punjab
 *   GET /api/market/best-time?commodity=rice
 *   GET /api/market/summary?commodity=rice&state=Punjab
 */

const MSP = {
  rice: 2300, wheat: 2275, maize: 2090, chickpea: 5440,
  "kidney beans": 6700, "pigeon peas": 7550, "moth beans": 8558,
  "mung bean": 8682, "black gram": 7400, lentil: 6425,
  pomegranate: 5000, banana: 1500, mango: 4000, grapes: 6000,
  watermelon: 800, muskmelon: 900, apple: 8000, orange: 3200,
  papaya: 1200, coconut: 3300, cotton: 7121, jute: 5335, coffee: 12000,
};

// Market premium over MSP by crop (open market typically trades above MSP)
const MARKET_PREMIUM = {
  rice: 1.05, wheat: 1.05, maize: 1.10, chickpea: 1.12,
  "kidney beans": 1.15, "pigeon peas": 1.15, "moth beans": 1.18,
  "mung bean": 1.15, "black gram": 1.15, lentil: 1.12,
  pomegranate: 1.25, banana: 1.20, mango: 1.30, grapes: 1.25,
  watermelon: 1.20, muskmelon: 1.20, apple: 1.25, orange: 1.20,
  papaya: 1.18, coconut: 1.15, cotton: 1.10, jute: 1.08, coffee: 1.35,
};

// Seasonal price index by month (1=Jan … 12=Dec) — higher = better price
const SEASONAL_INDEX = {
  rice:         [1.05,1.08,1.10,1.12,1.10,1.05,0.95,0.90,0.88,0.90,0.95,1.00],
  wheat:        [1.10,1.12,1.08,1.00,0.95,0.95,1.00,1.05,1.08,1.10,1.12,1.12],
  maize:        [1.05,1.08,1.10,1.08,1.05,0.95,0.90,0.88,0.90,0.95,1.00,1.02],
  chickpea:     [1.00,1.02,1.05,1.08,1.10,1.12,1.10,1.08,1.05,1.02,1.00,0.98],
  mango:        [0.90,0.90,0.95,1.00,1.20,1.30,1.25,1.10,0.95,0.90,0.88,0.88],
  banana:       [1.05,1.08,1.10,1.12,1.10,1.05,1.00,0.98,0.98,1.00,1.02,1.05],
  tomato:       [1.20,1.15,1.10,1.05,0.90,0.85,0.90,1.00,1.10,1.15,1.20,1.25],
  onion:        [1.00,0.95,0.90,0.88,0.90,1.00,1.10,1.20,1.25,1.20,1.10,1.05],
  potato:       [1.10,1.12,1.10,1.05,1.00,0.95,0.95,1.00,1.05,1.08,1.10,1.12],
};

// Major mandis by state
const MANDIS_BY_STATE = {
  "Punjab":         ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
  "Haryana":        ["Karnal", "Hisar", "Rohtak", "Ambala", "Sirsa"],
  "Uttar Pradesh":  ["Lucknow", "Agra", "Kanpur", "Varanasi", "Meerut"],
  "Maharashtra":    ["Pune", "Nashik", "Nagpur", "Aurangabad", "Kolhapur"],
  "Karnataka":      ["Bangalore", "Mysore", "Hubli", "Belgaum", "Davangere"],
  "Andhra Pradesh": ["Guntur", "Kurnool", "Vijayawada", "Tirupati", "Nellore"],
  "Telangana":      ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain"],
  "Rajasthan":      ["Jaipur", "Jodhpur", "Kota", "Ajmer", "Bikaner"],
  "Gujarat":        ["Ahmedabad", "Surat", "Rajkot", "Vadodara", "Junagadh"],
  "Tamil Nadu":     ["Chennai", "Coimbatore", "Madurai", "Salem", "Trichy"],
  "West Bengal":    ["Kolkata", "Siliguri", "Asansol", "Durgapur", "Howrah"],
  "Bihar":          ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga"],
  "Odisha":         ["Bhubaneswar", "Cuttack", "Berhampur", "Sambalpur"],
  "Kerala":         ["Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur"],
};

async function fetchDataGovIn(commodity, state, apiKey) {
  const base = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";
  const params = new URLSearchParams({
    "api-key": apiKey,
    format: "json",
    limit: "50",
    filters: JSON.stringify({
      commodity: commodity,
      ...(state ? { state } : {}),
    }),
  });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${base}?${params}`, { signal: controller.signal });
    const data = await res.json();
    return { ok: res.ok, data };
  } finally {
    clearTimeout(timer);
  }
}

function simulatePrices(commodity, state) {
  const key = commodity.toLowerCase().trim();
  const msp = MSP[key] || 2000;
  const premium = MARKET_PREMIUM[key] || 1.10;
  const month = new Date().getMonth(); // 0-indexed
  const seasonal = (SEASONAL_INDEX[key] || Array(12).fill(1.0))[month];
  const baseModal = Math.round(msp * premium * seasonal);

  const mandis = MANDIS_BY_STATE[state] || ["Delhi", "Mumbai", "Kolkata", "Chennai", "Hyderabad"];

  return mandis.map((mandi, i) => {
    // Add realistic variation between mandis (±8%)
    const variation = 0.92 + (Math.sin(i * 2.3 + key.charCodeAt(0)) + 1) * 0.08;
    const modal = Math.round(baseModal * variation);
    const min   = Math.round(modal * 0.88);
    const max   = Math.round(modal * 1.12);
    return {
      state:     state || "India",
      district:  mandi,
      market:    `${mandi} APMC`,
      commodity: commodity,
      variety:   "Common",
      min_price: min,
      max_price: max,
      modal_price: modal,
      arrival_date: new Date().toLocaleDateString("en-IN"),
      source: "estimated",
    };
  });
}

// ── GET /api/market/prices ────────────────────────────────────────────────────
exports.getPrices = async (req, res) => {
  try {
    const { commodity = "rice", state = "" } = req.query;
    const apiKey = process.env.DATA_GOV_API_KEY;

    let prices = [];
    let source = "estimated";

    if (apiKey) {
      try {
        const { ok, data } = await fetchDataGovIn(commodity, state, apiKey);
        if (ok && Array.isArray(data?.records) && data.records.length > 0) {
          prices = data.records.map(r => ({
            state:       r.state,
            district:    r.district,
            market:      r.market,
            commodity:   r.commodity,
            variety:     r.variety,
            min_price:   Number(r.min_price),
            max_price:   Number(r.max_price),
            modal_price: Number(r.modal_price),
            arrival_date: r.arrival_date,
            source: "live",
          }));
          source = "live";
        }
      } catch { /* fall through to simulation */ }
    }

    if (!prices.length) {
      prices = simulatePrices(commodity, state);
    }

    // Sort by modal price descending — best price first
    prices.sort((a, b) => b.modal_price - a.modal_price);

    const msp = MSP[commodity.toLowerCase().trim()];
    const avgModal = prices.length
      ? Math.round(prices.reduce((s, p) => s + p.modal_price, 0) / prices.length)
      : null;

    res.json({
      commodity,
      state,
      prices,
      source,
      msp: msp || null,
      avgModal,
      premiumOverMsp: msp && avgModal ? Math.round(((avgModal - msp) / msp) * 100) : null,
      bestMandi: prices[0] || null,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/market/best-time ─────────────────────────────────────────────────
exports.getBestTime = async (req, res) => {
  try {
    const { commodity = "rice" } = req.query;
    const key = commodity.toLowerCase().trim();
    const msp = MSP[key] || 2000;
    const premium = MARKET_PREMIUM[key] || 1.10;
    const seasonal = SEASONAL_INDEX[key] || Array(12).fill(1.0);

    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthlyPrices = seasonal.map((idx, i) => ({
      month: MONTHS[i],
      monthNum: i + 1,
      estimatedPrice: Math.round(msp * premium * idx),
      index: idx,
      isBest: false,
      isWorst: false,
    }));

    const maxIdx = monthlyPrices.reduce((best, m, i) => m.index > monthlyPrices[best].index ? i : best, 0);
    const minIdx = monthlyPrices.reduce((worst, m, i) => m.index < monthlyPrices[worst].index ? i : worst, 0);
    monthlyPrices[maxIdx].isBest  = true;
    monthlyPrices[minIdx].isWorst = true;

    const currentMonth = new Date().getMonth();
    const currentPrice = monthlyPrices[currentMonth];
    const bestMonth    = monthlyPrices[maxIdx];

    res.json({
      commodity,
      msp,
      monthlyPrices,
      bestMonth,
      worstMonth: monthlyPrices[minIdx],
      currentMonth: currentPrice,
      advice: generateSellingAdvice(key, currentMonth, maxIdx, minIdx, msp, currentPrice.estimatedPrice),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

function generateSellingAdvice(crop, currentMonth, bestMonth, worstMonth, msp, currentPrice) {
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const monthsToWait = (bestMonth - currentMonth + 12) % 12;

  if (currentMonth === bestMonth) {
    return `✅ Now is the best time to sell ${crop}! Prices are at their seasonal peak in ${MONTHS[bestMonth]}. Current estimated price ₹${currentPrice}/q is ${Math.round(((currentPrice - msp) / msp) * 100)}% above MSP.`;
  }
  if (monthsToWait <= 2) {
    return `⏳ Wait ${monthsToWait} month(s) — prices peak in ${MONTHS[bestMonth]}. Estimated gain: ₹${Math.round(currentPrice * 0.08)}/q by waiting.`;
  }
  if (currentMonth === worstMonth) {
    return `⚠ Avoid selling now — this is the seasonal low for ${crop}. If you must sell, ensure you get at least MSP (₹${msp}/q) through government procurement.`;
  }
  return `📊 Current price (₹${currentPrice}/q) is ${Math.round(((currentPrice - msp) / msp) * 100)}% above MSP. Best prices expected in ${MONTHS[bestMonth]}.`;
}

// ── GET /api/market/summary ───────────────────────────────────────────────────
exports.getMarketSummary = async (req, res) => {
  try {
    const { commodity = "rice", state = "" } = req.query;
    const [pricesRes, bestTimeRes] = await Promise.allSettled([
      exports.getPrices({ query: { commodity, state } }, { json: d => d }),
      exports.getBestTime({ query: { commodity } }, { json: d => d }),
    ]);
    // Just call both and return combined — handled by frontend calling both endpoints
    res.json({ message: "Use /prices and /best-time endpoints" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
