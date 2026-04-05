"""
profit_engine.py — Crop Profit Ranking Engine
==============================================
Computes profit analysis for candidate crops using:
  - Historical MSP price series (3-year trend)
  - Yield estimates adjusted by soil/climate suitability scores
  - Input cost models (seed, fertilizer, irrigation, labour, misc)
  - Market price premium factor over MSP
  - Net profit = (yield × market_price) − total_cost

The key fix: yields are NOT static. They are scaled by a suitability score
computed from how well the actual soil/climate inputs match each crop's
ideal growing conditions. This makes rankings vary with different inputs.
"""

import numpy as np
from typing import List, Dict, Optional

# ── Historical MSP data (₹/quintal) — last 4 years ───────────────────────────
HISTORICAL_MSP = {
    "rice":          [1940, 2060, 2183, 2300],
    "wheat":         [2015, 2015, 2275, 2275],
    "maize":         [1870, 1962, 2090, 2090],
    "chickpea":      [5230, 5335, 5440, 5440],
    "kidney beans":  [6000, 6400, 6700, 6700],
    "pigeon peas":   [6300, 6600, 7000, 7550],
    "moth beans":    [6275, 7275, 8558, 8558],
    "mung bean":     [7275, 7755, 8558, 8682],
    "black gram":    [6300, 6600, 6950, 7400],
    "lentil":        [5500, 5500, 6000, 6425],
    "pomegranate":   [4000, 4500, 4750, 5000],
    "banana":        [1200, 1300, 1450, 1500],
    "mango":         [3200, 3500, 3800, 4000],
    "grapes":        [5000, 5500, 5750, 6000],
    "watermelon":    [600,  700,  750,  800],
    "muskmelon":     [700,  800,  850,  900],
    "apple":         [7000, 7500, 7750, 8000],
    "orange":        [2600, 2800, 3000, 3200],
    "papaya":        [900,  1000, 1100, 1200],
    "coconut":       [2700, 2900, 3100, 3300],
    "cotton":        [5726, 6080, 6620, 7121],
    "jute":          [4500, 4750, 5050, 5335],
    "coffee":        [9000, 10000, 11000, 12000],
}

# ── Baseline yield (q/ha) at ideal conditions ─────────────────────────────────
BASELINE_YIELD_Q_HA = {
    "rice":          25.0,
    "wheat":         32.0,
    "maize":         28.0,
    "chickpea":      10.0,
    "kidney beans":  12.0,
    "pigeon peas":   8.0,
    "moth beans":    5.0,
    "mung bean":     8.0,
    "black gram":    8.0,
    "lentil":        10.0,
    "pomegranate":   80.0,
    "banana":        250.0,
    "mango":         60.0,
    "grapes":        120.0,
    "watermelon":    200.0,
    "muskmelon":     150.0,
    "apple":         100.0,
    "orange":        90.0,
    "papaya":        200.0,
    "coconut":       80.0,
    "cotton":        15.0,
    "jute":          20.0,
    "coffee":        8.0,
}

# ── Ideal growing conditions per crop ────────────────────────────────────────
# Format: { crop: { N, P, K, ph_min, ph_max, temp_min, temp_max, rain_min, rain_max } }
# These are agronomic optima from ICAR / FAO crop production guidelines.
CROP_IDEALS = {
    "rice":          {"N": 120, "P": 60,  "K": 60,  "ph": (5.5, 7.0), "temp": (22, 32), "rain": (150, 298)},
    "wheat":         {"N": 120, "P": 60,  "K": 40,  "ph": (6.0, 7.5), "temp": (12, 25), "rain": (50,  150)},
    "maize":         {"N": 120, "P": 60,  "K": 40,  "ph": (5.8, 7.0), "temp": (18, 30), "rain": (60,  180)},
    "chickpea":      {"N": 20,  "P": 60,  "K": 40,  "ph": (6.0, 8.0), "temp": (15, 25), "rain": (20,  80)},
    "kidney beans":  {"N": 30,  "P": 60,  "K": 40,  "ph": (6.0, 7.5), "temp": (18, 28), "rain": (60,  150)},
    "pigeon peas":   {"N": 20,  "P": 50,  "K": 30,  "ph": (5.0, 7.5), "temp": (20, 35), "rain": (40,  150)},
    "moth beans":    {"N": 15,  "P": 30,  "K": 20,  "ph": (7.0, 8.5), "temp": (25, 40), "rain": (20,  60)},
    "mung bean":     {"N": 20,  "P": 40,  "K": 30,  "ph": (6.2, 7.2), "temp": (25, 35), "rain": (40,  120)},
    "black gram":    {"N": 20,  "P": 40,  "K": 30,  "ph": (6.0, 7.5), "temp": (25, 35), "rain": (40,  120)},
    "lentil":        {"N": 20,  "P": 40,  "K": 20,  "ph": (6.0, 8.0), "temp": (15, 25), "rain": (20,  80)},
    "pomegranate":   {"N": 60,  "P": 40,  "K": 60,  "ph": (5.5, 7.5), "temp": (25, 38), "rain": (20,  80)},
    "banana":        {"N": 200, "P": 60,  "K": 300, "ph": (5.5, 7.0), "temp": (25, 35), "rain": (100, 298)},
    "mango":         {"N": 100, "P": 50,  "K": 100, "ph": (5.5, 7.5), "temp": (24, 38), "rain": (40,  150)},
    "grapes":        {"N": 60,  "P": 40,  "K": 80,  "ph": (6.0, 7.5), "temp": (15, 35), "rain": (40,  120)},
    "watermelon":    {"N": 80,  "P": 40,  "K": 60,  "ph": (6.0, 7.0), "temp": (25, 35), "rain": (40,  100)},
    "muskmelon":     {"N": 80,  "P": 40,  "K": 60,  "ph": (6.0, 7.0), "temp": (25, 35), "rain": (40,  100)},
    "apple":         {"N": 60,  "P": 30,  "K": 60,  "ph": (5.5, 6.5), "temp": (5,  20), "rain": (60,  150)},
    "orange":        {"N": 80,  "P": 40,  "K": 80,  "ph": (6.0, 7.5), "temp": (20, 35), "rain": (60,  150)},
    "papaya":        {"N": 100, "P": 50,  "K": 100, "ph": (6.0, 7.0), "temp": (22, 35), "rain": (60,  150)},
    "coconut":       {"N": 100, "P": 40,  "K": 200, "ph": (5.5, 8.0), "temp": (25, 35), "rain": (100, 298)},
    "cotton":        {"N": 120, "P": 60,  "K": 60,  "ph": (5.8, 8.0), "temp": (20, 35), "rain": (60,  150)},
    "jute":          {"N": 60,  "P": 30,  "K": 30,  "ph": (6.0, 7.5), "temp": (25, 35), "rain": (150, 298)},
    "coffee":        {"N": 80,  "P": 40,  "K": 80,  "ph": (6.0, 6.5), "temp": (15, 28), "rain": (100, 200)},
}

# ── Input cost per hectare (₹) ────────────────────────────────────────────────
INPUT_COSTS = {
    "rice":          {"seed": 2500,  "fertilizer": 8000,  "irrigation": 6000,  "labour": 15000, "misc": 4000},
    "wheat":         {"seed": 3000,  "fertilizer": 7000,  "irrigation": 5000,  "labour": 12000, "misc": 3500},
    "maize":         {"seed": 2000,  "fertilizer": 6000,  "irrigation": 4000,  "labour": 10000, "misc": 3000},
    "chickpea":      {"seed": 2500,  "fertilizer": 3000,  "irrigation": 2000,  "labour": 8000,  "misc": 2000},
    "kidney beans":  {"seed": 3000,  "fertilizer": 4000,  "irrigation": 3000,  "labour": 9000,  "misc": 2500},
    "pigeon peas":   {"seed": 2000,  "fertilizer": 3000,  "irrigation": 1500,  "labour": 8000,  "misc": 2000},
    "moth beans":    {"seed": 1500,  "fertilizer": 2000,  "irrigation": 1000,  "labour": 6000,  "misc": 1500},
    "mung bean":     {"seed": 2000,  "fertilizer": 3000,  "irrigation": 2000,  "labour": 7000,  "misc": 2000},
    "black gram":    {"seed": 2000,  "fertilizer": 3000,  "irrigation": 2000,  "labour": 7000,  "misc": 2000},
    "lentil":        {"seed": 2500,  "fertilizer": 3500,  "irrigation": 2000,  "labour": 8000,  "misc": 2000},
    "pomegranate":   {"seed": 5000,  "fertilizer": 12000, "irrigation": 8000,  "labour": 20000, "misc": 6000},
    "banana":        {"seed": 8000,  "fertilizer": 15000, "irrigation": 12000, "labour": 25000, "misc": 8000},
    "mango":         {"seed": 4000,  "fertilizer": 8000,  "irrigation": 5000,  "labour": 15000, "misc": 5000},
    "grapes":        {"seed": 6000,  "fertilizer": 14000, "irrigation": 10000, "labour": 22000, "misc": 7000},
    "watermelon":    {"seed": 3000,  "fertilizer": 6000,  "irrigation": 5000,  "labour": 12000, "misc": 3500},
    "muskmelon":     {"seed": 3000,  "fertilizer": 6000,  "irrigation": 5000,  "labour": 12000, "misc": 3500},
    "apple":         {"seed": 5000,  "fertilizer": 12000, "irrigation": 8000,  "labour": 20000, "misc": 6000},
    "orange":        {"seed": 4000,  "fertilizer": 10000, "irrigation": 7000,  "labour": 18000, "misc": 5000},
    "papaya":        {"seed": 3000,  "fertilizer": 8000,  "irrigation": 6000,  "labour": 14000, "misc": 4000},
    "coconut":       {"seed": 4000,  "fertilizer": 8000,  "irrigation": 6000,  "labour": 12000, "misc": 4000},
    "cotton":        {"seed": 3500,  "fertilizer": 9000,  "irrigation": 6000,  "labour": 18000, "misc": 5000},
    "jute":          {"seed": 2000,  "fertilizer": 5000,  "irrigation": 4000,  "labour": 12000, "misc": 3000},
    "coffee":        {"seed": 5000,  "fertilizer": 10000, "irrigation": 7000,  "labour": 20000, "misc": 6000},
}

MARKET_PREMIUM = {
    "rice": 1.05, "wheat": 1.05, "maize": 1.10, "chickpea": 1.12,
    "kidney beans": 1.15, "pigeon peas": 1.15, "moth beans": 1.18,
    "mung bean": 1.15, "black gram": 1.15, "lentil": 1.12,
    "pomegranate": 1.25, "banana": 1.20, "mango": 1.30, "grapes": 1.25,
    "watermelon": 1.20, "muskmelon": 1.20, "apple": 1.25, "orange": 1.20,
    "papaya": 1.18, "coconut": 1.15, "cotton": 1.10, "jute": 1.08, "coffee": 1.35,
}


def _cagr(prices: list) -> float:
    if len(prices) < 2 or prices[0] <= 0:
        return 0.05
    return (prices[-1] / prices[0]) ** (1 / (len(prices) - 1)) - 1


def _range_score(value: float, lo: float, hi: float) -> float:
    """
    Returns 1.0 if value is within [lo, hi].
    Decays linearly to 0.3 outside the range (never fully 0 — crop can still grow).
    """
    if lo <= value <= hi:
        return 1.0
    span = hi - lo if hi > lo else 1.0
    if value < lo:
        gap = (lo - value) / span
    else:
        gap = (value - hi) / span
    return max(0.3, 1.0 - gap * 0.7)


def compute_suitability(
    crop: str,
    N: float, P: float, K: float,
    ph: float, temperature: float, rainfall: float,
) -> float:
    """
    Returns a suitability multiplier in [0.3, 1.0] based on how well
    the actual soil/climate conditions match the crop's ideal requirements.
    This is what makes rankings vary with different inputs.
    """
    ideals = CROP_IDEALS.get(crop.lower().strip())
    if ideals is None:
        return 0.7  # unknown crop — neutral score

    scores = [
        _range_score(N,           ideals["N"] * 0.5, ideals["N"] * 1.5),
        _range_score(P,           ideals["P"] * 0.5, ideals["P"] * 1.5),
        _range_score(K,           ideals["K"] * 0.5, ideals["K"] * 1.5),
        _range_score(ph,          ideals["ph"][0],    ideals["ph"][1]),
        _range_score(temperature, ideals["temp"][0],  ideals["temp"][1]),
        _range_score(rainfall,    ideals["rain"][0],  ideals["rain"][1]),
    ]

    # Weighted: pH and temperature are most critical
    weights = [0.15, 0.10, 0.10, 0.25, 0.25, 0.15]
    return round(sum(s * w for s, w in zip(scores, weights)), 4)


def compute_profit_analysis(
    crop: str,
    yield_q_ha: Optional[float],
    farm_size_ha: float = 1.0,
    confidence: float = 1.0,
    duration_days: int = 90,
    # Soil/climate inputs — used to compute suitability-adjusted yield
    N: float = 90, P: float = 45, K: float = 45,
    ph: float = 6.5, temperature: float = 25.0, rainfall: float = 100.0,
) -> Optional[Dict]:
    key = crop.lower().strip()

    msp_series = HISTORICAL_MSP.get(key)
    if msp_series is None:
        return None

    # ── Suitability-adjusted yield ────────────────────────────────────────────
    suitability = compute_suitability(key, N, P, K, ph, temperature, rainfall)

    if yield_q_ha and yield_q_ha > 0:
        # Yield model gave us q/ha — scale by duration factor
        # Standard crop duration is ~90 days; longer duration = proportionally more yield
        duration_factor = max(0.5, min(2.0, duration_days / 90.0))
        yld = round(yield_q_ha * duration_factor, 2)
    else:
        # No yield model — use suitability-adjusted baseline, also scaled by duration
        baseline = BASELINE_YIELD_Q_HA.get(key, 15.0)
        duration_factor = max(0.5, min(2.0, duration_days / 90.0))
        yld = round(baseline * suitability * duration_factor, 2)

    # ── Cost ──────────────────────────────────────────────────────────────────
    costs = INPUT_COSTS.get(key, {"seed": 3000, "fertilizer": 6000,
                                   "irrigation": 4000, "labour": 12000, "misc": 3000})
    total_cost_ha = sum(costs.values())
    total_cost = round(total_cost_ha * farm_size_ha)

    # ── Prices ────────────────────────────────────────────────────────────────
    msp_prev    = msp_series[-2] if len(msp_series) >= 2 else msp_series[-1]
    msp_current = msp_series[-1]
    cagr        = _cagr(msp_series)
    msp_proj    = round(msp_current * (1 + cagr))

    premium        = MARKET_PREMIUM.get(key, 1.10)
    market_prev    = round(msp_prev    * premium)
    market_current = round(msp_current * premium)
    market_proj    = round(msp_proj    * premium)

    # ── Revenue & profit ──────────────────────────────────────────────────────
    total_yield    = round(yld * farm_size_ha, 2)   # quintals produced on the farm
    total_yield_kg = round(total_yield * 100, 2)

    rev_prev    = round(total_yield * market_prev)
    rev_current = round(total_yield * market_current)
    rev_proj    = round(total_yield * market_proj)

    profit_prev    = rev_prev    - total_cost
    profit_current = rev_current - total_cost
    profit_proj    = rev_proj    - total_cost

    roi         = round((profit_current / total_cost) * 100, 1) if total_cost > 0 else 0.0
    price_trend = round(((msp_current - msp_prev) / msp_prev) * 100, 1) if msp_prev > 0 else 0.0

    return {
        "crop":                   crop,
        "confidence":             round(confidence, 4),
        "suitability_score":      suitability,
        "yield_q_ha":             yld,
        "total_yield_q":          total_yield,
        "total_yield_kg":         total_yield_kg,
        "farm_size_ha":           farm_size_ha,
        "duration_days":          duration_days,
        "cost_breakdown":         {k: round(v * farm_size_ha) for k, v in costs.items()},
        "total_cost_ha":          total_cost_ha,
        "total_cost":             total_cost,
        "msp_prev":               msp_prev,
        "msp_current":            msp_current,
        "msp_projected":          msp_proj,
        "market_price_prev":      market_prev,
        "market_price_current":   market_current,
        "market_price_projected": market_proj,
        "revenue_prev":           rev_prev,
        "revenue_current":        rev_current,
        "revenue_projected":      rev_proj,
        "profit_prev":            profit_prev,
        "profit_current":         profit_current,
        "profit_projected":       profit_proj,
        "roi_pct":                roi,
        "price_trend_pct":        price_trend,
        "cagr_pct":               round(cagr * 100, 1),
    }


def rank_crops(
    candidates: List[Dict],
    farm_size_ha: float = 1.0,
    top_n: int = 4,
    duration_days: int = 90,
    N: float = 90, P: float = 45, K: float = 45,
    ph: float = 6.5, temperature: float = 25.0, rainfall: float = 100.0,
) -> List[Dict]:
    """
    Rank candidate crops by composite score:
      40% suitability (soil/climate match)
      30% normalised net profit
      15% normalised ROI
      10% ML confidence
       5% price trend
    """
    analyses = []
    for c in candidates:
        result = compute_profit_analysis(
            crop=c["crop"],
            yield_q_ha=c.get("yield_q_ha"),
            farm_size_ha=farm_size_ha,
            confidence=c.get("confidence", 1.0),
            duration_days=duration_days,
            N=N, P=P, K=K, ph=ph,
            temperature=temperature, rainfall=rainfall,
        )
        if result:
            analyses.append(result)

    if not analyses:
        return []

    def norm(values):
        mn, mx = min(values), max(values)
        if mx == mn:
            return [1.0] * len(values)
        return [(v - mn) / (mx - mn) for v in values]

    suits   = norm([a["suitability_score"] for a in analyses])
    profits = norm([a["profit_current"]    for a in analyses])
    rois    = norm([a["roi_pct"]           for a in analyses])
    confs   = norm([a["confidence"]        for a in analyses])
    trends  = norm([a["price_trend_pct"]   for a in analyses])

    for i, a in enumerate(analyses):
        a["score"] = round(
            0.40 * suits[i]   +
            0.30 * profits[i] +
            0.15 * rois[i]    +
            0.10 * confs[i]   +
            0.05 * trends[i],
            4
        )

    analyses.sort(key=lambda x: x["score"], reverse=True)

    for rank, a in enumerate(analyses[:top_n], start=1):
        a["rank"] = rank

    return analyses[:top_n]
