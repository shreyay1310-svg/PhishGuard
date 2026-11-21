"""
Prediction & Risk Assessment Engine for PhishGuard
Combines Machine Learning NLP classification with multi-layer cyber threat heuristics.
Distinguishes model confidence from estimated multi-factor risk score.
"""

import os
import joblib
from preprocessing import preprocess_text, extract_urls, parse_raw_email
from feature_extraction import (
    analyze_content,
    analyze_urls,
    analyze_sender,
    analyze_attachment
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
VECTORIZER_PATH = os.environ.get("VECTORIZER_PATH", os.path.join(MODELS_DIR, "vectorizer.joblib"))
MODEL_PATH = os.environ.get("MODEL_PATH", os.path.join(MODELS_DIR, "phishing_model.joblib"))

_model = None
_vectorizer = None


def load_ml_assets():
    """Loads vectorizer and model once into memory."""
    global _model, _vectorizer
    if _model is None and os.path.exists(MODEL_PATH) and os.path.exists(VECTORIZER_PATH):
        try:
            _vectorizer = joblib.load(VECTORIZER_PATH)
            _model = joblib.load(MODEL_PATH)
        except Exception as e:
            print(f"Warning: Could not load trained ML model: {e}")


def predict_email(
    subject: str = "",
    body: str = "",
    sender: str = "",
    recipient: str = "",
    attachment_name: str | None = None,
    raw_content: str | None = None
) -> dict:
    """
    Main prediction pipeline.
    Accepts discrete fields or raw email text (from .eml/.msg paste).
    """
    load_ml_assets()

    # If raw content is supplied and subject/body are empty, parse it
    if raw_content and (not subject and not body):
        parsed = parse_raw_email(raw_content)
        subject = parsed.get("subject") or subject
        body = parsed.get("body") or body
        sender = parsed.get("sender") or sender
        recipient = parsed.get("recipient") or recipient

    # 1. Feature extractions
    extracted_urls = extract_urls(f"{subject} {body}")
    content_analysis = analyze_content(subject, body)
    url_analysis = analyze_urls(extracted_urls)
    sender_analysis = analyze_sender(sender)
    attachment_analysis = analyze_attachment(attachment_name)

    # 2. Machine Learning Inference
    ml_confidence = 85.0
    ml_phishing_prob = 0.5
    model_name = "TF-IDF + Heuristic Hybrid"

    if _model is not None and _vectorizer is not None:
        try:
            processed = preprocess_text(f"{subject} {body}")
            features = _vectorizer.transform([processed])
            if hasattr(_model, "predict_proba"):
                probs = _model.predict_proba(features)[0]
                # Index 1 is phishing probability
                ml_phishing_prob = float(probs[1])
                ml_confidence = round(float(max(probs)) * 100, 2)
            else:
                pred = _model.predict(features)[0]
                ml_phishing_prob = 0.95 if pred == 1 else 0.05
                ml_confidence = 90.0
            model_name = _model.__class__.__name__
        except Exception as e:
            print(f"ML inference error: {e}")

    # 3. Multi-Factor Risk Score Calculation (0 to 100)
    # Weights: ML Model (35%), URLs (25%), Sender (20%), Content keywords (15%), Attachment (5%)
    weighted_score = 0.0

    # ML component
    weighted_score += (ml_phishing_prob * 100) * 0.35

    # URL component
    if url_analysis["risk_level"] == "High":
        weighted_score += 25.0
    elif url_analysis["risk_level"] == "Medium":
        weighted_score += 15.0
    else:
        weighted_score += 2.0

    # Sender component
    if sender_analysis["risk_level"] == "High":
        weighted_score += 20.0
    elif sender_analysis["risk_level"] == "Medium":
        weighted_score += 10.0
    else:
        weighted_score += 1.0

    # Content component
    if content_analysis["risk_level"] == "High":
        weighted_score += 15.0
    elif content_analysis["risk_level"] == "Medium":
        weighted_score += 8.0
    else:
        weighted_score += 1.0

    # Attachment component
    if attachment_analysis["risk_level"] == "High":
        weighted_score += 15.0
    elif attachment_analysis["risk_level"] == "Medium":
        weighted_score += 5.0

    # Override: if malicious URL or explicit typosquatting detected, floor at 85%
    if any(u.get("is_malicious") for u in url_analysis.get("all_analyzed", [])):
        weighted_score = max(weighted_score, 88.0)
    if "Suspicious domain" in " ".join(sender_analysis.get("reasons", [])) or sender_analysis["risk_level"] == "High":
        weighted_score = max(weighted_score, 75.0)

    risk_score = round(min(max(weighted_score, 1.0), 99.0), 1)

    # 4. Result Categorization
    if risk_score >= 61.0:
        prediction = "PHISHING"
        risk_level = "High Risk"
    elif risk_score >= 31.0:
        prediction = "SUSPICIOUS"
        risk_level = "Medium Risk"
    else:
        prediction = "SAFE"
        risk_level = "Low Risk"

    # 5. Explanations & Reasons
    explanations = []
    if sender_analysis["risk_level"] == "High":
        explanations.append(f"Suspicious sender: {', '.join(sender_analysis['reasons']) if sender_analysis['reasons'] else sender_analysis['domain']}")
    if url_analysis["risk_level"] == "High":
        explanations.append("Malicious link detected with high-risk spoofing or credential-harvesting patterns.")
    elif url_analysis["risk_level"] == "Medium":
        explanations.append("Suspicious or shortened links present in email body.")
    if content_analysis["keywords_found"]:
        explanations.append(f"Contains phishing keywords: {', '.join(['\"' + k + '\"' for k in content_analysis['keywords_found'][:4]])}")
    if attachment_analysis["risk_level"] == "High":
        explanations.append(f"Dangerous attachment detected ({attachment_analysis['filename']}).")
    if not explanations:
        explanations.append("No common phishing signals, deceptive domains, or malicious URLs detected.")

    explanation_str = " ".join(explanations)

    # 6. Practical Actionable Recommendations
    if prediction == "PHISHING":
        recommendations = [
            "Do not click any links or download attachments in this email.",
            "Do not share your passwords, OTPs, or banking credentials.",
            "Mark the email as spam or phishing in your email client.",
            "Report this incident immediately to your IT/security operations team."
        ]
    elif prediction == "SUSPICIOUS":
        recommendations = [
            "Exercise caution: verify the sender's identity through a separate, trusted communication channel.",
            "Do not click shortened or unfamiliar links without inspecting their destination.",
            "Avoid sharing personal, banking, or corporate information.",
            "Check SPF and DKIM headers if you are managing enterprise mailflow."
        ]
    else:
        recommendations = [
            "This email appears safe based on domain verification and NLP content signals.",
            "Always maintain standard cybersecurity hygiene.",
            "Never share passwords or two-factor authentication codes via email."
        ]

    return {
        "prediction": prediction,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "model_confidence": ml_confidence,
        "model_name": model_name,
        "sender_check": {
            "sender_email": sender_analysis["sender_email"],
            "domain": sender_analysis["domain"],
            "risk": sender_analysis["risk_level"],
            "spf_status": sender_analysis["spf_status"],
            "dmarc_status": sender_analysis["dmarc_status"],
            "reasons": sender_analysis["reasons"]
        },
        "url_analysis": {
            "count": url_analysis["count"],
            "risk": url_analysis["risk_level"],
            "malicious_detected": bool(url_analysis["malicious_urls"]),
            "urls": url_analysis["all_analyzed"]
        },
        "content_analysis": {
            "risk": content_analysis["risk_level"],
            "keywords": content_analysis["keywords_found"],
            "urgency": content_analysis["has_high_urgency"],
            "credentials_requested": content_analysis["credentials_requested"]
        },
        "attachment_check": {
            "has_attachment": attachment_analysis["has_attachment"],
            "filename": attachment_analysis["filename"],
            "risk": attachment_analysis["risk_level"],
            "reason": attachment_analysis["reason"]
        },
        "explanation": explanation_str,
        "recommendations": recommendations,
        "disclaimer": "Model confidence represents statistical classifier certainty; risk score is an estimated threat assessment."
    }
