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
  const [error, setError] = useState(null);

  const initializeChat = async () => {
    try {
      setError(null);
      console.log('Initializing session with API:', API_BASE_URL);
      
      // Initialize session
      const res = await fetch(`${API_BASE_URL}/initialize_session/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Session initialized:', data);
      setSessionId(data.session_id);

      // Start conversation
      const convRes = await fetch(`${API_BASE_URL}/start_conversation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ session_id: data.session_id }),
        mode: 'cors',
        credentials: 'include'
      });

      if (!convRes.ok) {
        throw new Error(`HTTP error! status: ${convRes.status}`);
      }

      const convData = await convRes.json();
      console.log('Conversation started:', convData);
      setConversationId(convData.conversation_id);
    } catch (error) {
      console.error('Error initializing chat:', error);
      setError(error.message);
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

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="App">
      {renderView()}
    </div>
  );
}

export default App;

