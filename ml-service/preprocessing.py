"""
Email Preprocessing Module for PhishGuard
Handles text normalization, email parsing, tokenization, stopword removal, and regex extraction.
"""

import re
import string
import email
from email import policy
from email.parser import BytesParser, Parser
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

try:
    STOP_WORDS = set(stopwords.words('english'))
except Exception:
    STOP_WORDS = {
        "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", 
        "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", 
        "by", "can", "did", "do", "does", "doing", "don", "down", "during", "each", "few", "for", 
        "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", 
        "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "just", 
        "me", "more", "most", "my", "myself", "no", "nor", "not", "now", "of", "off", "on", "once", 
        "only", "or", "other", "our", "ours", "ourselves", "out", "over", "own", "same", "she", 
        "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves", 
        "then", "there", "these", "they", "this", "those", "through", "to", "too", "under", "until", 
        "up", "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", 
        "why", "with", "you", "your", "yours", "yourself", "yourselves"
    }


def clean_html(text: str) -> str:
    """Strips HTML tags and entity references from text."""
    clean = re.sub(r'<[^>]+>', ' ', text)
    clean = re.sub(r'&[a-zA-Z0-9#]+;', ' ', clean)
    return clean


def extract_urls(text: str) -> list[str]:
    """Finds all URLs in email text."""
    url_pattern = r'(https?://[^\s<>"]+|www\.[^\s<>"]+)'
    urls = re.findall(url_pattern, text)
    return list(dict.fromkeys(urls))  # Preserve order, unique


def parse_raw_email(raw_content: str) -> dict:
    """Parses raw email text into sender, recipient, subject, and body."""
    try:
        msg = Parser(policy=policy.default).parsestr(raw_content)
        subject = msg['subject'] or ''
        sender = msg['from'] or ''
        recipient = msg['to'] or ''
        
        body = ""
        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                if content_type in ['text/plain', 'text/html']:
                    payload = part.get_payload(decode=True)
                    if payload:
                        charset = part.get_content_charset() or 'utf-8'
                        text = payload.decode(charset, errors='replace')
                        if content_type == 'text/html':
                            text = clean_html(text)
                        body += text + "\n"
        else:
            payload = msg.get_payload(decode=True)
            if payload:
                charset = msg.get_content_charset() or 'utf-8'
                body = payload.decode(charset, errors='replace')
            else:
                body = msg.get_payload() or ''
            if msg.get_content_type() == 'text/html':
                body = clean_html(body)
        
        # If standard parser didn't extract fields, fallback to regex
        if not sender or not subject:
            sender_match = re.search(r'From:\s*([^\r\n]+)', raw_content, re.IGNORECASE)
            subject_match = re.search(r'Subject:\s*([^\r\n]+)', raw_content, re.IGNORECASE)
            to_match = re.search(r'To:\s*([^\r\n]+)', raw_content, re.IGNORECASE)
            
            if sender_match and not sender:
                sender = sender_match.group(1).strip()
            if subject_match and not subject:
                subject = subject_match.group(1).strip()
            if to_match and not recipient:
                recipient = to_match.group(1).strip()
            if not body:
                body = raw_content

        return {
            "sender": sender.strip(),
            "recipient": recipient.strip(),
            "subject": subject.strip(),
            "body": body.strip()
        }
    except Exception:
        return {
            "sender": "",
            "recipient": "",
            "subject": "",
            "body": raw_content.strip()
        }


def preprocess_text(text: str) -> str:
    """Normalizes text for TF-IDF vectorization and NLP classification."""
    if not text:
        return ""
    # Strip HTML
    cleaned = clean_html(text)
    # Lowercase
    cleaned = cleaned.lower()
    # Replace URLs with token
    cleaned = re.sub(r'https?://\S+|www\.\S+', ' httpurl ', cleaned)
    # Replace email addresses with token
    cleaned = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', ' emailaddr ', cleaned)
    # Replace numbers/currencies with token
    cleaned = re.sub(r'[\$£€₹]\s*\d+([,\.]\d+)?', ' moneynum ', cleaned)
    cleaned = re.sub(r'\b\d+\b', ' number ', cleaned)
    # Remove punctuation
    cleaned = cleaned.translate(str.maketrans('', '', string.punctuation))
    # Tokenize and remove stopwords
    tokens = cleaned.split()
    tokens = [t for t in tokens if t not in STOP_WORDS and len(t) > 1]
    return " ".join(tokens)
