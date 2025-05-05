import React, { useState } from 'react';

const Selector = ({ setLanguage, setScenario, onStart }) => {
  const [localLang, setLocalLang] = useState('');
  const [localScenario, setLocalScenario] = useState('');

  const handleStart = () => {
    if (!localLang || !localScenario) {
      alert('Please select both language and scenario');
      return;
    }
    setLanguage(localLang);
    setScenario(localScenario);
    onStart();
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

      <button onClick={handleStart}>Start Conversation</button>
    </div>
  );
};

export default Selector;
