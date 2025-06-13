from rest_framework.parsers import MultiPartParser
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from openai import OpenAI
import os
from dotenv import load_dotenv
from collections import defaultdict
from .firebase_utils import save_conversation, create_session, create_conversation, get_session_messages, end_conversation as mark_conversation_ended
from .firebase_utils import db  
from elevenlabs.client import ElevenLabs
import uuid
from .vocabulary_analyzer import VocabularyAnalyzer





load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
eleven_labs_client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))
vocab_analyzer = VocabularyAnalyzer()


# TEMPORARY in-memory store: { session_id: { conversation_id: [message_dicts] } }
chat_sessions = defaultdict(lambda: defaultdict(list))


@api_view(['POST'])
def initialize_session(request):
    """Create a new session and return its ID"""
    session_id = create_session()
    return Response({"session_id": session_id})

@api_view(['POST'])
def start_conversation(request):
    """Start a new conversation within a session"""
    session_id = request.data.get("session_id")
    if not session_id:
        return Response({"error": "No session_id provided"}, status=400)
    
    conversation_id = create_conversation(session_id)
    return Response({
        "session_id": session_id,
        "conversation_id": conversation_id
    })

@api_view(['POST'])
def chat_with_ai(request):
    user_msg = request.data.get("message", "")
    language = request.data.get("language", "English")
    scenario = request.data.get("scenario", "a general conversation")
    session_id = request.data.get("session_id")
    conversation_id = request.data.get("conversation_id")

    if not all([user_msg, session_id, conversation_id]):
        return Response({"error": "Missing required parameters"}, status=400)

    system_prompt = (
        f"You are a native speaker of {language} acting as a conversation partner "
        f"in the following scenario: {scenario}. "
        "Stay in character, keep the conversation going naturally. Reply in maximum 2 to 3 sentences. Pick up the language level of your partner and match it.\n"
        "Then, give language feedback on the user's message , including:\n"
        "- Any grammar/spelling issues\n"
        "- Better/more natural phrasing\n"
        "Feedback should be given in English and should be complete, but also concise."
        "Use this structure:\n"
        "REPLY: <your in-character response>\n"
        "FEEDBACK: <corrections and tips>"
    )

    # If first message in conversation, add system prompt
    if not chat_sessions[session_id][conversation_id]:
        chat_sessions[session_id][conversation_id].append({"role": "system", "content": system_prompt})

    # Add user's message to conversation history
    chat_sessions[session_id][conversation_id].append({"role": "user", "content": user_msg})

    try:
        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=chat_sessions[session_id][conversation_id]
        )

        raw_reply = response.choices[0].message.content

        # Save assistant reply to history
        chat_sessions[session_id][conversation_id].append({"role": "assistant", "content": raw_reply})

        # Save to Firestore
        save_conversation(session_id, conversation_id, language, scenario, chat_sessions[session_id][conversation_id])

        # Parse reply + feedback
        if "FEEDBACK:" in raw_reply:
            reply_part, feedback_part = raw_reply.split("FEEDBACK:", 1)
            reply_text = reply_part.replace("REPLY:", "").strip()
            feedback_text = feedback_part.strip()
        else:
            reply_text = raw_reply
            feedback_text = ""

        return Response({
            "reply": reply_text,
            "feedback": feedback_text,
            "session_id": session_id,
            "conversation_id": conversation_id
        })

    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
def end_conversation(request):
    session_id = request.data.get("session_id")
    conversation_id = request.data.get("conversation_id")

    if not all([session_id, conversation_id]):
        return Response({"error": "Missing session_id or conversation_id"}, status=400)

    if session_id not in chat_sessions or conversation_id not in chat_sessions[session_id]:
        return Response({"error": "Invalid session_id or conversation_id"}, status=400)

    # Get full message history
    messages = chat_sessions[session_id][conversation_id]

    # Enhanced prompt for final feedback
    final_prompt = (
        "Now that the conversation is over, provide a comprehensive analysis of the learner's language use. "
        "Structure your feedback in the following sections:\n\n"
        "1. Overall Progress:\n"
        "- General assessment of the conversation\n"
        "- Key strengths demonstrated\n"
        "- Areas that need improvement\n\n"
        "2. Grammar and Structure:\n"
        "- Common grammar mistakes\n"
        "- Sentence structure issues\n"
        "- Suggestions for improvement\n\n"
        "3. Vocabulary and Expression:\n"
        "- Vocabulary usage and variety\n"
        "- Natural expression and idiomatic usage\n"
        "- Words/phrases that could be used instead\n\n"
        "4. Pronunciation (if applicable):\n"
        "- Notable pronunciation patterns\n"
        "- Specific sounds or words to practice\n\n"
        "5. Action Items:\n"
        "- 3 specific things to practice\n"
        "- Recommended next steps\n\n"
        "Keep the feedback constructive and encouraging. Format it in clear paragraphs."
    )

    try:
        # Add prompt to existing messages
        full_messages = messages + [{"role": "user", "content": final_prompt}]

        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=full_messages
        )

        summary = response.choices[0].message.content.strip()

        # Mark conversation as ended in Firestore
        mark_conversation_ended(session_id, conversation_id)

        # Clean up in-memory storage
        del chat_sessions[session_id][conversation_id]
        if not chat_sessions[session_id]:
            del chat_sessions[session_id]

        return Response({"summary": summary})

    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
@parser_classes([MultiPartParser])
def voice_chat(request):
    audio_file = request.FILES.get('audio')
    language = request.data.get('language', 'English')
    scenario = request.data.get('scenario', 'a general conversation')
    session_id = request.data.get('session_id')
    conversation_id = request.data.get('conversation_id')

    if not all([audio_file, session_id, conversation_id]):
        return Response({"error": "Missing required parameters"}, status=400)

    try:
        # Transcribe audio with Whisper API
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=(audio_file.name, audio_file.file, audio_file.content_type)
        ).text

        # Step 2: Build context as before
        if not chat_sessions[session_id][conversation_id]:
            system_msg = (
                f"You are a native speaker of {language} acting as a conversation partner "
                f"in the following scenario: {scenario}. "
                "Stay in character. Then, give language feedback on the user's message, including:\n"
                "- Any grammar/spelling issues\n"
                "- Better/more natural phrasing\n"
                "- Vocabulary tips\n"
                "Use this structure:\n"
                "REPLY: <your in-character response>\n"
                "FEEDBACK: <corrections and tips>"
            )
            chat_sessions[session_id][conversation_id].append({"role": "system", "content": system_msg})

        # Add user transcript
        chat_sessions[session_id][conversation_id].append({"role": "user", "content": transcript})

        # Get GPT response
        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=chat_sessions[session_id][conversation_id]
        )
        raw_reply = response.choices[0].message.content
        chat_sessions[session_id][conversation_id].append({"role": "assistant", "content": raw_reply})

        # Save conversation
        save_conversation(session_id, conversation_id, language, scenario, chat_sessions[session_id][conversation_id])

        # Parse
        if "FEEDBACK:" in raw_reply:
            reply_part, feedback_part = raw_reply.split("FEEDBACK:", 1)
            reply_text = reply_part.replace("REPLY:", "").strip()
            feedback_text = feedback_part.strip()
        else:
            reply_text = raw_reply
            feedback_text = ""

        # Generate unique filename
        unique_id = uuid.uuid4().hex[:8]
        audio_filename = f"reply_{session_id}_{conversation_id}_{unique_id}.mp3"
        audio_path = os.path.join("media", audio_filename)

        # Ensure media directory exists
        os.makedirs("media", exist_ok=True)

        # Generate voice from ElevenLabs
        audio = eleven_labs_client.text_to_speech.convert(
            text=reply_text,
            voice_id="JBFqnCBsd6RMkjVDRZzb",
            model_id="eleven_multilingual_v2",
            output_format="mp3_44100_128",
        )
        
        # Save audio to path
        with open(audio_path, "wb") as f:
            f.write(b"".join(audio))

        return Response({
            "transcript": transcript,
            "reply": reply_text,
            "feedback": feedback_text,
            "audio_url": f"http://localhost:8000/media/{audio_filename}",
            "session_id": session_id,
            "conversation_id": conversation_id
        })

    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['GET'])
def analyze_vocabulary(request):
    """Analyze vocabulary from a session and provide recommendations"""
    session_id = request.GET.get('session_id')
    language = request.GET.get('language', 'english')
    
    if not session_id:
        return Response({'error': 'Session ID is required'}, status=400)
    
    try:
        # Get all messages from the session
        all_messages = get_session_messages(session_id)
        
        if not all_messages:
            return Response({'error': 'No messages found in session'}, status=404)
        
        # Analyze vocabulary
        analysis = vocab_analyzer.analyze_vocabulary(all_messages, language)
        
        return Response(analysis)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

