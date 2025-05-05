import React, { useState } from 'react';
import Selector from './components/Selector';
import ChatBox from './components/ChatBox';

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [language, setLanguage] = useState('');
  const [scenario, setScenario] = useState('');

  return (
    <div className="App">
      {!sessionId ? (
        <Selector
          setLanguage={setLanguage}
          setScenario={setScenario}
          onStart={() => {
            // Generate session ID on start
            const id = Date.now().toString();
            setSessionId(id);
          }}
        />
      ) : (
        <ChatBox
          sessionId={sessionId}
          language={language}
          scenario={scenario}
        />
      )}
    </div>
  );
}

export default App;

