from fastapi import FastAPI
import pickle
import numpy as np

app = FastAPI()

# Load model
with open("model/crop_model.pkl", "rb") as f:
    model = pickle.load(f)

@app.get("/")
def home():
    return {"message": "ML Service Running"}

@app.post("/predict")
def predict(data: dict):
    try:
        features = np.array([[
            data["temperature"],
            data["humidity"],
            data["rainfall"],
            data["ph"],
            data["N"],
            data["P"],
            data["K"]
        ]])

        prediction = model.predict(features)[0]

        return {"crop": prediction}

    except Exception as e:
        return {"error": str(e)}