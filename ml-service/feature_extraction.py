"""
Feature Extraction Module for PhishGuard
Extracts multi-vector cybersecurity features across:
A. Email Content Analysis
B. URL Analysis
C. Sender Verification
D. Attachment Analysis
"""

import re
import urllib.parse

PHISHING_KEYWORDS = [
    "verify account", "verify your account", "account suspended", "suspended",
    "update details", "update your bank details", "update payment", "confirm identity",
    "urgent action", "immediate payment", "click here", "login now", "reset password",
    "unauthorized login", "security alert", "kyc compliance", "debit freezing",
    "claim refund", "gift card", "secret recovery phrase", "wire transfer",
    "past due invoice", "legal proceedings", "billing failure", "temporary suspension",
    "re-activate", "unlock your account", "action required", "within 24 hours"
]

URGENT_TERMS = [
    "immediately", "urgent", "24 hours", "suspended", "lock", "freeze",
    "within 1 hour", "action required", "threat", "expires today", "final notice"
]

CREDENTIAL_TERMS = [
    "password", "pin", "ssn", "secret phrase", "security key", "login to verify",
    "enter credentials", "re-authenticate", "debit card pin", "cvv", "otp"
]

FINANCIAL_TERMS = [
    "bank", "wire transfer", "gift cards", "refund", "invoice", "payout",
    "tax refund", "crypto", "ethereum", "bitcoin", "overdue", "payment failed"
]

SUSPICIOUS_TLDS = {
    ".xyz", ".top", ".buzz", ".club", ".cc", ".vip", ".online", ".site",
    ".work", ".icu", ".cam", ".shop", ".rest", ".fit", ".monster"
}

SHORTENER_DOMAINS = {
    "bit.ly", "tinyurl.com", "ow.ly", "is.gd", "buff.ly", "t.co", "rb.gy", "rebrand.ly"
}

KNOWN_TRUSTED_DOMAINS = {
    "amazon.com", "amazon.in", "flipkart.com", "google.com", "microsoft.com",
    "github.com", "apple.com", "linkedin.com", "zoom.us", "slack.com",
    "paypal.com", "stripe.com", "netflix.com", "phishguard.cyber"
}

SUSPICIOUS_EXTENSIONS = {
    ".exe", ".scr", ".vbs", ".hta", ".bat", ".cmd", ".pif", ".jar",
    ".js", ".wsf", ".docm", ".xlsm", ".pptm", ".iso", ".img"
}


def analyze_content(subject: str, body: str) -> dict:
    """Analyzes text for phishing patterns, urgency, credential harvesting, and suspicious CTAs."""
    combined = f"{subject} {body}".lower()
    
    found_keywords = [kw for kw in PHISHING_KEYWORDS if kw in combined]
    found_urgency = [term for term in URGENT_TERMS if term in combined]
    found_credentials = [term for term in CREDENTIAL_TERMS if term in combined]
    found_financial = [term for term in FINANCIAL_TERMS if term in combined]
    
    # Calculate uppercase ratio in subject / body
    raw_text = f"{subject} {body}"
    uppercase_count = sum(1 for c in raw_text if c.isupper())
    total_letters = sum(1 for c in raw_text if c.isalpha())
    uppercase_ratio = (uppercase_count / total_letters) if total_letters > 0 else 0.0
    
    exclamation_count = raw_text.count("!")
    
    # Risk calculation
    score = 0
    score += len(found_keywords) * 15
    score += len(found_urgency) * 10
    score += len(found_credentials) * 20
    score += len(found_financial) * 8
    if uppercase_ratio > 0.3:
        score += 15
    if exclamation_count >= 3:
        score += 10
        
    risk_level = "Low"
    if score >= 45:
        risk_level = "High"
    elif score >= 20:
        risk_level = "Medium"
        
    return {
        "score": min(score, 100),
        "risk_level": risk_level,
        "keywords_found": found_keywords[:6],
        "urgent_terms": found_urgency[:4],
        "credentials_requested": bool(found_credentials),
        "has_high_urgency": bool(found_urgency),
        "exclamation_count": exclamation_count,
        "uppercase_ratio": round(uppercase_ratio, 2)
    }


def analyze_single_url(url: str) -> dict:
    """Analyzes a single URL for phishing indicators."""
    indicators = []
    is_malicious = False
    is_suspicious = False
    
    # Extract scheme, host
    parsed = urllib.parse.urlparse(url)
    domain = parsed.netloc.lower()
    
    # Remove port if present
    if ":" in domain:
        domain = domain.split(":")[0]
        
    # Check IP address as host
    ip_pattern = r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$'
    if re.match(ip_pattern, domain):
        indicators.append("IP-based URL host detected")
        is_malicious = True
        
    # Check URL shorteners
    if domain in SHORTENER_DOMAINS:
        indicators.append(f"URL shortener detected ({domain})")
        is_suspicious = True
        
    # Check suspicious TLDs
    for tld in SUSPICIOUS_TLDS:
        if domain.endswith(tld):
            indicators.append(f"Suspicious Top-Level Domain ({tld})")
            is_suspicious = True
            break
            
    # Check typosquatting/hyphenated impersonation
    brand_targets = ["paytm", "hdfc", "amazon", "paypal", "netflix", "microsoft", "google", "apple", "wellsfargo", "docusign"]
    for brand in brand_targets:
        if brand in domain and domain not in KNOWN_TRUSTED_DOMAINS and not domain.endswith(f".{brand}.com"):
            indicators.append(f"Target brand typosquatting / impersonation pattern for '{brand}'")
            is_malicious = True
            break
            
    # Check subdomains depth
    subdomains = domain.split(".")
    if len(subdomains) > 4:
        indicators.append("Excessive subdomain nesting")
        is_suspicious = True
        
    # Check protocol
    if parsed.scheme == "http" and ("login" in url or "verify" in url or "secure" in url):
        indicators.append("Insecure HTTP protocol used for authentication/login link")
        is_suspicious = True

    risk_level = "Safe"
    if is_malicious:
        risk_level = "Malicious"
    elif is_suspicious:
        risk_level = "Suspicious"
        
    return {
        "url": url,
        "domain": domain,
        "risk_level": risk_level,
        "is_malicious": is_malicious,
        "indicators": indicators
    }


def analyze_urls(urls: list[str]) -> dict:
    """Aggregates URL analysis across all URLs in the email."""
    if not urls:
        return {
            "count": 0,
            "risk_level": "Low",
            "malicious_urls": [],
            "suspicious_urls": [],
            "all_analyzed": []
        }
        
    analyzed = [analyze_single_url(u) for u in urls]
    malicious = [a for a in analyzed if a["risk_level"] == "Malicious"]
    suspicious = [a for a in analyzed if a["risk_level"] == "Suspicious"]
    
    risk_level = "Low"
    if len(malicious) > 0:
        risk_level = "High"
    elif len(suspicious) > 0:
        risk_level = "Medium"
        
    return {
        "count": len(urls),
        "risk_level": risk_level,
        "malicious_urls": malicious,
        "suspicious_urls": suspicious,
        "all_analyzed": analyzed
    }


def analyze_sender(sender: str) -> dict:
    """Analyzes sender header for spoofing, mismatch, and deceptive patterns."""
    if not sender:
        return {
            "sender_email": "",
            "domain": "",
            "risk_level": "Medium",
            "reason": "Missing or blank sender header"
        }
        
    # Extract email and display name: "Display Name <user@domain.com>"
    match = re.search(r'^(.*?)\s*<([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>$', sender.strip())
    if match:
        display_name = match.group(1).strip().strip('"\'')
        sender_email = match.group(2).strip().lower()
    else:
        display_name = ""
        # Extract pure email
        email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', sender)
        sender_email = email_match.group(0).lower() if email_match else sender.lower()

    domain = sender_email.split("@")[-1] if "@" in sender_email else ""
    
    reasons = []
    is_high_risk = False
    is_medium_risk = False
    
    # Check brand in display name vs domain
    brand_keywords = ["paytm", "amazon", "hdfc", "paypal", "microsoft", "apple", "netflix", "support", "security", "ceo", "it desk"]
    for brand in brand_keywords:
        if brand in display_name.lower() and brand not in domain:
            reasons.append(f"Display name claims to be '{display_name}' but email domain is '{domain}'")
            is_high_risk = True
            break
            
    # Check suspicious TLDs in sender domain
    for tld in SUSPICIOUS_TLDS:
        if domain.endswith(tld):
            reasons.append(f"Sender uses untrusted/high-abuse TLD ({tld})")
            is_high_risk = True
            break
            
    # Check hyphenated impersonation in sender domain
    for brand in ["paytm", "hdfc", "amazon", "paypal", "bank"]:
        if brand in domain and domain not in KNOWN_TRUSTED_DOMAINS and f"{brand}.com" not in domain:
            reasons.append(f"Sender domain ({domain}) mimics trusted brand {brand}")
            is_high_risk = True
            break

    # Free webmail pretending to be corporate/bank
    free_providers = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"]
    if domain in free_providers and any(w in display_name.lower() for w in ["bank", "support", "ceo", "finance", "hr"]):
        reasons.append(f"Executive/Corporate title used with public free email provider ({domain})")
        is_high_risk = True

    risk_level = "Low"
    if is_high_risk:
        risk_level = "High"
    elif is_medium_risk:
        risk_level = "Medium"
        
    return {
        "sender_email": sender_email,
        "display_name": display_name,
        "domain": domain,
        "risk_level": risk_level,
        "reasons": reasons,
        "spf_status": "PASS" if risk_level == "Low" else ("FAIL" if risk_level == "High" else "NEUTRAL"),
        "dmarc_status": "PASS" if risk_level == "Low" else ("REJECT" if risk_level == "High" else "NONE")
    }


def analyze_attachment(filename: str | None) -> dict:
    """Validates attachment filename and extension against dangerous formats."""
    if not filename:
        return {
            "has_attachment": False,
            "filename": None,
            "risk_level": "Low",
            "reason": "No attachment"
        }
        
    lower_name = filename.lower()
    for ext in SUSPICIOUS_EXTENSIONS:
        if lower_name.endswith(ext):
            return {
                "has_attachment": True,
                "filename": filename,
                "risk_level": "High",
                "reason": f"Dangerous executable/macro extension detected ({ext})"
            }
            
    return {
        "has_attachment": True,
        "filename": filename,
        "risk_level": "Low",
        "reason": "Standard safe document format"
    }
