import React, { useState } from 'react';

const Selector = ({ setLanguage, setScenario, onStart }) => {
  const [localLang, setLocalLang] = useState('');
  const [localScenario, setLocalScenario] = useState('');
  const [chatMode, setChatMode] = useState('');


  const handleStart = () => {
    if (!localLang || !localScenario || !chatMode) {
      alert('Please select language, scenario, and chat mode');
      return;
    }
    setLanguage(localLang);
    setScenario(localScenario);
    onStart(chatMode);
    
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Select Language & Scenario</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label>Language:</label><br />
        <select value={localLang} onChange={(e) => setLocalLang(e.target.value)}>
          <option value="">-- Choose Language --</option>
          <option value="French">French</option>
          <option value="Italian">Italian</option>
          <option value="English">English</option>
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Scenario:</label><br />
        <select value={localScenario} onChange={(e) => setLocalScenario(e.target.value)}>
          <option value="">-- Choose Scenario --</option>
          <option value="ordering coffee">Ordering Coffee</option>
          <option value="buying movie tickets">Buying Movie Tickets</option>
          <option value="inviting someone to dinner">Inviting Someone to Dinner</option>
          <option value="having a chat in a café">Chatting in a Café</option>
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Mode:</label><br />
        <select value={chatMode} onChange={(e) => setChatMode(e.target.value)}>
          <option value="">-- Choose Chat Mode --</option>
          <option value="text">Text Chat</option>
          <option value="voice">Voice Chat</option>
        </select>
      </div>


      <button onClick={handleStart}>Start Conversation</button>
    </div>
  );
};

export default Selector;
