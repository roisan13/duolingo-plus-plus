import firebase_admin
from firebase_admin import credentials, firestore
import os
import uuid
from datetime import datetime

# Path to your Firebase key
# FIREBASE_KEY_PATH = os.path.join(os.path.dirname(__file__), "../firebase_key.json")

# for render, secret files are stored in etc/secrets/
FIREBASE_KEY_PATH = os.path.join("/etc/secrets/firebase_key.json") if os.path.exists("/etc/secrets/firebase_key.json") else os.path.join(os.path.dirname(__file__), "../firebase_key.json")

# Initialize Firebase once
if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_KEY_PATH)
    firebase_admin.initialize_app(cred)


db = firestore.client()

def create_session():
    """Create a new session and return its ID"""
    session_id = str(uuid.uuid4())
    db.collection('sessions').document(session_id).set({
        'created_at': datetime.now(),
        'ended_at': None
    })
    return session_id

def create_conversation(session_id):
    """Create a new conversation within a session and return its ID"""
    conversation_id = str(uuid.uuid4())
    db.collection('sessions').document(session_id).collection('conversations').document(conversation_id).set({
        'created_at': datetime.now(),
        'ended_at': None
    })
    return conversation_id

def save_conversation(session_id, conversation_id, language, scenario, messages):
    """Save a conversation's messages to Firestore"""
    conversation_ref = db.collection('sessions').document(session_id).collection('conversations').document(conversation_id)
    
    # Update the conversation document with the latest messages
    conversation_ref.update({
        'messages': messages,
        'language': language,
        'scenario': scenario,
        'updated_at': datetime.now()
    })

def end_conversation(session_id, conversation_id):
    """Mark a conversation as ended"""
    conversation_ref = db.collection('sessions').document(session_id).collection('conversations').document(conversation_id)
    conversation_ref.update({
        'ended_at': datetime.now()
    })

def get_session_messages(session_id):
    """Get all messages from all conversations in a session"""
    try:
        # Get the session document
        session_ref = db.collection('sessions').document(session_id)
        session = session_ref.get()
        
        if not session.exists:
            return []
        
        # Get all conversations in the session
        conversations = session_ref.collection('conversations').stream()
        
        # Collect messages from all conversations
        all_messages = []
        for conv in conversations:
            conv_data = conv.to_dict()
            if 'messages' in conv_data:
                all_messages.extend(conv_data['messages'])
        
        return all_messages
    except Exception as e:
        print(f"Error getting session messages: {str(e)}")
        return []
