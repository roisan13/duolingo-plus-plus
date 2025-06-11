from fastapi import APIRouter, HTTPException
from typing import Dict, List, Tuple
from app.services.firebase_service import get_session_messages
from app.services.language_service import get_language_model
import numpy as np
from collections import Counter

router = APIRouter()

@router.get("/analyze_vocabulary")
async def analyze_vocabulary(session_id: str, language: str):
    try:
        # Get messages from the session
        messages = await get_session_messages(session_id)
        if not messages:
            raise HTTPException(status_code=404, detail="Session not found")

        # Get language model for word embeddings
        model = get_language_model(language)
        if not model:
            raise HTTPException(status_code=400, detail=f"Language {language} not supported")

        # Extract words from messages
        words = []
        for message in messages:
            if message.get('role') == 'user':
                text = message.get('content', '')
                words.extend(text.lower().split())

        # Count word frequencies
        word_counts = Counter(words)
        
        # Get top 10 most used words
        top_words = word_counts.most_common(10)

        # Find overused words (words used more than 3 times)
        overused_words = {word: count for word, count in word_counts.items() if count > 3}

        # Get word embeddings for overused words
        recommendations = {}
        for word, count in overused_words.items():
            try:
                # Get word vector
                word_vector = model[word]
                
                # Find similar words
                similar_words = []
                for other_word in model.vocab:
                    if other_word != word:
                        other_vector = model[other_word]
                        similarity = np.dot(word_vector, other_vector) / (
                            np.linalg.norm(word_vector) * np.linalg.norm(other_vector)
                        )
                        similar_words.append((other_word, similarity))

                # Sort by similarity and get top 5
                similar_words.sort(key=lambda x: x[1], reverse=True)
                top_similar = similar_words[:5]

                recommendations[word] = {
                    'count': count,
                    'similar_words': top_similar
                }
            except KeyError:
                # Skip words not in vocabulary
                continue

        return {
            'top_words': top_words,
            'recommendations': recommendations
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 