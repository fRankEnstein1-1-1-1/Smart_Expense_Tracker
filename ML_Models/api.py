from fastapi import FastAPI
from pydantic import BaseModel
import joblib

app = FastAPI()

# Load model once when server starts
model = joblib.load("expense_model.pkl")
vectorizer = joblib.load("vectorizer.pkl")

class Items(BaseModel):
    items: list[str]
    
@app.get("/")
async def home():
    return {
        "message": "Smart Expense Tracker ML API is running successfully! 🚀",
        "status": "healthy",
        "endpoints": ["/predict"]
    }

@app.post("/predict")
def predict(data: Items):

    vectors = vectorizer.transform(data.items)

    predictions = model.predict(vectors)

    return {
        "categories": predictions.tolist()
    }