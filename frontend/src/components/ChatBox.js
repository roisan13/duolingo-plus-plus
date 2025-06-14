import React, { useState, useEffect, useRef } from 'react';
import { sendMessage, endConversation } from '../services/chatService';

const ChatBox = ({ sessionId, conversationId, language, scenario }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || chatEnded) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessage(sessionId, conversationId, input, language, scenario);

      const assistantMessage = {
        role: 'assistant',
        content: response.reply || "Sorry, I didn’t catch that. Can you try again?",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);

      if (response.feedback) {
        const feedbackMessage = {
          role: 'system',
          content: response.feedback,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, feedbackMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'system',
        content: 'Sorry, there was an error processing your message. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndConversation = async () => {
    if (chatEnded) return;

    try {
      const response = await endConversation(sessionId, conversationId);
      const endMessage = {
        role: 'system',
        content: response.summary || 'Conversation ended. You can start a new one when ready.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, endMessage]);
    } catch (error) {
      console.error('Error ending conversation:', error);
    } finally {
      setChatEnded(true);
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

        {isLoading && (
          <div
            style={{
              alignSelf: 'flex-start',
              maxWidth: '70%',
              padding: '0.75rem 1rem',
              borderRadius: '1rem',
              backgroundColor: '#e9ecef',
              color: 'gray',
              fontStyle: 'italic',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}
          >
            Thinking...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} style={{
        padding: '1rem',
        borderTop: '1px solid #dee2e6',
        display: 'flex',
        gap: '0.5rem'
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading || chatEnded}
          style={{
            flex: 1,
            padding: '0.75rem',
            borderRadius: '4px',
            border: '1px solid #dee2e6',
            fontSize: '1rem'
          }}
        />
        <button
          type="submit"
          disabled={isLoading || chatEnded}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: chatEnded ? 'not-allowed' : 'pointer',
            fontSize: '1rem'
          }}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
        <button
          type="button"
          onClick={handleEndConversation}
          disabled={chatEnded}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: chatEnded ? '#6c757d' : '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: chatEnded ? 'not-allowed' : 'pointer',
            fontSize: '1rem'
          }}
        >
          {chatEnded ? 'Chat Ended' : 'End Chat'}
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
