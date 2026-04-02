"""
train_yield.py — CropYield AI Yield Estimation Model
=====================================================
The Crop_recommendation.csv has no yield column, so we generate
realistic yield values using agronomic response curves derived from
ICAR / FAO crop production data, then train a GradientBoosting regressor.

Yield is modelled as:
  yield_q_ha = baseline_yield × N_response × P_response × K_response
             × pH_response × temp_response × rain_response × noise

Each response function is a bell-curve (Gaussian) centred on the crop's
optimal value, so yield degrades smoothly as conditions move away from ideal.

Output: model/yield_model.pkl, model/yield_scaler.pkl, model/yield_encoder.pkl

Usage:
  cd ml-service
  python train_yield.py
"""

import pandas as pd
import numpy as np
import pickle
from pathlib import Path

from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

BASE_DIR     = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "Crop_recommendation.csv"
MODEL_DIR    = BASE_DIR / "model"

# ── Baseline yield (quintals/hectare) at ideal conditions ────────────────────
BASELINE = {
    "rice":          25.0,
    "wheat":         32.0,
    "maize":         28.0,
    "chickpea":      10.0,
    "kidneybeans":   12.0,
    "pigeonpeas":     8.0,
    "mothbeans":      5.0,
    "mungbean":       8.0,
    "blackgram":      8.0,
    "lentil":        10.0,
    "pomegranate":   80.0,
    "banana":       250.0,
    "mango":         60.0,
    "grapes":       120.0,
    "watermelon":   200.0,
    "muskmelon":    150.0,
    "apple":        100.0,
    "orange":        90.0,
    "papaya":       200.0,
    "coconut":       80.0,
    "cotton":        15.0,
    "jute":          20.0,
    "coffee":         8.0,
}

# ── Optimal conditions per crop ───────────────────────────────────────────────
# (N_opt, P_opt, K_opt, ph_opt, temp_opt, rain_opt)
OPTIMA = {
    "rice":         (120, 60,  60,  6.5, 27,  220),
    "wheat":        (120, 60,  40,  6.8, 18,  100),
    "maize":        (120, 60,  40,  6.5, 24,  120),
    "chickpea":     ( 20, 60,  40,  7.0, 20,   50),
    "kidneybeans":  ( 30, 60,  40,  6.8, 23,  100),
    "pigeonpeas":   ( 20, 50,  30,  6.5, 27,   90),
    "mothbeans":    ( 15, 30,  20,  7.5, 32,   40),
    "mungbean":     ( 20, 40,  30,  6.7, 30,   80),
    "blackgram":    ( 20, 40,  30,  6.8, 30,   80),
    "lentil":       ( 20, 40,  20,  7.0, 20,   50),
    "pomegranate":  ( 60, 40,  60,  6.5, 32,   50),
    "banana":       (200, 60, 300,  6.3, 30,  200),
    "mango":        (100, 50, 100,  6.5, 31,   90),
    "grapes":       ( 60, 40,  80,  6.8, 25,   80),
    "watermelon":   ( 80, 40,  60,  6.5, 30,   70),
    "muskmelon":    ( 80, 40,  60,  6.5, 30,   70),
    "apple":        ( 60, 30,  60,  6.0, 12,  100),
    "orange":       ( 80, 40,  80,  6.8, 27,  100),
    "papaya":       (100, 50, 100,  6.5, 28,  100),
    "coconut":      (100, 40, 200,  6.5, 30,  200),
    "cotton":       (120, 60,  60,  7.0, 27,  100),
    "jute":         ( 60, 30,  30,  6.8, 30,  200),
    "coffee":       ( 80, 40,  80,  6.3, 22,  150),
}

# Tolerance (sigma) for each feature — how quickly yield drops off
SIGMA = {
    "N":    60,   # kg/ha
    "P":    40,
    "K":    40,
    "ph":    0.8,
    "temp":  6,   # °C
    "rain": 80,   # mm/month
}


def gaussian_response(value, optimum, sigma):
    """Bell-curve response: 1.0 at optimum, decays with distance."""
    return float(np.exp(-0.5 * ((value - optimum) / sigma) ** 2))


def compute_yield(row, crop):
    """Compute yield for one row using agronomic response curves."""
    opt = OPTIMA.get(crop)
    if opt is None:
        return BASELINE.get(crop, 15.0)

    N_opt, P_opt, K_opt, ph_opt, temp_opt, rain_opt = opt
    baseline = BASELINE.get(crop, 15.0)

    # Liebig's law of the minimum — most limiting factor dominates
    responses = [
        gaussian_response(row["N"],           N_opt,    SIGMA["N"]),
        gaussian_response(row["P"],           P_opt,    SIGMA["P"]),
        gaussian_response(row["K"],           K_opt,    SIGMA["K"]),
        gaussian_response(row["ph"],          ph_opt,   SIGMA["ph"]),
        gaussian_response(row["temperature"], temp_opt, SIGMA["temp"]),
        gaussian_response(row["rainfall"],    rain_opt, SIGMA["rain"]),
    ]

    # Weighted geometric mean (avoids single factor collapsing yield to 0)
    weights = [0.20, 0.15, 0.15, 0.20, 0.15, 0.15]
    weighted = sum(w * r for w, r in zip(weights, responses))

    # Add realistic noise (±8%)
    noise = np.random.normal(1.0, 0.08)
    return max(0.5, round(baseline * weighted * noise, 2))


def main():
    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {DATASET_PATH}")

    print("Loading dataset…")
    df = pd.read_csv(DATASET_PATH)
    print(f"  {len(df)} rows, crops: {sorted(df['label'].unique())}")

    # ── Generate yield labels ─────────────────────────────────────────────────
    np.random.seed(42)
    print("Generating yield values from agronomic response curves…")
    df["yield_q_ha"] = df.apply(
        lambda row: compute_yield(row, row["label"]), axis=1
    )

    print(f"  Yield range: {df['yield_q_ha'].min():.1f} – {df['yield_q_ha'].max():.1f} q/ha")
    print(f"  Mean yield by crop:")
    for crop, grp in df.groupby("label"):
        print(f"    {crop:15s}: {grp['yield_q_ha'].mean():.1f} q/ha")

    # ── Encode crop label ─────────────────────────────────────────────────────
    encoder = LabelEncoder()
    df["crop_enc"] = encoder.fit_transform(df["label"])

    # ── Features: crop_enc + soil/climate ─────────────────────────────────────
    FEATURES = ["crop_enc", "N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
    X = df[FEATURES].values
    y = df["yield_q_ha"].values

    # ── Scale ─────────────────────────────────────────────────────────────────
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # ── Train / test split ────────────────────────────────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42
    )
    print(f"\nTrain: {len(X_train)}  |  Test: {len(X_test)}")

    # ── Train GradientBoosting regressor ──────────────────────────────────────
    print("Training GradientBoosting yield model…")
    model = GradientBoostingRegressor(
        n_estimators=300,
        learning_rate=0.05,
        max_depth=5,
        subsample=0.8,
        random_state=42,
    )
    model.fit(X_train, y_train)

    # ── Evaluate ──────────────────────────────────────────────────────────────
    y_pred = model.predict(X_test)
    mae  = mean_absolute_error(y_test, y_pred)
    r2   = r2_score(y_test, y_pred)
    print(f"\nTest MAE : {mae:.2f} q/ha")
    print(f"Test R²  : {r2:.4f}")

    # ── Save ──────────────────────────────────────────────────────────────────
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    with open(MODEL_DIR / "yield_model.pkl",   "wb") as f: pickle.dump(model,   f)
    with open(MODEL_DIR / "yield_scaler.pkl",  "wb") as f: pickle.dump(scaler,  f)
    with open(MODEL_DIR / "yield_encoder.pkl", "wb") as f: pickle.dump(encoder, f)

    print(f"\nSaved:")
    print(f"  {MODEL_DIR}/yield_model.pkl")
    print(f"  {MODEL_DIR}/yield_scaler.pkl")
    print(f"  {MODEL_DIR}/yield_encoder.pkl")
    print("\nDone. Restart the ML service (uvicorn) to load the yield model.")


if __name__ == "__main__":
    main()
