import React, { useState } from 'react';
import Selector from './components/Selector';
import ChatBox from './components/ChatBox';
import VoiceChat from './components/VoiceChat';


function App() {
  const [sessionId, setSessionId] = useState(null);
  const [language, setLanguage] = useState('');
  const [scenario, setScenario] = useState('');
  const [chatMode, setChatMode] = useState('');


  return (
    <div className="App">
      {!sessionId ? (
        <Selector
          setLanguage={setLanguage}
          setScenario={setScenario}
          onStart={(mode) => {
            const id = Date.now().toString();
            setSessionId(id);
            setChatMode(mode);
          }}
        />
      ) : chatMode === 'text' ? (
        <ChatBox sessionId={sessionId} language={language} scenario={scenario} />
      ) : (
        <VoiceChat sessionId={sessionId} language={language} scenario={scenario} />
      )}
    </div>
  );
}

export default App;

