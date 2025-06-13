import React, { useState } from 'react';

const VocabularyAnalysis = ({ sessionId, onBack }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const languages = [
    { id: 'english', name: 'English' },
    { id: 'french', name: 'French' },
    { id: 'spanish', name: 'Spanish' },
    { id: 'german', name: 'German' },
    { id: 'italian', name: 'Italian' }
  ];

  const fetchAnalysis = async (language) => {
    if (!sessionId || !language) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:8000/analyze_vocabulary?session_id=${sessionId}&language=${language}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze vocabulary');
      }

      let parsedRecommendations;
      try {
        parsedRecommendations = Array.isArray(data.recommendations)
          ? data.recommendations
          : JSON.parse(data.recommendations);
      } catch (parseError) {
        throw new Error('Failed to parse vocabulary recommendations');
      }

      const parsedData = {
        ...data,
        recommendations: parsedRecommendations
      };

      setAnalysis(parsedData);
    } catch (err) {
      setError(err.message || 'Failed to analyze vocabulary');
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    fetchAnalysis(language);
  };

  // Back button handler for language selection screen
  const handleBackToMenu = () => {
    setSelectedLanguage(null);
    setAnalysis(null);
    setError(null);
    setLoading(false);
  };

  if (!selectedLanguage) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: '2rem'
      }}>
        <h1 style={{
          fontSize: '2.2rem',
          color: '#2c3e50',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Select Language for Analysis
        </h1>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          width: '100%',
          maxWidth: '400px'
        }}>
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => handleLanguageSelect(lang.id)}
              style={{
                padding: '1.2rem 2rem',
                fontSize: '1.1rem',
                backgroundColor: '#3498db',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background 0.2s, transform 0.2s',
                boxShadow: '0 4px 6px rgba(0,0,0,0.08)'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#217dbb'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = '#3498db'}
            >
              {lang.name}
            </button>
          ))}
        </div>
        <button
          onClick={onBack}
          style={{
            marginTop: '2.5rem',
            padding: '0.9rem 1.5rem',
            backgroundColor: '#bbb',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '1.05rem',
            transition: 'background 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#888'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = '#bbb'}
        >
          Back
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          fontSize: '1.5rem',
          color: '#2980b9'
        }}>
          Analyzing your vocabulary...
        </div>
        <button
          onClick={handleBackToMenu}
          style={{
            position: 'absolute',
            top: 24,
            left: 24,
            padding: '0.7rem 1.2rem',
            backgroundColor: '#bbb',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '1.05rem',
            transition: 'background 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#888'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = '#bbb'}
        >
          Back
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: '2rem'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '500px',
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 6px 14px rgba(0,0,0,0.10)',
          padding: '2.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#2c3e50' }}>Vocabulary Analysis</h1>
            <button
              onClick={handleBackToMenu}
              style={{
                padding: '0.7rem 1.2rem',
                backgroundColor: '#bbb',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'background 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#888'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = '#bbb'}
            >
              Back
            </button>
          </div>
          <div style={{ color: '#e74c3c', fontSize: '1.1rem' }}>{error}</div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: '2rem'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '500px',
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 6px 14px rgba(0,0,0,0.10)',
          padding: '2.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#2c3e50' }}>Vocabulary Analysis</h1>
            <button
              onClick={handleBackToMenu}
              style={{
                padding: '0.7rem 1.2rem',
                backgroundColor: '#bbb',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'background 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#888'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = '#bbb'}
            >
              Back
            </button>
          </div>
          <div style={{ color: '#888', fontSize: '1.1rem' }}>No vocabulary analysis available.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      padding: '2rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '700px',
        background: '#fff',
        borderRadius: '18px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
        padding: '3rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{
            fontSize: '2.2rem',
            fontWeight: 800,
            color: '#2c3e50',
            letterSpacing: '-1px'
          }}>Vocabulary Analysis</h1>
          <button
            onClick={handleBackToMenu}
            style={{
              padding: '0.7rem 1.2rem',
              backgroundColor: '#bbb',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'background 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#888'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = '#bbb'}
          >
            Back
          </button>
        </div>

        {/* Most Used Words */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{
            fontSize: '1.3rem',
            fontWeight: 700,
            color: '#2980b9',
            marginBottom: '1rem'
          }}>
            Most Used Words
          </h2>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            {analysis.top_words && analysis.top_words.map((word, idx) => (
              <span key={idx} style={{
                padding: '0.7rem 1.3rem',
                backgroundColor: '#eaf6fb',
                color: '#217dbb',
                borderRadius: '18px',
                fontWeight: 600,
                fontSize: '1.05rem',
                marginBottom: '0.2rem',
                border: '1px solid #d1ebfa'
              }}>
                {word}
              </span>
            ))}
          </div>
        </section>

        {/* Recommendations */}
        <section>
          <h2 style={{
            fontSize: '1.3rem',
            fontWeight: 700,
            color: '#27ae60',
            marginBottom: '1.2rem'
          }}>
            Word Recommendations
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {analysis.recommendations && analysis.recommendations.map((rec, idx) => (
              <div key={idx} style={{
                borderBottom: '1px solid #f0f0f0',
                paddingBottom: '1.5rem'
              }}>
                {rec.word && (
                  <h3 style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: '#27ae60',
                    marginBottom: '0.7rem'
                  }}>
                    {rec.word}
                  </h3>
                )}
                {rec.synonyms && (
                  <div style={{ marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 600, color: '#888', fontSize: '0.98rem' }}>Synonyms:</span>
                    <span style={{ marginLeft: '0.5rem', display: 'inline-flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {(Array.isArray(rec.synonyms)
                        ? rec.synonyms
                        : typeof rec.synonyms === 'string'
                          ? rec.synonyms.split(',').map(s => s.trim())
                          : []
                      ).map((syn, sidx) => (
                        <span key={sidx} style={{
                          backgroundColor: '#eafaf1',
                          color: '#219150',
                          borderRadius: '10px',
                          padding: '0.3rem 0.7rem',
                          fontSize: '0.95rem',
                          marginRight: '0.3rem'
                        }}>{syn}</span>
                      ))}
                    </span>
                  </div>
                )}
                {rec.description && (
                  <div style={{ marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 600, color: '#888', fontSize: '0.98rem' }}>Description:</span>
                    <span style={{ marginLeft: '0.5rem', color: '#444', fontSize: '0.98rem' }}>{rec.description}</span>
                  </div>
                )}
                {rec.example && (
                  <div>
                    <span style={{ fontWeight: 600, color: '#888', fontSize: '0.98rem' }}>Example:</span>
                    <span style={{ marginLeft: '0.5rem', color: '#217dbb', fontStyle: 'italic', fontSize: '0.98rem' }}>
                      {rec.example}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default VocabularyAnalysis;