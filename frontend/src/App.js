<<<<<<< HEAD
import React, { useState, useEffect, useRef } from 'react';
=======
// === App.js ===
import React, { useState, useEffect } from 'react';
>>>>>>> full-dev
import MainMenu from './components/MainMenu';
import ChatInterface from './components/ChatInterface';
import VocabularyAnalysis from './components/VocabularyAnalysis';
import ConversationSetup from './components/ConversationSetup';
<<<<<<< HEAD
import { API_BASE_URL } from './config';
=======
import LanguageSelector from './components/LanguageSelector';
import PronunciationFeedback from './components/PronunciationFeedback';
>>>>>>> full-dev

function App() {
  const [currentView, setCurrentView] = useState('main');
  const [sessionData, setSessionData] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [conversationId, setConversationId] = useState(null);
<<<<<<< HEAD
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const initialized = useRef(false);
=======
  const [pronunciationLang, setPronunciationLang] = useState(null);
>>>>>>> full-dev

  // Initialize session only once when app loads
  const initializeSession = async () => {
    if (initialized.current) return true;
    
    try {
      setError(null);
      // console.log('Initializing session with API:', API_BASE_URL);
      
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
      // console.log('Session initialized:', data);
      setSessionId(data.session_id);
      initialized.current = true;
      return true;
    } catch (error) {
      console.error('Error initializing session:', error);
      setError(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Start a new conversation
  const startConversation = async () => {
    try {
      setError(null);
      // console.log('Starting new conversation with session:', sessionId);
      
      const convRes = await fetch(`${API_BASE_URL}/start_conversation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId }),
        mode: 'cors',
        credentials: 'include'
      });

      if (!convRes.ok) {
        throw new Error(`HTTP error! status: ${convRes.status}`);
      }

      const convData = await convRes.json();
      console.log('Conversation started:', convData);
      setConversationId(convData.conversation_id);
      return true;
    } catch (error) {
      console.error('Error starting conversation:', error);
      setError(error.message);
      return false;
    }
  };

  // Initialize session when app loads
  useEffect(() => {
    initializeSession();
  }, []);

  const handleNavigate = async (view, data = {}) => {
    if (view === 'conversation') {
<<<<<<< HEAD
      setIsLoading(true);
      // Start a new conversation when user clicks the button
      const success = await startConversation();
      if (success) {
        setSessionData(data);
        setCurrentView(view);
      }
      setIsLoading(false);
    } else {
      setCurrentView(view);
=======
      await initializeSession();
      setSessionData(data);
>>>>>>> full-dev
    }
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
        if (!sessionId || !conversationId) {
          return <div>Loading session...</div>;
        }
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

<<<<<<< HEAD
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
=======
  return <div className="App">{renderView()}</div>;
>>>>>>> full-dev
}

export default App;
