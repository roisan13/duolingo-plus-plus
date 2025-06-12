import React from 'react';
import ChatBox from './ChatBox';
import VoiceChat from './VoiceChat';

const ChatInterface = ({ sessionId, conversationId, language, mode, scenario, onBack }) => {
  const getScenarioTitle = () => {
    const titles = {
      casual: 'Casual Conversation',
      business: 'Business Meeting',
      travel: 'Travel & Tourism',
      food: 'Food & Dining',
      shopping: 'Shopping'
    };
    return titles[scenario] || scenario;
  };

  if (!sessionId || !conversationId) {
    return <div>Initializing...</div>;
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '1rem',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#e0e0e0',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '1rem'
          }}
        >
          ← Back
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, color: '#2c3e50' }}>
            {getScenarioTitle()} - {language.charAt(0).toUpperCase() + language.slice(1)}
          </h2>
          <p style={{ margin: '0.25rem 0 0', color: '#666' }}>
            Mode: {mode === 'voice' ? 'Voice Chat' : 'Text Chat'}
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, padding: '1rem', overflow: 'auto' }}>
        {mode === 'voice' ? (
          <VoiceChat
            sessionId={sessionId}
            conversationId={conversationId}
            language={language}
            scenario={scenario}
          />
        ) : (
          <ChatBox
            sessionId={sessionId}
            conversationId={conversationId}
            language={language}
            scenario={scenario}
          />
        )}
      </div>
    </div>
  );
};

export default ChatInterface; 