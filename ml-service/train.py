import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import pickle
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "Crop_recommendation.csv"
MODEL_DIR = BASE_DIR / "model"
MODEL_PATH = MODEL_DIR / "crop_model.pkl"

if not DATASET_PATH.exists():
  raise FileNotFoundError(
    f"Dataset not found at {DATASET_PATH}. Add Crop_recommendation.csv to ml-service/."
  )

# Load dataset
df = pd.read_csv(DATASET_PATH)

# Features & label
X = df[["temperature", "humidity", "rainfall", "ph", "N", "P", "K"]]
y = df["label"]

# Train-test split (80-20)
X_train, X_test, y_train, y_test = train_test_split(
  X, y, test_size=0.2, random_state=42
)

# Model
model = RandomForestClassifier(n_estimators=200, random_state=42)

# Train
model.fit(X_train, y_train)

# Predict on test set
y_pred = model.predict(X_test)

# Evaluate
accuracy = accuracy_score(y_test, y_pred)
print(f"Model Accuracy: {accuracy * 100:.2f}%")

# Save model
MODEL_DIR.mkdir(parents=True, exist_ok=True)
with open(MODEL_PATH, "wb") as f:
  pickle.dump(model, f)

print(f"Model trained and saved at {MODEL_PATH}")
