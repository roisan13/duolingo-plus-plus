from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
import json
import os
from unittest.mock import patch, MagicMock
from .firebase_utils import db
from django.conf import settings

class ChatAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.test_session_id = "test_session_123"
        self.test_conversation_id = "test_conversation_456"
        
        # Firebase patcher
        self.firebase_patcher = patch('chat.firebase_utils.db')
        self.mock_firebase = self.firebase_patcher.start()
        
        # OpenAI patcher
        self.openai_patcher = patch('openai.OpenAI')
        self.mock_openai = self.openai_patcher.start()
        
        # ELEVENLABS patcher
        self.elevenlabs_patcher = patch('elevenlabs.client.ElevenLabs')
        self.mock_elevenlabs = self.elevenlabs_patcher.start()

        # Media dir for audio files
        # os.makedirs(settings.MEDIA_ROOT, exist_ok=True)

    def tearDown(self):
        # Restore normal working behaviour
        self.firebase_patcher.stop()
        self.openai_patcher.stop()
        self.elevenlabs_patcher.stop()

    def test_initialize_session(self):
        """Test session initialization endpoint"""
        url = reverse('initialize_session')
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('session_id', response.data)
        self.assertTrue(isinstance(response.data['session_id'], str))

    def test_start_conversation(self):
        """Test starting a new conversation"""
        url = reverse('start_conversation')
        data = {'session_id': self.test_session_id}
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['session_id'], self.test_session_id)
        self.assertIn('conversation_id', response.data)

    def test_chat_with_ai_missing_params(self):
        """Test chat endpoint with missing parameters"""
        url = reverse('chat_with_ai')
        data = {}
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    @patch('openai.OpenAI')
    def test_chat_with_ai_success(self, mock_openai):
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "REPLY: Hello! FEEDBACK: Good job!"
        mock_openai.return_value.chat.completions.create.return_value = mock_response

        url = reverse('chat_with_ai')
        data = {
            'message': 'Hello',
            'language': 'French',
            'scenario': 'cafe conversation',
            'session_id': self.test_session_id,
            'conversation_id': self.test_conversation_id
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('reply', response.data)
        self.assertIn('feedback', response.data)

    def test_end_conversation_missing_params(self):
        url = reverse('end_conversation')
        data = {}
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    @patch('openai.OpenAI')
    def test_end_conversation_success(self, mock_openai):
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "Comprehensive feedback..."
        mock_openai.return_value.chat.completions.create.return_value = mock_response

        url = reverse('end_conversation')
        data = {
            'session_id': self.test_session_id,
            'conversation_id': self.test_conversation_id
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('summary', response.data)

    def test_voice_chat_missing_params(self):
        """Test voice chat with missing parameters"""
        url = reverse('voice_chat')
        data = {} # add empty data param
        
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)


    # No test_voice_chat_succes because.... yeah it's not working...... sorry.....


    def test_analyze_vocabulary_missing_params(self):
        # Test missing params
        url = reverse('analyze_vocabulary')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    @patch('chat.vocabulary_analyzer.VocabularyAnalyzer')
    def test_analyze_vocabulary_success(self, mock_analyzer):
        
        # analyze_vocabulary endpoint needs a session document with conversation
        # along with enough words in messages to be analyzed (although i think one shoudl suffice)
        # Mock every document needed in firebase:

        mock_session = {
            'created_at': '2024-03-20T10:00:00Z',
            'ended_at': None
        }
        
        mock_conversation = {
            'messages': [
                {
                    'role': 'user',
                    'content': 'Bonjour nourriture jaime la nourriture savoureux',
                    'timestamp': '2024-03-20T10:00:00Z'
                },
                {
                    'role': 'assistant',
                    'content': 'Bonjour! Vous devez aimer la nourriture!',
                    'timestamp': '2024-03-20T10:00:05Z'
                },
                {
                    'role': 'user',
                    'content': 'Bien-sur!!! J aime la nourriture savoureux. Jespere que vous avez beaucoup de nourriture savoureux.',
                    'timestamp': '2024-03-20T10:00:10Z'
                }
            ],
            'language': 'french',
            'scenario': 'food n dining',
            'created_at': '2024-03-20T10:00:00Z',
            'ended_at': None,
            'updated_at': '2024-03-20T10:05:00Z'
        }

        mock_session_doc = MagicMock()
        mock_session_doc.exists = True
        mock_session_doc.to_dict.return_value = mock_session
        # Mock the conversations collection
        mock_conversation_doc = MagicMock()
        mock_conversation_doc.to_dict.return_value = mock_conversation
        
        mock_conversations = [mock_conversation_doc]
        mock_session_ref = MagicMock()
        mock_session_ref.collection.return_value.stream.return_value = mock_conversations
        
        self.mock_firebase.collection.return_value.document.return_value = mock_session_ref
        mock_session_ref.get.return_value = mock_session_doc

        # Mock response, finally
        mock_analyzer.return_value.analyze_vocabulary.return_value = {
            'top_words': ['nourriture', 'savoureux', 'bonjour'],
            'recommendations': [
                {
                    'word': 'nourriture',
                    'synonyms': ['nourriturererasadf', 'nourritureasdasdas'],
                    'description': 'mancare foarte foarte buna',
                    'example': 'buna vreau nourriture goustoaeasa.'
                }
            ]
        }

        url = reverse('analyze_vocabulary')
        params = {
            'session_id': self.test_session_id,
            'language': 'french'
        }
        
        response = self.client.get(url, params)
        
        if response.status_code != status.HTTP_200_OK:
            print("\nVocabulary Analysis error")
            print(f"response: {response.status_code} : ")
            print(f"data: {response.data}")
            print(f"content: {response.content}")
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('top_words', response.data)
        self.assertIn('recommendations', response.data)
