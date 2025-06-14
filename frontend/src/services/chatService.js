import { API_BASE_URL } from '../config';

// Function to send a text message
export const sendMessage = async (message, sessionId, conversationId, language, scenario) => {
  try {
    console.log('Sending message with:', {
      sessionId,
      conversationId,
      language,
      scenario
    });

    const response = await fetch(`${API_BASE_URL}/chat/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
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
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send message');
    }

    return response.json();
  } catch (error) {
    console.error('Error in sendMessage:', error);
    throw error;
  }
};

// Function to end a conversation
export const endConversation = async (sessionId, conversationId) => {
  try {
    console.log('Ending conversation:', {
      sessionId,
      conversationId
    });

    const response = await fetch(`${API_BASE_URL}/end_conversation/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        conversation_id: conversationId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to end conversation');
    }

    return response.json();
  } catch (error) {
    console.error('Error in endConversation:', error);
    throw error;
  }
}; 