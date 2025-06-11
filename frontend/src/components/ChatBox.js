import React, { useState, useEffect } from 'react';

const ChatBox = ({ language, scenario }) => {
  const [messages, setMessages] = useState([]); // { user, ai, feedback }
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [conversationEnded, setConversationEnded] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [conversationId, setConversationId] = useState(null);

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

  const sendMessage = async () => {
    if (!input.trim() || !sessionId || !conversationId) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          session_id: sessionId,
          conversation_id: conversationId,
          language,
          scenario,
        }),
      });

      const data = await res.json();

      setMessages(prev => [...prev, {
        user: userMessage,
        ai: data.reply,
        feedback: data.feedback
      }]);

    } catch (err) {
      console.error('Error:', err);
      alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  if (!sessionId || !conversationId) {
    return <div>Initializing...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Chat — {language} ({scenario})</h2>

      <div style={{ maxHeight: '50vh', overflowY: 'auto', marginBottom: '1rem' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: '1.5rem' }}>
            <div><strong>You:</strong> {msg.user}</div>
            <div><strong>AI:</strong> {msg.ai}</div>
            <div style={{ color: 'green' }}><strong>Feedback:</strong> {msg.feedback}</div>
          </div>
        ))}
      </div>

      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Type your message..."
        style={{ width: '80%', marginRight: '1rem' }}
        disabled={conversationEnded}
      />

      <button onClick={sendMessage} disabled={loading || conversationEnded}>
        {loading ? 'Sending...' : 'Send'}
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

export default ChatBox;
