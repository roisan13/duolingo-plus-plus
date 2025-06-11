from sentence_transformers import SentenceTransformer
import numpy as np
from collections import Counter
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import spacy
from typing import List, Dict, Tuple
import os

# Download required NLTK data
nltk.download('punkt')
nltk.download('stopwords')

class VocabularyAnalyzer:
    def __init__(self):
        # Load multilingual model
        self.model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')
        # Load spaCy for better word analysis
        self.nlp = spacy.load("xx_ent_wiki_sm")  # Multilingual model
        
    def get_session_vocabulary(self, messages: List[Dict]) -> Dict[str, int]:
        """Extract vocabulary from user messages in a session"""
        all_words = []
        for msg in messages:
            if msg['role'] == 'user':
                # Tokenize and clean the message
                words = word_tokenize(msg['content'].lower())
                # Remove stopwords and non-alphabetic tokens
                words = [w for w in words if w.isalpha() and w not in stopwords.words('english')]
                all_words.extend(words)
        
        # Count word frequencies
        return dict(Counter(all_words))
    
    def get_similar_words(self, word: str, language: str = 'en') -> List[Tuple[str, float]]:
        """Get similar words using the multilingual model"""
        # Get word embedding
        word_embedding = self.model.encode([word])[0]
        
        # Get similar words from a predefined vocabulary set
        # In a real application, you'd want to use a proper dictionary/thesaurus
        # For now, we'll use a simple example set
        similar_words = self.model.encode([
            "excellent", "wonderful", "fantastic", "amazing", "great",
            "good", "nice", "fine", "okay", "decent",
            "bad", "poor", "terrible", "awful", "horrible"
        ])
        
        # Calculate similarities
        similarities = np.dot(similar_words, word_embedding) / (
            np.linalg.norm(similar_words, axis=1) * np.linalg.norm(word_embedding)
        )
        
        # Get top 5 similar words
        top_indices = np.argsort(similarities)[-5:][::-1]
        return [(word, float(similarities[i])) for i, word in enumerate([
            "excellent", "wonderful", "fantastic", "amazing", "great",
            "good", "nice", "fine", "okay", "decent",
            "bad", "poor", "terrible", "awful", "horrible"
        ]) if i in top_indices]
    
    def analyze_session(self, messages: List[Dict], language: str = 'en') -> Dict:
        """Analyze a session and provide vocabulary recommendations"""
        # Get vocabulary usage
        vocab = self.get_session_vocabulary(messages)
        
        # Get top 10 most used words
        top_words = sorted(vocab.items(), key=lambda x: x[1], reverse=True)[:10]
        
        # Get similar words for each top word
        recommendations = {}
        for word, count in top_words:
            similar_words = self.get_similar_words(word, language)
            recommendations[word] = {
                'count': count,
                'similar_words': similar_words
            }
        
        return {
            'top_words': top_words,
            'recommendations': recommendations
        } 