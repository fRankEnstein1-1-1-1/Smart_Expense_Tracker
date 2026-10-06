import re
import joblib
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# Load once at startup. This is a full pipeline (TF-IDF + classifier).
model = joblib.load("expense_model .pkl")

CONF_THRESHOLD = 0.40  # tune after testing


def normalize(t):
    # MUST match the normalize() used in the training script exactly
    t = str(t).lower()
    t = re.sub(r"\d+(\.\d+)?\s*(mg|kg|gm|g|ml|l|ltr|pcs|pc|pack)\b", " ", t)
    t = re.sub(r"[^a-z\s]", " ", t)
    return re.sub(r"\s+", " ", t).strip()


class Items(BaseModel):
    items: list[str]


@app.get("/")
async def home():
    return {
        "message": "Smart Expense Tracker ML API is running successfully! 🚀",
        "status": "healthy",
        "classes": list(model.classes_),
        "endpoints": ["/predict"],
    }


@app.post("/predict")
def predict(data: Items):
    categories = []
    for raw in data.items:
        text = normalize(raw)
        if len(text) < 2:
            categories.append("Miscellaneous")
            continue
        probs = model.predict_proba([text])[0]
        best = probs.argmax()
        categories.append(
            str(model.classes_[best]) if probs[best] >= CONF_THRESHOLD else "Miscellaneous"
        )
    return {"categories": categories}