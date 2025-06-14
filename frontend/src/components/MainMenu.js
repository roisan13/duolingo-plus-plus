import React from 'react';

const MainMenu = ({ onNavigate }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '2rem'
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        marginBottom: '3rem',
        color: '#2c3e50'
      }}>
        Language Learning Assistant
      </h1>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        width: '100%',
        maxWidth: '400px'
      }}>
        <button
          onClick={() => onNavigate('conversation_setup')}
          style={buttonStyle('#3498db')}
        >
          Conversation Practice
        </button>

        <button
          onClick={() => onNavigate('vocabulary')}
          style={buttonStyle('#2ecc71')}
        >
          Vocabulary Analyzer
        </button>

        <button
          onClick={() => onNavigate('pronunciation_selector')}
          style={buttonStyle('#9b59b6')}
        >
          Pronunciation Practice
        </button>
      </div>
    </div>
  );
};

const buttonStyle = (backgroundColor) => ({
  padding: '1.5rem 2rem',
  fontSize: '1.2rem',
  backgroundColor,
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'transform 0.2s, background-color 0.2s',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
});

export default MainMenu;
