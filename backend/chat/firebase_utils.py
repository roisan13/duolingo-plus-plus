import firebase_admin
from firebase_admin import credentials, firestore
import os
import uuid
from datetime import datetime

# Path to your Firebase key
FIREBASE_KEY_PATH = os.path.join(os.path.dirname(__file__), "../firebase_key.json")

# Initialize Firebase once
if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_KEY_PATH)
    firebase_admin.initialize_app(cred)

db = firestore.client()

def create_session():
    """Create a new session and return its ID"""
    session_id = str(uuid.uuid4())
    doc_ref = db.collection("sessions").document(session_id)
    doc_ref.set({
        "created_at": datetime.now(),
        "active": True
    })
    return session_id

def create_conversation(session_id):
    """Create a new conversation within a session and return its ID"""
    conversation_id = str(uuid.uuid4())
    doc_ref = db.collection("sessions").document(session_id).collection("conversations").document(conversation_id)
    doc_ref.set({
        "created_at": datetime.now(),
        "active": True
    })
    return conversation_id

def save_conversation(session_id, conversation_id, language, scenario, messages):
    """Save conversation data to Firestore under sessions/{session_id}/conversations/{conversation_id}"""
    doc_ref = db.collection("sessions").document(session_id).collection("conversations").document(conversation_id)
    doc_ref.set({
        "language": language,
        "scenario": scenario,
        "messages": messages,
        "updated_at": datetime.now()
    }, merge=True)

def end_conversation(session_id, conversation_id):
    """Mark a conversation as ended"""
    doc_ref = db.collection("sessions").document(session_id).collection("conversations").document(conversation_id)
    doc_ref.update({
        "active": False,
        "ended_at": datetime.now()
    })
