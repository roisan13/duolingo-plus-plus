import React, { useState, useEffect, useRef } from 'react';
import { endConversation } from '../services/chatService';
import { API_BASE_URL } from '../config';

const VoiceChat = ({ sessionId, conversationId, language, scenario }) => {
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await handleAudioSubmission(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleAudioSubmission = async (audioBlob) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('session_id', sessionId);
      formData.append('conversation_id', conversationId);
      formData.append('language', language);
      formData.append('scenario', scenario);

      const response = await fetch(`${API_BASE_URL}/voice_chat/`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      // Add user's transcribed message
      setMessages(prev => [...prev, {
        role: 'user',
        content: data.transcript,
        timestamp: new Date().toISOString()
      }]);

      // Add AI's reply
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString()
      }]);

      // Add feedback if available
      if (data.feedback) {
        setMessages(prev => [...prev, {
          role: 'system',
          content: data.feedback,
          timestamp: new Date().toISOString()
        }]);
      }

      // Play audio response if available
      if (data.audio_url) {
        const audio = new Audio(data.audio_url);
        audio.play();
      }

    } catch (error) {
      console.error('Error processing audio:', error);
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'Error processing audio. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndConversation = async () => {
    try {
      const response = await endConversation(sessionId, conversationId);
      setMessages(prev => [...prev, {
        role: 'system',
        content: response.summary || 'Conversation ended. You can start a new one when ready.',
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error ending conversation:', error);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '70%',
              padding: '0.75rem 1rem',
              borderRadius: '1rem',
              backgroundColor: message.role === 'user' ? '#007bff' : 
                             message.role === 'system' ? '#f8f9fa' : '#e9ecef',
              color: message.role === 'user' ? 'white' : 'black',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              border: message.role === 'system' ? '1px solid #dee2e6' : 'none'
            }}
          >
            {message.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Controls Area */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid #dee2e6',
        display: 'flex',
        gap: '0.5rem',
        justifyContent: 'center'
      }}>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isLoading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: isRecording ? '#dc3545' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        <button
          onClick={handleEndConversation}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          End Chat
        </button>
      </div>
    </div>
  );
};

export default VoiceChat;
