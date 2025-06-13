import React, { useState, useEffect } from 'react';
import MainMenu from './components/MainMenu';
import ChatInterface from './components/ChatInterface';
import VocabularyAnalysis from './components/VocabularyAnalysis';
import ConversationSetup from './components/ConversationSetup';
import { API_BASE_URL } from './config';

function App() {
  const [currentView, setCurrentView] = useState('main');
  const [sessionData, setSessionData] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const initializeChat = async () => {
    try {
      // Initialize session
      const res = await fetch(`${API_BASE_URL}/initialize_session/`, {
        method: 'POST',
      });
      const data = await res.json();
      setSessionId(data.session_id);

      const convRes = await fetch(`${API_BASE_URL}/start_conversation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: data.session_id }),
      });
      const convData = await convRes.json();
      setConversationId(convData.conversation_id);
    } catch (error) {
      console.error('Error initializing chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeChat();
  }, []);

  const handleNavigate = async (view, data = {}) => {
    if (view === 'conversation') {
      // Initialize session when starting a conversation
      await initializeChat();
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
          <ConversationSetup
            onNavigate={handleNavigate}
            onBack={() => handleNavigate('main')}
          />
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
        return (
          <VocabularyAnalysis
            sessionId={sessionId}
            onBack={() => handleNavigate('main')}
          />
        );
      default:
        return <MainMenu onNavigate={handleNavigate} />;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      {renderView()}
    </div>
  );
}

export default App;

