"""
profit_engine.py — Crop Profit Ranking Engine
==============================================
Computes profit analysis for candidate crops using:
  - Historical MSP price series (3-year trend)
  - Yield estimates from the yield model (or fallback averages)
  - Input cost models (seed, fertilizer, irrigation, labour, misc)
  - Market price premium factor over MSP
  - Net profit = (yield × market_price) − total_cost

Returns top-N crops ranked by estimated net profit per hectare.
"""

import numpy as np
from typing import List, Dict, Optional

# ── Historical MSP data (₹/quintal) — last 3 years + current ─────────────────
# Source: CCEA Government of India announcements
# Format: { crop: [2021-22, 2022-23, 2023-24, 2024-25] }
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

# ── Average yield (quintals/hectare) — fallback when yield model unavailable ──
# Based on Indian agricultural statistics (ICAR / FAOSTAT averages)
AVERAGE_YIELD_Q_HA = {
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
    "coconut":       80.0,   # in quintals equivalent
    "cotton":        15.0,
    "jute":          20.0,
    "coffee":        8.0,
}

# ── Input cost per hectare (₹) — seed + fertilizer + irrigation + labour + misc
# Based on CACP (Commission for Agricultural Costs and Prices) cost-A2+FL data
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

# ── Market premium over MSP (open market typically trades above MSP) ──────────
# Factor: 1.0 = at MSP, 1.15 = 15% above MSP
MARKET_PREMIUM = {
    "rice":          1.05,
    "wheat":         1.05,
    "maize":         1.10,
    "chickpea":      1.12,
    "kidney beans":  1.15,
    "pigeon peas":   1.15,
    "moth beans":    1.18,
    "mung bean":     1.15,
    "black gram":    1.15,
    "lentil":        1.12,
    "pomegranate":   1.25,
    "banana":        1.20,
    "mango":         1.30,
    "grapes":        1.25,
    "watermelon":    1.20,
    "muskmelon":     1.20,
    "apple":         1.25,
    "orange":        1.20,
    "papaya":        1.18,
    "coconut":       1.15,
    "cotton":        1.10,
    "jute":          1.08,
    "coffee":        1.35,
}

# ── Annual MSP growth rate (CAGR) used for future projection ─────────────────
def _cagr(prices: list) -> float:
    """Compound annual growth rate from price series."""
    if len(prices) < 2 or prices[0] <= 0:
        return 0.05  # default 5%
    return (prices[-1] / prices[0]) ** (1 / (len(prices) - 1)) - 1


def compute_profit_analysis(
    crop: str,
    yield_q_ha: Optional[float],
    farm_size_ha: float = 1.0,
    confidence: float = 1.0,
) -> Optional[Dict]:
    """
    Returns a profit analysis dict for a single crop.

    Fields returned:
      crop, rank (set by caller), confidence,
      yield_q_ha, farm_size_ha,
      cost_breakdown (dict), total_cost_ha, total_cost,
      msp_current, market_price_current,
      revenue_prev, revenue_current, revenue_projected,
      profit_prev, profit_current, profit_projected,
      roi_pct, price_trend_pct
    """
    key = crop.lower().strip()

    msp_series = HISTORICAL_MSP.get(key)
    if msp_series is None:
        return None

    # Yield — use model output if available, else fallback average
    yld = yield_q_ha if (yield_q_ha and yield_q_ha > 0) else AVERAGE_YIELD_Q_HA.get(key, 15.0)
    yld = round(yld, 2)

    # Cost
    costs = INPUT_COSTS.get(key, {"seed": 3000, "fertilizer": 6000, "irrigation": 4000, "labour": 12000, "misc": 3000})
    total_cost_ha = sum(costs.values())
    total_cost = round(total_cost_ha * farm_size_ha)

    # MSP prices
    msp_prev    = msp_series[-2] if len(msp_series) >= 2 else msp_series[-1]
    msp_current = msp_series[-1]
    cagr        = _cagr(msp_series)
    msp_proj    = round(msp_current * (1 + cagr))

    # Market price = MSP × premium
    premium = MARKET_PREMIUM.get(key, 1.10)
    market_prev    = round(msp_prev    * premium)
    market_current = round(msp_current * premium)
    market_proj    = round(msp_proj    * premium)

    # Revenue (₹) = yield_q_ha × market_price × farm_size_ha
    total_yield = yld * farm_size_ha
    rev_prev    = round(total_yield * market_prev)
    rev_current = round(total_yield * market_current)
    rev_proj    = round(total_yield * market_proj)

    # Profit = revenue − cost
    profit_prev    = rev_prev    - total_cost
    profit_current = rev_current - total_cost
    profit_proj    = rev_proj    - total_cost

    # ROI %
    roi = round((profit_current / total_cost) * 100, 1) if total_cost > 0 else 0.0

    # Price trend % (current vs prev year)
    price_trend = round(((msp_current - msp_prev) / msp_prev) * 100, 1) if msp_prev > 0 else 0.0

    return {
        "crop":              crop,
        "confidence":        round(confidence, 4),
        "yield_q_ha":        yld,
        "farm_size_ha":      farm_size_ha,
        "cost_breakdown":    {k: round(v * farm_size_ha) for k, v in costs.items()},
        "total_cost_ha":     total_cost_ha,
        "total_cost":        total_cost,
        "msp_prev":          msp_prev,
        "msp_current":       msp_current,
        "msp_projected":     msp_proj,
        "market_price_prev": market_prev,
        "market_price_current": market_current,
        "market_price_projected": market_proj,
        "revenue_prev":      rev_prev,
        "revenue_current":   rev_current,
        "revenue_projected": rev_proj,
        "profit_prev":       profit_prev,
        "profit_current":    profit_current,
        "profit_projected":  profit_proj,
        "roi_pct":           roi,
        "price_trend_pct":   price_trend,
        "cagr_pct":          round(cagr * 100, 1),
    }


def rank_crops(
    candidates: List[Dict],   # [{"crop": str, "confidence": float, "yield_q_ha": float|None}]
    farm_size_ha: float = 1.0,
    top_n: int = 4,
) -> List[Dict]:
    """
    Rank candidate crops by a composite score:
      score = 0.5 × normalised_profit_current
            + 0.25 × normalised_roi
            + 0.15 × normalised_confidence
            + 0.10 × normalised_price_trend

    Returns top_n results with rank field added.
    """
    analyses = []
    for c in candidates:
        result = compute_profit_analysis(
            crop=c["crop"],
            yield_q_ha=c.get("yield_q_ha"),
            farm_size_ha=farm_size_ha,
            confidence=c.get("confidence", 1.0),
        )
        if result:
            analyses.append(result)

    if not analyses:
        return []

    # Normalise each metric to [0, 1] for scoring
    def norm(values):
        mn, mx = min(values), max(values)
        if mx == mn:
            return [1.0] * len(values)
        return [(v - mn) / (mx - mn) for v in values]

    profits   = norm([a["profit_current"]  for a in analyses])
    rois      = norm([a["roi_pct"]         for a in analyses])
    confs     = norm([a["confidence"]      for a in analyses])
    trends    = norm([a["price_trend_pct"] for a in analyses])

    for i, a in enumerate(analyses):
        a["score"] = round(
            0.50 * profits[i] +
            0.25 * rois[i]    +
            0.15 * confs[i]   +
            0.10 * trends[i],
            4
        )

    analyses.sort(key=lambda x: x["score"], reverse=True)

    for rank, a in enumerate(analyses[:top_n], start=1):
        a["rank"] = rank

    return analyses[:top_n]
