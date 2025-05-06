import React, { useState, useRef } from 'react';

const VoiceChat = ({ sessionId, language, scenario }) => {
  const [recording, setRecording] = useState(false);
  const [messages, setMessages] = useState([]);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (e) => {
      audioChunks.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
      const file = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });

      const formData = new FormData();

      formData.append('audio', file);
      formData.append('language', language);
      formData.append('scenario', scenario);
      formData.append('session_id', sessionId);

      const res = await fetch('http://localhost:8000/voice_chat/', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setMessages(prev => [...prev, {
        transcript: data.transcript,
        reply: data.reply,
        feedback: data.feedback
      }]);

      audioChunks.current = [];
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🎤 Voice Chat — {language} ({scenario})</h2>

      <button onClick={recording ? stopRecording : startRecording}>
        {recording ? 'Stop' : 'Start Recording'}
      </button>

      <div style={{ marginTop: '2rem' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: '1.5rem' }}>
            <div><strong>Transcript:</strong> {msg.transcript}</div>
            <div><strong>AI:</strong> {msg.reply}</div>
            <div style={{ color: 'green' }}><strong>Feedback:</strong> {msg.feedback}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoiceChat;
