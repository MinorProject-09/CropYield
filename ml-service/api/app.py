"""
app.py — CropYield AI ML Service
=================================
FastAPI service exposing:
  POST /predict       — crop recommendation + yield estimation
  POST /profit-rank   — rank candidates by net profit analysis
"""

import sys
from pathlib import Path

# Add model directory to path so profit_engine can be imported
MODEL_DIR = (Path(__file__).resolve().parent.parent / "model").resolve()
sys.path.insert(0, str(MODEL_DIR))

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pickle
import numpy as np

# Import profit engine (lives in ml-service/model/profit_engine.py)
try:
    from profit_engine import rank_crops
    print("✅ Profit engine loaded")
except ImportError as e:
    print(f"⚠️  Profit engine import failed: {e}")
    rank_crops = None

app = FastAPI()

# ── Feature order — must match train.py exactly ───────────────────────────────
CROP_FEATURES = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]

# ── Load crop recommendation model ───────────────────────────────────────────
CROP_MODEL_PATH = MODEL_DIR / "crop_model.pkl"
if not CROP_MODEL_PATH.exists():
    raise RuntimeError(
        f"Missing model at {CROP_MODEL_PATH}. Run: python train.py from ml-service/"
    )

with open(CROP_MODEL_PATH, "rb") as f:
    crop_model = pickle.load(f)

if hasattr(crop_model, "feature_names_in_"):
    trained_features = list(crop_model.feature_names_in_)
    if trained_features != CROP_FEATURES:
        raise RuntimeError(
            f"Feature order mismatch!\n"
            f"  Model expects: {trained_features}\n"
            f"  API sends:     {CROP_FEATURES}\n"
            f"Retrain with: python train.py"
        )

print(f"✅ Crop model loaded — {len(crop_model.classes_)} crops: {list(crop_model.classes_)}")

# ── Load yield model + scaler + encoder ──────────────────────────────────────
yield_model   = None
yield_scaler  = None
yield_encoder = None

_yield_paths = [
    MODEL_DIR / "yield_model.pkl",
    MODEL_DIR / "yield_scaler.pkl",
    MODEL_DIR / "yield_encoder.pkl",
]
if all(p.exists() for p in _yield_paths):
    with open(_yield_paths[0], "rb") as f: yield_model   = pickle.load(f)
    with open(_yield_paths[1], "rb") as f: yield_scaler  = pickle.load(f)
    with open(_yield_paths[2], "rb") as f: yield_encoder = pickle.load(f)
    print("✅ Yield model loaded")
else:
    print("⚠️  Yield model not found — run: python train_yield.py")


# ── Request schemas ───────────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float
    farm_size_ha: float = 1.0


class ProfitRankRequest(BaseModel):
    candidates: list        # [{"crop": str, "confidence": float}]
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float
    farm_size_ha: float = 1.0
    duration_days: int = 90   # crop growing duration — affects total production estimate


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/")
def home():
    return {
        "message": "CropYield ML Service Running",
        "crop_model_loaded": True,
        "yield_model_loaded": yield_model is not None,
        "profit_engine_loaded": rank_crops is not None,
        "crops": list(crop_model.classes_),
    }


@app.post("/predict")
def predict(data: PredictRequest):
    try:
        features = np.array([[
            data.N, data.P, data.K,
            data.temperature, data.humidity,
            data.ph, data.rainfall,
        ]])

        if not hasattr(crop_model, "predict_proba"):
            raise RuntimeError("Model does not support predict_proba()")

        proba      = crop_model.predict_proba(features)[0]
        best_idx   = int(np.argmax(proba))
        crop       = str(crop_model.classes_[best_idx])
        confidence = float(proba[best_idx])

        top3_idx = np.argsort(proba)[::-1][:3]
        top3 = [
            {"crop": str(crop_model.classes_[i]), "confidence": round(float(proba[i]), 4)}
            for i in top3_idx
        ]

        yield_data = {"available": False}
        if yield_model is not None and yield_encoder is not None and yield_scaler is not None:
            try:
                if crop in yield_encoder.classes_:
                    crop_enc  = int(yield_encoder.transform([crop])[0])
                    yf        = np.array([[crop_enc, data.N, data.P, data.K,
                                           data.temperature, data.humidity,
                                           data.ph, data.rainfall]])
                    raw_yield = max(0.0, round(float(yield_model.predict(yield_scaler.transform(yf))[0]), 2))
                    farm_size = max(0.01, float(data.farm_size_ha))
                    total_q   = round(raw_yield * farm_size, 2)
                    yield_data = {
                        "available":      True,
                        "yield_q_ha":     raw_yield,
                        "total_yield_q":  total_q,
                        "yield_kg_ha":    round(raw_yield * 100, 2),
                        "total_yield_kg": round(total_q * 100, 2),
                        "farm_size_ha":   farm_size,
                        "unit":           "quintals/hectare",
                        "note": (
                            "Estimated yield based on soil nutrients and climate conditions. "
                            "Actual yield depends on farming practices, irrigation, and pest management."
                        ),
                    }
            except Exception as ye:
                print(f"Yield estimation error: {ye}")

        return {
            "crop":       crop,
            "confidence": round(confidence, 4),
            "top3":       top3,
            "yield":      yield_data,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/profit-rank")
def profit_rank(data: ProfitRankRequest):
    """
    Rank ONLY the ML-recommended candidates by estimated net profit.
    Results are specific to this prediction's soil/climate/farm inputs.
    Does NOT expand to all known crops — only the ML top-3 are ranked.
    """
    if rank_crops is None:
        raise HTTPException(status_code=503, detail="Profit engine not available")

    try:
        farm_size = max(0.01, float(data.farm_size_ha))

        enriched = []
        for c in data.candidates:
            crop_name  = str(c.get("crop", "")).strip().lower()
            confidence = float(c.get("confidence", 0.5))
            if not crop_name:
                continue

            # Try yield model first — it uses actual soil/climate inputs
            yield_q_ha = None
            if yield_model is not None and yield_encoder is not None and yield_scaler is not None:
                try:
                    if crop_name in yield_encoder.classes_:
                        crop_enc   = int(yield_encoder.transform([crop_name])[0])
                        yf         = np.array([[crop_enc, data.N, data.P, data.K,
                                                data.temperature, data.humidity,
                                                data.ph, data.rainfall]])
                        yield_q_ha = max(0.0, round(float(yield_model.predict(yield_scaler.transform(yf))[0]), 2))
                except Exception:
                    pass
            # If no yield model, profit_engine will use suitability-adjusted baseline

            enriched.append({
                "crop":       crop_name,
                "confidence": confidence,
                "yield_q_ha": yield_q_ha,
            })

        if not enriched:
            raise HTTPException(status_code=400, detail="No valid candidates provided")

        ranked = rank_crops(
            enriched,
            farm_size_ha=farm_size,
            top_n=len(enriched),   # rank all candidates, not just top-4
            duration_days=int(data.duration_days),
            N=data.N, P=data.P, K=data.K,
            ph=data.ph,
            temperature=data.temperature,
            rainfall=data.rainfall,
        )
        return {"ranked": ranked, "farm_size_ha": farm_size}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
