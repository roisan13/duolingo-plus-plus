import React, { useState } from 'react';

const ConversationSetup = ({ onNavigate, onBack }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedMode, setSelectedMode] = useState('');
  const [selectedScenario, setSelectedScenario] = useState('');

  const languages = [
    { code: 'english', name: 'English' },
    { code: 'spanish', name: 'Spanish' },
    { code: 'french', name: 'French' },
    { code: 'german', name: 'German' },
    { code: 'italian', name: 'Italian' }
  ];

  const scenarios = [
    { id: 'casual', name: 'Casual Conversation' },
    { id: 'business', name: 'Business Meeting' },
    { id: 'travel', name: 'Travel & Tourism' },
    { id: 'food', name: 'Food & Dining' },
    { id: 'shopping', name: 'Shopping' }
  ];

  const handleStart = () => {
    if (!selectedLanguage || !selectedMode || !selectedScenario) {
      alert('Please select all options before starting');
      return;
    }
    onNavigate('conversation', {
      language: selectedLanguage,
      mode: selectedMode,
      scenario: selectedScenario
    });
  };

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
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        width: '100%',
        maxWidth: '500px',
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header with Back Button */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
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
            ← Back to Main Menu
          </button>
          <h2 style={{ margin: 0, color: '#2c3e50' }}>Conversation Setup</h2>
        </div>

        {/* Language Selection */}
        <div>
          <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Select Language</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: selectedLanguage === lang.code ? '#3498db' : '#e0e0e0',
                  color: selectedLanguage === lang.code ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Mode Selection */}
        <div>
          <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Select Chat Mode</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setSelectedMode('text')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: selectedMode === 'text' ? '#3498db' : '#e0e0e0',
                color: selectedMode === 'text' ? 'white' : '#333',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                flex: 1
              }}
            >
              Text Chat
            </button>
            <button
              onClick={() => setSelectedMode('voice')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: selectedMode === 'voice' ? '#3498db' : '#e0e0e0',
                color: selectedMode === 'voice' ? 'white' : '#333',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                flex: 1
              }}
            >
              Voice Chat
            </button>
          </div>
        </div>

        {/* Scenario Selection */}
        <div>
          <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Select Scenario</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {scenarios.map(scenario => (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario.id)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: selectedScenario === scenario.id ? '#3498db' : '#e0e0e0',
                  color: selectedScenario === scenario.id ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {scenario.name}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          style={{
            padding: '1rem 2rem',
            fontSize: '1.2rem',
            backgroundColor: '#2ecc71',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'transform 0.2s, background-color 0.2s',
            marginTop: '1rem'
          }}
        >
          Start Practice
        </button>
      </div>
    </div>
  );
};

export default ConversationSetup; 