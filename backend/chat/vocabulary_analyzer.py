from typing import List, Dict
from collections import Counter
import openai
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# centralize all openai calls

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class VocabularyAnalyzer:
    def __init__(self):
        pass
        
    def analyze_vocabulary(self, messages: List[Dict], language: str) -> Dict:

        # this is the main function that will be called by the view
        # it will extract words from the messages and get recommendations from ChatGPT
        # return sa dictionary with the top words and recommendations

        # Extract words
        words = self._extract_words(messages)
        # print("Extracted words:", words)  # deebug print
        
        # Get top 6 most used words
        word_counts = Counter(words)
        top_words = [word for word, _ in word_counts.most_common(6)]
        # print("Top words:", top_words)  # dibag print
        
        recommendations = self._get_chatgpt_recommendations(top_words, language)
        
        return {
            'top_words': top_words,
            'recommendations': recommendations
        }
    
    def _extract_words(self, messages: List[Dict]) -> List[str]:
        """Extract words from user messages only"""
        words = []
        for msg in messages:
            # Only process user messages
            if msg.get('role') == 'user':
                print("Processing user message:", msg.get('content'))  #  Just a debug print
                # Get the content and mreove any feedback
                content = msg.get('content', '').lower()
                content = content.split('FEEDBACK:')[0].strip()
                # print("Content after spliting:", content)  # Debug print
                
                # Split into wo
                message_words = [word.strip('.,!?()[]{}":;') for word in content.split()]
                filtered_words = [word for word in message_words if len(word) > 2]
                words.extend(filtered_words)
                # print(f"Added words: {filtered_words}")  # debug
        
        print("Final word list:", words)  # Debug print
        return words
    
    def _get_chatgpt_recommendations(self, words: List[str], language: str) -> List[Dict]:

        # check for no conversations had in given language (shoudl be checked before in front?)
        if not words:
            return "[]"
            

        # Maybe this prompt should be more specific and prompt-engineered further
        prompt = f"""For each of these {language} words: {', '.join(words)}
        Provide 1-3 synonyms for each word, along with:
        - A short description in English for each of the synonyms
        - A simple example sentence for each of the synonyms
        Format the response as a JSON array of objects with these fields:
        - word: the original word
        - synonyms: array of synonyms
        - description: English description
        - example: example sentence
        Keep descriptions and examples simple and clear.
        IMPORTANT: Return ONLY the JSON array, no markdown formatting or code block markers."""
        
        try:
            response = client.chat.completions.create(
                model="gpt-4-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful language learning assistant. Always return clean JSON without any markdown formatting or code block markers."},
                    {"role": "user", "content": prompt}
                ]
            )
            
            recommendations = response.choices[0].message.content.strip()
            # Remove any markdown code block markers if they exist
            recommendations = recommendations.replace('```json', '').replace('```', '').strip()
            return recommendations
            
        except Exception as e:
            print(f"Error getting ChatGPT recommendations: {str(e)}")
            return "[]" 