import pandas as pd
import joblib
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay
)


# ==========================================
# 1. Load Dataset
# ==========================================

df = pd.read_csv("flood_dataset.csv")

print("\nDataset Loaded Successfully!")
print("Total Records:", len(df))

print("\nDataset:")
print(df)


# ==========================================
# 2. Features and Target
# ==========================================

features = [
    "rainfall",
    "water_level",
    "temperature",
    "humidity",
    "rainfall_intensity"
]

X = df[features]
y = df["risk"]


# ==========================================
# 3. Train/Test Split
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("\nTraining Records:", len(X_train))
print("Testing Records:", len(X_test))


# ==========================================
# 4. Create Random Forest Model
# ==========================================

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42
)


# ==========================================
# 5. Train Model
# ==========================================

print("\nTraining AI Model...")

model.fit(X_train, y_train)

print("Training Completed!")


# ==========================================
# 6. Predictions
# ==========================================

y_pred = model.predict(X_test)


# ==========================================
# 7. Accuracy
# ==========================================

accuracy = accuracy_score(y_test, y_pred)

print("\n================================")
print("MODEL ACCURACY")
print("================================")

print(f"Accuracy: {accuracy * 100:.2f}%")


# ==========================================
# 8. Classification Report
# ==========================================

print("\n================================")
print("CLASSIFICATION REPORT")
print("================================")

print(classification_report(y_test, y_pred))


# ==========================================
# 9. Confusion Matrix
# ==========================================

cm = confusion_matrix(
    y_test,
    y_pred,
    labels=["LOW", "MODERATE", "HIGH"]
)

print("\n================================")
print("CONFUSION MATRIX")
print("================================")

print(cm)


# Display confusion matrix
disp = ConfusionMatrixDisplay(
    confusion_matrix=cm,
    display_labels=["LOW", "MODERATE", "HIGH"]
)

disp.plot()

plt.title("Flood Risk Prediction - Confusion Matrix")

plt.savefig("confusion_matrix.png")

# plt.show()


# ==========================================
# 10. Feature Importance
# ==========================================

print("\n================================")
print("FEATURE IMPORTANCE")
print("================================")

importance = model.feature_importances_

for feature, value in zip(features, importance):

    print(
        f"{feature}: {value:.4f}"
    )


# Feature Importance Graph

plt.figure()

plt.bar(features, importance)

plt.xlabel("Features")
plt.ylabel("Importance")

plt.title("Flood Risk Model - Feature Importance")

plt.xticks(rotation=30)

plt.tight_layout()

plt.savefig("feature_importance.png")

# plt.show()


# ==========================================
# 11. Save Model
# ==========================================

joblib.dump(
    model,
    "flood_model.pkl"
)

print("\n================================")
print("MODEL SAVED SUCCESSFULLY")
print("================================")

print("File: flood_model.pkl")