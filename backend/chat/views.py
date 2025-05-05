from rest_framework.parsers import MultiPartParser
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from openai import OpenAI
import os
from dotenv import load_dotenv
from collections import defaultdict
from .firebase_utils import save_conversation



load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# TEMPORARY in-memory store: { session_id: [message_dicts] }
chat_sessions = defaultdict(list)


@api_view(['POST'])
def chat_with_ai(request):
    user_msg = request.data.get("message", "")
    language = request.data.get("language", "English")
    scenario = request.data.get("scenario", "a general conversation")
    session_id = request.data.get("session_id", "default")

    if not user_msg:
        return Response({"error": "No message provided."}, status=400)

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

    # If first message in session, add system prompt
    if not chat_sessions[session_id]:
        chat_sessions[session_id].append({"role": "system", "content": system_prompt})

    # Add user's message to session history
    chat_sessions[session_id].append({"role": "user", "content": user_msg})

    try:
        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=chat_sessions[session_id]
        )

        raw_reply = response.choices[0].message.content

        # Save assistant reply to history
        chat_sessions[session_id].append({"role": "assistant", "content": raw_reply})

        # Save to Firestore
        save_conversation(session_id, language, scenario, chat_sessions[session_id])


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
            "session_id": session_id  # return it so frontend can store it
        })

    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
def end_conversation(request):
    session_id = request.data.get("session_id", "")

    if not session_id or session_id not in chat_sessions:
        return Response({"error": "Invalid session_id"}, status=400)

    # Get full message history
    messages = chat_sessions[session_id]

    # Prompt GPT for final feedback
    final_prompt = (
        "Now that the conversation is over, analyze the learner's language use over the full length of the conversation.\n"
        "Provide feedback on:\n"
        "- Common grammar/spelling mistakes\n"
        "- More natural phrasing alternatives\n"
        "- A final tip to improve.\n\n"
        "Return your feedback in paragraph form."
    )

    try:
        # Add prompt to existing messages
        full_messages = messages + [{"role": "user", "content": final_prompt}]

        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=full_messages
        )

        summary = response.choices[0].message.content.strip()

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

    if not audio_file or not session_id:
        return Response({"error": "Missing audio or session ID"}, status=400)

    try:
        # Transcribe audio with Whisper API
        transcript = openai.Audio.transcribe("whisper-1", audio_file)['text']

        # Step 2: Build context as before
        if not chat_sessions[session_id]:
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
            chat_sessions[session_id].append({"role": "system", "content": system_msg})

        # Add user transcript
        chat_sessions[session_id].append({"role": "user", "content": transcript})

        # Step 3: Get GPT response
        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=chat_sessions[session_id]
        )
        raw_reply = response.choices[0].message.content
        chat_sessions[session_id].append({"role": "assistant", "content": raw_reply})

        # Step 4: Save conversation
        save_conversation(session_id, language, scenario, chat_sessions[session_id])

        # Step 5: Parse
        if "FEEDBACK:" in raw_reply:
            reply_part, feedback_part = raw_reply.split("FEEDBACK:", 1)
            reply_text = reply_part.replace("REPLY:", "").strip()
            feedback_text = feedback_part.strip()
        else:
            reply_text = raw_reply
            feedback_text = ""

        return Response({
            "transcript": transcript,
            "reply": reply_text,
            "feedback": feedback_text
        })

    except Exception as e:
        return Response({"error": str(e)}, status=500)

