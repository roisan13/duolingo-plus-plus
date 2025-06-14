import React, { useRef, useState } from 'react';

const PronunciationFeedback = ({ onBack, sessionId, conversationId, language }) => {
  const [feedback, setFeedback] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    if (!inputText.trim()) {
      alert("Please enter text to practice before recording.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        submitAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access error:", err);
      alert("Microphone permission is required.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const submitAudio = async (audioBlob) => {
    setIsLoading(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('text', inputText);
      formData.append('session_id', sessionId);
      formData.append('conversation_id', conversationId);
      formData.append('language', language);
      formData.append('user_id', 'frontend-user');

      if (language === 'Spanish') formData.append('dialect', 'es-es');
      else if (language === 'French') formData.append('dialect', 'fr-fr');

      const response = await fetch('http://localhost:8000/analyze_pronunciation/', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      console.log(data);
      setFeedback(data);
    } catch (error) {
      console.error("Pronunciation error:", error);
      alert("Failed to analyze pronunciation.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div style={{
    backgroundColor: '#f5f5f5', // light gray background
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
      maxWidth: '700px',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '1.5rem'
    }}>
      
      <button
        onClick={onBack}
        style={{
          backgroundColor: '#e0e0e0',
          color: '#333',
          border: 'none',
          padding: '0.4rem 0.8rem',
          borderRadius: '4px',
          fontSize: '0.9rem',
          cursor: 'pointer',
          alignSelf: 'flex-start'
        }}
      >
        ← Back
      </button>

      <h2 style={{ alignSelf: 'center', width: '100%', textAlign: 'center', marginBottom: '1rem' }}>
        Pronunciation Feedback
      </h2>

      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Type the phrase you want to pronounce..."
        rows={3}
        style={{
          width: '100%',
          padding: '1rem',
          borderRadius: '6px',
          border: '1px solid #ccc',
          fontSize: '1rem'
        }}
      />

      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isLoading}
        style={{
          alignSelf: 'center',
          padding: '0.75rem 1.5rem',
          backgroundColor: isRecording ? '#dc3545' : '#2ECC71',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '1rem',
          cursor: 'pointer'
        }}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>

      {isLoading && <p>Analyzing pronunciation...</p>}

      {feedback && (
        <div style={{ width: '100%' }}>
          <h4>Score Summary</h4>
          <p><strong>Overall:</strong> {feedback.overall_score}</p>

          <h4>Per Word:</h4>
          <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
            {feedback.words?.map((word, i) => (
              <li key={i} style={{ marginBottom: '0.5rem', borderBottom: '1px dashed #ccc', paddingBottom: '0.5rem' }}>
                <strong>{word.word}</strong> – {word.score}/100
                {word.phonemes && (
                  <ul style={{ paddingLeft: '1rem', color: '#555' }}>
                    {word.phonemes.map((p, j) => (
                      <li key={j}><code>{p.symbol}</code> – {p.score.toFixed(1)} <em>({p.hint})</em></li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
);

};

export default PronunciationFeedback;
