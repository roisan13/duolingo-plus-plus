import React from 'react';

const LanguageSelector = ({ onSelect, onBack }) => {
  const handleSelect = (lang) => {
    onSelect(lang);
  };

  return (
    <div style={{
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem 3rem',
        width: '100%',
        maxWidth: '600px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem'
      }}>
        
        <button
          onClick={onBack}
          style={{
            alignSelf: 'flex-start',
            backgroundColor: '#e0e0e0',
            color: '#333',
            border: 'none',
            padding: '0.4rem 0.8rem',
            borderRadius: '4px',
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          ← Back to Main Menu
        </button>

        <h2 style={{ margin: 0 }}>Select Language</h2>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'center'
        }}>
          {['English', 'Spanish', 'French'].map((lang) => (
            <button
              key={lang}
              onClick={() => handleSelect(lang)}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                backgroundColor: '#e0e0e0',
                color: '#333',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d5d5d5'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;
