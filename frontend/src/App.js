// === App.js ===
import React, { useState, useEffect } from 'react';
import MainMenu from './components/MainMenu';
import ChatInterface from './components/ChatInterface';
import VocabularyAnalysis from './components/VocabularyAnalysis';
import ConversationSetup from './components/ConversationSetup';
import LanguageSelector from './components/LanguageSelector';
import PronunciationFeedback from './components/PronunciationFeedback';

function App() {
  const [currentView, setCurrentView] = useState('main');
  const [sessionData, setSessionData] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [pronunciationLang, setPronunciationLang] = useState(null);

  const initializeSession = async () => {
    try {
      const res = await fetch('http://localhost:8000/initialize_session/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      setSessionId(data.session_id);

      const convRes = await fetch('http://localhost:8000/start_conversation/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: data.session_id }),
      });
      const convData = await convRes.json();
      setConversationId(convData.conversation_id);
    } catch (err) {
      console.error('Error initializing session:', err);
      alert('Failed to initialize session.');
    }
  };

  const handleNavigate = async (view, data = {}) => {
    if (view === 'conversation') {
      await initializeSession();
      setSessionData(data);
    }
    setCurrentView(view);
  };

  const renderView = () => {
    switch (currentView) {
      case 'main':
        return <MainMenu onNavigate={handleNavigate} />;
      case 'conversation_setup':
        return (
          <ConversationSetup onNavigate={handleNavigate} onBack={() => handleNavigate('main')} />
        );
      case 'conversation':
        return (
          <ChatInterface
            sessionId={sessionId}
            conversationId={conversationId}
            language={sessionData.language}
            mode={sessionData.mode}
            scenario={sessionData.scenario}
            onBack={() => handleNavigate('conversation_setup')}
          />
        );
      case 'vocabulary':
        return <VocabularyAnalysis sessionId={sessionId} onBack={() => handleNavigate('main')} />;
      case 'pronunciation_selector':
        return (
          <LanguageSelector
            onSelect={(lang) => {
              setPronunciationLang(lang);
              setCurrentView('pronunciation_feedback');
            }}
            onBack={() => setCurrentView('main')}
          />
        );
      case 'pronunciation_feedback':
        return (
          <PronunciationFeedback
            language={pronunciationLang}
            sessionId={sessionId || 'frontend-session'}
            conversationId={conversationId || 'frontend-convo'}
            onBack={() => setCurrentView('main')}
          />
        );
      default:
        return <MainMenu onNavigate={handleNavigate} />;
    }
  };

  return <div className="App">{renderView()}</div>;
}

export default App;
