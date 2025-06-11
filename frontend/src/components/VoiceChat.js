import React, { useState, useRef, useEffect } from 'react';

const VoiceChat = ({ language, scenario }) => {
  const [recording, setRecording] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [conversationEnded, setConversationEnded] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  useEffect(() => {
    // Initialize session when component mounts
    const initializeSession = async () => {
      try {
        const res = await fetch('http://localhost:8000/initialize_session/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await res.json();
        setSessionId(data.session_id);
        
        // Start a new conversation
        const convRes = await fetch('http://localhost:8000/start_conversation/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ session_id: data.session_id }),
        });
        const convData = await convRes.json();
        setConversationId(convData.conversation_id);
      } catch (err) {
        console.error('Error initializing session:', err);
        alert('Failed to initialize session.');
      }
    };

    initializeSession();
  }, []);

  const startRecording = async () => {
    if (!sessionId || !conversationId) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (e) => {
      audioChunks.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      setLoading(true);
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
      const file = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });

      const formData = new FormData();
      formData.append('audio', file);
      formData.append('language', language);
      formData.append('scenario', scenario);
      formData.append('session_id', sessionId);
      formData.append('conversation_id', conversationId);

      try {
        const res = await fetch('http://localhost:8000/voice_chat/', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        setMessages(prev => [...prev, {
          transcript: data.transcript,
          reply: data.reply,
          feedback: data.feedback,
          audioUrl: data.audio_url
        }]);
      } catch (err) {
        console.error('Error:', err);
        alert('Failed to process voice message.');
      } finally {
        setLoading(false);
        audioChunks.current = [];
      }
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  const finishConversation = async () => {
    if (!sessionId || !conversationId) return;
    
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/end_conversation/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          session_id: sessionId,
          conversation_id: conversationId 
        }),
      });
  
      const data = await res.json();
      setSummary(data.summary);
      setConversationEnded(true);
    } catch (err) {
      console.error('Error ending conversation:', err);
      alert('Failed to end conversation.');
    } finally {
      setLoading(false);
    }
  };

  const startNewConversation = async () => {
    if (!sessionId) return;
    
    try {
      const res = await fetch('http://localhost:8000/start_conversation/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
      });
      
      const data = await res.json();
      setConversationId(data.conversation_id);
      setMessages([]);
      setSummary('');
      setConversationEnded(false);
    } catch (err) {
      console.error('Error starting new conversation:', err);
      alert('Failed to start new conversation.');
    }
  };

  if (!sessionId || !conversationId) {
    return <div>Initializing...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🎤 Voice Chat — {language} ({scenario})</h2>

      <div style={{ marginBottom: '1rem' }}>
        <button 
          onClick={recording ? stopRecording : startRecording}
          disabled={loading || conversationEnded}
        >
          {recording ? 'Stop' : 'Start Recording'}
        </button>

        <div style={{ marginTop: '1rem' }}>
          {!conversationEnded ? (
            <button onClick={finishConversation} disabled={loading}>
              Finish Conversation
            </button>
          ) : (
            <button onClick={startNewConversation} disabled={loading}>
              Start New Conversation
            </button>
          )}
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: '1.5rem' }}>
            <div><strong>Transcript:</strong> {msg.transcript}</div>
            <div>
              <strong>AI:</strong> {msg.reply}
              {msg.audioUrl && (
                <button
                  onClick={() => new Audio(msg.audioUrl).play()}
                  style={{ marginLeft: '1rem' }}
                >
                  🔊 Play Reply
                </button>
              )}
            </div>
            <div style={{ color: 'green' }}><strong>Feedback:</strong> {msg.feedback}</div>
          </div>
        ))}
      </div>

      {summary && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #ccc', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '1rem', borderBottom: '2px solid #3498db', paddingBottom: '0.5rem' }}>
            Final Feedback
          </h3>
          <div style={{ 
            whiteSpace: 'pre-line',
            lineHeight: '1.6',
            color: '#34495e'
          }}>
            {summary}
          </div>
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
            <button 
              onClick={startNewConversation}
              style={{
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Start New Conversation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceChat;
