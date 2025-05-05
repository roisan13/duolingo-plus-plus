import React, { useState } from 'react';

const ChatBox = ({ sessionId, language, scenario }) => {
  const [messages, setMessages] = useState([]); // { user, ai, feedback }
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [conversationEnded, setConversationEnded] = useState(false);


  const sendMessage = async () => {
    if (!input.trim()) return;

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
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/end_conversation/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
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
  

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

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
      />

      <button onClick={sendMessage} disabled={loading}>
        {loading ? 'Sending...' : 'Send'}
      </button>

      <div style={{ marginTop: '1rem' }}>
        <button onClick={finishConversation} disabled={loading || conversationEnded}>
          {conversationEnded ? 'Conversation Finished' : 'Finish Conversation'}
        </button>
      </div>

      {summary && (
        <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc', backgroundColor: '#f9f9f9' }}>
          <h3>Final Feedback</h3>
          <p>{summary}</p>
        </div>
      )}

      
    </div>
  );
};

export default ChatBox;
