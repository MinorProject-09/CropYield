from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pickle
import numpy as np
from pathlib import Path

app = FastAPI()

# Load model
MODEL_PATH = (Path(__file__).resolve().parent.parent / "model" / "crop_model.pkl").resolve()
if not MODEL_PATH.exists():
    raise RuntimeError(
        f"Missing model file at {MODEL_PATH}. Train it first: `python train.py` (from ml-service/)."
    )

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)


class PredictRequest(BaseModel):
    temperature: float
    humidity: float
    rainfall: float
    ph: float
    N: float
    P: float
    K: float

@app.get("/")
def home():
    return {"message": "ML Service Running"}

@app.post("/predict")
def predict(data: PredictRequest):
    try:
        features = np.array([[
            data.temperature,
            data.humidity,
            data.rainfall,
            data.ph,
            data.N,
            data.P,
            data.K,
        ]])

        # Best class + confidence from probability distribution
        if not hasattr(model, "predict_proba"):
            raise RuntimeError("Loaded model does not support predict_proba() for confidence scoring")

        proba = model.predict_proba(features)[0]
        best_idx = int(np.argmax(proba))
        prediction = model.classes_[best_idx]
        confidence = float(proba[best_idx])

        return {"crop": prediction, "confidence": confidence}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))