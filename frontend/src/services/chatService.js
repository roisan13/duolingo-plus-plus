import { API_BASE_URL } from '../config';

// Function to send a text message
export const sendMessage = async (message, sessionId, conversationId, language, scenario) => {
  const response = await fetch(`${API_BASE_URL}/chat/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      session_id: sessionId,
      conversation_id: conversationId,
      language,
      scenario
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  return response.json();
};

// Function to end a conversation
export const endConversation = async (sessionId, conversationId) => {
  const response = await fetch(`${API_BASE_URL}/end_conversation/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session_id: sessionId,
      conversation_id: conversationId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to end conversation');
  }

  return response.json();
}; 