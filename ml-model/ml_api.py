from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix
)

app = Flask(__name__)
CORS(app)

# Load trained ML model
model = joblib.load("flood_model.pkl")

features = [
    "rainfall",
    "water_level",
    "temperature",
    "humidity",
    "rainfall_intensity"
]
@app.route("/api/evaluation", methods=["GET"])
def evaluation():

    df = pd.read_csv("flood_dataset.csv")

    X = df[features]
    y = df["risk"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    y_pred = model.predict(X_test)

    accuracy = accuracy_score(y_test, y_pred)

    precision = precision_score(
        y_test,
        y_pred,
        average="weighted",
        zero_division=0
    )

    recall = recall_score(
        y_test,
        y_pred,
        average="weighted",
        zero_division=0
    )

    f1 = f1_score(
        y_test,
        y_pred,
        average="weighted",
        zero_division=0
    )

    cm = confusion_matrix(
        y_test,
        y_pred,
        labels=["LOW", "MODERATE", "HIGH"]
    )

    feature_importance = {}

    for feature, value in zip(
        features,
        model.feature_importances_
    ):
        feature_importance[feature] = round(
            float(value * 100),
            2
        )

    return jsonify({
        "status": "success",
        "accuracy": round(accuracy * 100, 2),
        "precision": round(precision * 100, 2),
        "recall": round(recall * 100, 2),
        "f1_score": round(f1 * 100, 2),
        "confusion_matrix": cm.tolist(),
        "labels": ["LOW", "MODERATE", "HIGH"],
        "feature_importance": feature_importance
    })
    
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "success",
        "message": "Flood ML API is running"
    })


@app.route("/api/predict", methods=["POST"])
def predict():

    data = request.get_json()

    rainfall = data.get("rainfall")
    water_level = data.get("water_level")
    temperature = data.get("temperature")
    humidity = data.get("humidity")
    rainfall_intensity = data.get("rainfall_intensity")

    # Validate input
    if (
        rainfall is None
        or water_level is None
        or temperature is None
        or humidity is None
        or rainfall_intensity is None
    ):
        return jsonify({
            "status": "error",
            "message": "All five parameters are required"
        }), 400

    # Prepare input for ML model
    input_data = [[
        rainfall,
        water_level,
        temperature,
        humidity,
        rainfall_intensity
    ]]

    # AI prediction
    prediction = model.predict(input_data)[0]

    # Prediction probability
    probabilities = model.predict_proba(input_data)[0]

    confidence = max(probabilities) * 100

    return jsonify({
        "status": "success",
        "prediction": prediction,
        "confidence": round(confidence, 2),
        "input": {
            "rainfall": rainfall,
            "water_level": water_level,
            "temperature": temperature,
            "humidity": humidity,
            "rainfall_intensity": rainfall_intensity
        }
    })


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )