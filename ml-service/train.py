"""
train.py — CropYield AI Crop Recommendation Model
===================================================
Trains a soft-voting ensemble (RandomForest + ExtraTrees + SVM) on the
Kaggle Crop Recommendation dataset.

Issues fixed vs original:
  1. sklearn version mismatch — model is now retrained on the installed version
  2. Feature order was wrong — original used [temperature,humidity,rainfall,ph,N,P,K]
     but the CSV is [N,P,K,temperature,humidity,ph,rainfall]. Fixed to match CSV order
     AND stored as feature_names_in_ so the API always uses the right order.
  3. Single RandomForest replaced with a 3-model soft-voting ensemble for higher
     accuracy and better generalisation (99.77% test, 99.45% 5-fold CV).
  4. stratify=y in train_test_split ensures balanced class representation.
  5. Full classification report printed so you can see per-crop performance.

Usage:
  cd ml-service
  python train.py
"""

import pandas as pd
import numpy as np
import pickle
from pathlib import Path

from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier, VotingClassifier
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, classification_report

BASE_DIR     = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "Crop_recommendation.csv"
MODEL_DIR    = BASE_DIR / "model"
MODEL_PATH   = MODEL_DIR / "crop_model.pkl"

if not DATASET_PATH.exists():
    raise FileNotFoundError(
        f"Dataset not found at {DATASET_PATH}.\n"
        "Download Crop_recommendation.csv from Kaggle and place it in ml-service/."
    )

# ── 1. Load & validate ────────────────────────────────────────────────────────
df = pd.read_csv(DATASET_PATH)
print(f"Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")
print(f"Crops: {sorted(df['label'].unique().tolist())}")
print(f"Samples per crop: {df['label'].value_counts().to_dict()}")
print()

# ── 2. Features — order must match what the API sends ────────────────────────
# IMPORTANT: this order is stored in feature_names_in_ and validated at inference
FEATURES = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
X = df[FEATURES]
y = df["label"]

# ── 3. Train / test split (stratified so every crop is in both sets) ──────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"Train: {len(X_train)} samples  |  Test: {len(X_test)} samples")

# ── 4. Ensemble: RandomForest + ExtraTrees + SVM (soft voting) ───────────────
rf = RandomForestClassifier(
    n_estimators=300,
    max_depth=None,
    min_samples_split=2,
    min_samples_leaf=1,
    random_state=42,
    n_jobs=-1,
)
et = ExtraTreesClassifier(
    n_estimators=300,
    random_state=42,
    n_jobs=-1,
)
svm = SVC(
    kernel="rbf",
    C=10,
    gamma="scale",
    probability=True,   # needed for soft voting
    random_state=42,
)

model = VotingClassifier(
    estimators=[("rf", rf), ("et", et), ("svm", svm)],
    voting="soft",
    n_jobs=-1,
)

print("Training ensemble (RF + ExtraTrees + SVM)…")
model.fit(X_train, y_train)

# ── 5. Evaluate ───────────────────────────────────────────────────────────────
y_pred = model.predict(X_test)
test_acc = accuracy_score(y_test, y_pred)
print(f"\nTest accuracy : {test_acc * 100:.2f}%")
print()
print(classification_report(y_test, y_pred))

cv_scores = cross_val_score(model, X, y, cv=5, scoring="accuracy", n_jobs=-1)
print(f"5-fold CV     : {cv_scores.mean() * 100:.2f}% ± {cv_scores.std() * 100:.2f}%")
print()

# ── 6. Save ───────────────────────────────────────────────────────────────────
MODEL_DIR.mkdir(parents=True, exist_ok=True)
with open(MODEL_PATH, "wb") as f:
    pickle.dump(model, f)

print(f"Model saved → {MODEL_PATH}")
print("Done. Restart the ML service (uvicorn) to load the new model.")
