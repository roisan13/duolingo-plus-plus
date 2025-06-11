import React, { useState, useEffect } from 'react';

const VocabularyAnalysis = ({ sessionId, language, onBack }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await fetch(`http://localhost:8000/analyze_vocabulary/?session_id=${sessionId}&language=${language}`);
        const data = await res.json();
        setAnalysis(data);
      } catch (err) {
        console.error('Error fetching vocabulary analysis:', err);
        setError('Failed to load vocabulary analysis');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchAnalysis();
    }
  }, [sessionId, language]);

  if (loading) {
    return <div>Loading vocabulary analysis...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  if (!analysis) {
    return <div>No vocabulary data available</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Vocabulary Analysis</h2>
        <button 
          onClick={onBack}
          style={{
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Back to Chat
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Most Used Words</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {analysis.top_words.map(([word, count]) => (
            <div 
              key={word}
              style={{
                backgroundColor: '#f0f0f0',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span style={{ fontWeight: 'bold' }}>{word}</span>
              <span style={{ color: '#666' }}>({count} times)</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3>Vocabulary Recommendations</h3>
        {Object.entries(analysis.recommendations).map(([word, data]) => (
          <div 
            key={word}
            style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              border: '1px solid #ddd'
            }}
          >
            <h4 style={{ marginBottom: '0.5rem' }}>
              Instead of "{word}" ({data.count} times), try:
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {data.similar_words.map(([similar, score]) => (
                <div
                  key={similar}
                  style={{
                    backgroundColor: '#e3f2fd',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '4px',
                    fontSize: '0.9rem'
                  }}
                >
                  {similar}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VocabularyAnalysis; 