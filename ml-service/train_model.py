"""
Model Training Script for PhishGuard
Trains and compares TF-IDF + Logistic Regression, Naive Bayes, and Random Forest models.
Saves the best model, vectorizer, and evaluation metrics.
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import joblib

from preprocessing import preprocess_text

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "dataset", "emails.json")
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)


def train_models():
    print("=" * 60)
    print("PHISHGUARD AI/ML MODEL TRAINING & EVALUATION PIPELINE")
    print("=" * 60)

    # 1. Load Dataset
    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    df = pd.DataFrame(data)
    print(f"Total labeled samples loaded: {len(df)}")
    print(f"Phishing count: {(df['label'] == 'phishing').sum()} | Safe count: {(df['label'] == 'safe').sum()}")

    # 2. Text Preprocessing
    df["full_text"] = df["subject"] + " " + df["body"]
    df["processed_text"] = df["full_text"].apply(preprocess_text)
    df["target"] = (df["label"] == "phishing").astype(int)

    # 3. Stratified Train / Test Split
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        df["processed_text"],
        df["target"],
        test_size=0.25,
        random_state=42,
        stratify=df["target"]
    )

    # 4. TF-IDF Feature Extraction
    vectorizer = TfidfVectorizer(
        max_features=1500,
        ngram_range=(1, 2),
        sublinear_tf=True
    )
    X_train = vectorizer.fit_transform(X_train_raw)
    X_test = vectorizer.transform(X_test_raw)

    # 5. Define Candidate Models
    candidate_models = {
        "Logistic Regression": LogisticRegression(C=1.5, max_iter=1000, random_state=42),
        "Multinomial Naive Bayes": MultinomialNB(alpha=0.5),
        "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    }

    results = {}
    best_model_name = None
    best_f1 = -1.0
    best_model_obj = None

    for name, model in candidate_models.items():
        print(f"\nTraining candidate model: {name}...")
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        cm = confusion_matrix(y_test, y_pred).tolist()

        results[name] = {
            "accuracy": round(float(acc) * 100, 2),
            "precision": round(float(prec) * 100, 2),
            "recall": round(float(rec) * 100, 2),
            "f1_score": round(float(f1) * 100, 2),
            "confusion_matrix": cm
        }

        print(f"  -> Accuracy : {results[name]['accuracy']}%")
        print(f"  -> Precision: {results[name]['precision']}%")
        print(f"  -> Recall   : {results[name]['recall']}%")
        print(f"  -> F1 Score : {results[name]['f1_score']}%")
        print(f"  -> Confusion Matrix: {cm}")

        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_model_obj = model

    print("\n" + "=" * 60)
    print(f"BEST PERFORMING MODEL: {best_model_name} (F1 Score: {results[best_model_name]['f1_score']}%)")
    print("=" * 60)

    # 6. Save Artifacts
    vectorizer_path = os.path.join(MODELS_DIR, "vectorizer.joblib")
    model_path = os.path.join(MODELS_DIR, "phishing_model.joblib")
    metrics_path = os.path.join(MODELS_DIR, "metrics.json")

    joblib.dump(vectorizer, vectorizer_path)
    joblib.dump(best_model_obj, model_path)

    metrics_payload = {
        "best_model": best_model_name,
        "models_evaluated": results,
        "sample_count": len(df),
        "vocabulary_size": len(vectorizer.vocabulary_)
    }

    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics_payload, f, indent=2)

    print(f"Vectorizer saved to: {vectorizer_path}")
    print(f"Model saved to: {model_path}")
    print(f"Metrics saved to: {metrics_path}")
    print("Training finished successfully!\n")


if __name__ == "__main__":
    train_models()
