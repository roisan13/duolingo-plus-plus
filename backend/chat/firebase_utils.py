import firebase_admin
from firebase_admin import credentials, firestore
import os

# Path to your Firebase key
FIREBASE_KEY_PATH = os.path.join(os.path.dirname(__file__), "../firebase_key.json")

# Initialize Firebase once
if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_KEY_PATH)
    firebase_admin.initialize_app(cred)

db = firestore.client()

def save_conversation(session_id, language, scenario, messages):
    # Save conversation data to Firestore under conversations/{session_id}
    
    doc_ref = db.collection("conversations").document(session_id)
    doc_ref.set({
        "language": language,
        "scenario": scenario,
        "messages": messages
    }, merge=True)
