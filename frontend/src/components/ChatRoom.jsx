import { useState, useEffect, useRef, useCallback } from 'react';
import { LiveKitRoom, RoomAudioRenderer, useChat, useVoiceAssistant, useLocalParticipant, useTrackTranscription, VoiceAssistantControlBar } from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';

/**
 * ChatRoom — Active chat session with LiveKit voice + text
 */
const ChatRoom = ({ session, token, roomName, serverUrl, onDisconnect, onUpdateTitle, onStartNewChat, connecting }) => {
  if (!session) return null;

  // If we have a token, show the live room
  if (token && serverUrl) {
    return (
      <div className="chat-room">
        <LiveKitRoom
          serverUrl={serverUrl}
          token={token}
          connect={true}
          audio={true}
          video={false}
          onDisconnected={onDisconnect}
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
          <RoomAudioRenderer />
          <LiveChatView
            session={session}
            onUpdateTitle={onUpdateTitle}
          />
        </LiveKitRoom>
      </div>
    );
  }

  // Past session view (read-only) or connecting state
  return (
    <div className="chat-room">
      <ChatHeader title={session.title} connected={false} />
      <div className="empty-state">
        <div className="empty-icon">💬</div>
        <div className="empty-text">This conversation has ended</div>
        <button className="empty-action" onClick={onStartNewChat} disabled={connecting}>
          {connecting ? 'Connecting...' : 'Start New Chat'}
        </button>
      </div>
    </div>
  );
};

/**
 * ChatHeader — Top bar with status and actions
 */
const ChatHeader = ({ title, connected, onNewChat }) => (
  <div className="chat-header">
    <div className="chat-header-left">
      <div className={`chat-status-dot ${connected ? '' : 'disconnected'}`} />
      <span className="chat-room-title">{title || 'Viola Chat'}</span>
    </div>
    <div className="chat-header-actions">
      {onNewChat && (
        <button className="chat-action-btn" onClick={onNewChat}>+ New</button>
      )}
    </div>
  </div>
);

/**
 * LiveChatView — Inside LiveKitRoom context: handles voice transcriptions + text chat
 */
const LiveChatView = ({ session, onUpdateTitle }) => {
  const [textInput, setTextInput] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const titleUpdated = useRef(false);

  // LiveKit hooks
  const { state: voiceState, audioTrack, agentTranscriptions } = useVoiceAssistant();
  const { localParticipant } = useLocalParticipant();

  // Text chat via LiveKit data channels
  let chatHook = { chatMessages: [], send: null, isSending: false };
  try {
    chatHook = useChat();
  } catch {
    // useChat may not be available in all versions
  }
  const { chatMessages, send: sendChat, isSending } = chatHook;

  // User mic transcription
  const micPub = localParticipant?.getTrackPublication(Track.Source.Microphone);
  const { segments: userTranscriptions } = useTrackTranscription({
    publication: micPub,
    source: Track.Source.Microphone,
    participant: localParticipant,
  });

  // Merge all message sources
  useEffect(() => {
    const allMsgs = [];

    // Voice transcriptions from agent
    agentTranscriptions?.forEach(t => {
      allMsgs.push({
        id: 'agent-' + (t.id || t.firstReceivedTime),
        type: 'agent',
        text: t.text,
        time: t.firstReceivedTime || Date.now(),
        source: 'voice',
      });
    });

    // Voice transcriptions from user
    userTranscriptions?.forEach(t => {
      allMsgs.push({
        id: 'user-voice-' + (t.id || t.firstReceivedTime),
        type: 'user',
        text: t.text,
        time: t.firstReceivedTime || Date.now(),
        source: 'voice',
      });
    });

    // Text chat messages
    chatMessages?.forEach(m => {
      const isUser = m.from?.identity !== 'agent' && !m.from?.identity?.startsWith('agent');
      allMsgs.push({
        id: 'chat-' + m.id,
        type: isUser ? 'user' : 'agent',
        text: m.message,
        time: m.timestamp,
        source: 'text',
      });
    });

    allMsgs.sort((a, b) => (a.time || 0) - (b.time || 0));
    setMessages(allMsgs);

    // Auto-title from first agent message
    if (!titleUpdated.current && allMsgs.length > 0) {
      const firstAgent = allMsgs.find(m => m.type === 'agent' && m.text?.length > 5);
      if (firstAgent) {
        const title = firstAgent.text.slice(0, 40) + (firstAgent.text.length > 40 ? '...' : '');
        onUpdateTitle(session.id, title);
        titleUpdated.current = true;
      }
    }
  }, [agentTranscriptions, userTranscriptions, chatMessages, session.id, onUpdateTitle]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save chat to backend periodically
  useEffect(() => {
    if (messages.length === 0) return;
    const timer = setTimeout(() => {
      fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: session.id,
          title: session.title || 'Chat',
          messages: messages.map(m => ({ type: m.type, text: m.text, time: m.time, source: m.source })),
        }),
      }).catch(() => {});
    }, 2000);
    return () => clearTimeout(timer);
  }, [messages, session.id, session.title]);

  const handleSend = useCallback(async () => {
    if (!textInput.trim() || !sendChat) return;
    try {
      await sendChat(textInput.trim());
      setTextInput('');
    } catch (err) {
      console.error('Send failed:', err);
    }
  }, [textInput, sendChat]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isAgentSpeaking = voiceState === 'speaking';
  const isListening = voiceState === 'listening';

  return (
    <>
      <ChatHeader
        title={session.title || 'Viola Chat'}
        connected={true}
      />

      {/* Voice state indicator */}
      {voiceEnabled && (isAgentSpeaking || isListening) && (
        <div className="voice-visualizer">
          <div className="viz-bar" />
          <div className="viz-bar" />
          <div className="viz-bar" />
          <div className="viz-bar" />
          <div className="viz-bar" />
          <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--text-muted)' }}>
            {isAgentSpeaking ? 'Viola is speaking...' : 'Listening...'}
          </span>
        </div>
      )}

      {/* Messages */}
      <div className="messages-area">
        {messages.length === 0 && (
          <div className="empty-state" style={{ opacity: 0.5 }}>
            <div className="empty-icon">✦</div>
            <div className="empty-text">Start talking or type a message</div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`message-row ${msg.type}`}>
            <div className={`msg-avatar ${msg.type}`}>
              {msg.type === 'agent' ? 'V' : 'U'}
            </div>
            <div>
              <div className="msg-bubble">{msg.text}</div>
              <div className="msg-time">
                {msg.source === 'voice' ? '🎙' : '💬'}{' '}
                {msg.time ? new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </div>
            </div>
          </div>
        ))}

        {isSending && (
          <div className="message-row">
            <div className="msg-avatar agent">V</div>
            <div className="msg-bubble">
              <div className="typing-indicator">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="chat-input-area">
        <div className="chat-input-row">
          <button
            className={`voice-toggle-btn ${voiceEnabled ? 'active' : ''}`}
            onClick={() => setVoiceEnabled(v => !v)}
            title={voiceEnabled ? 'Mute voice' : 'Enable voice'}
          >
            {voiceEnabled ? '🎙' : '🔇'}
          </button>

          <textarea
            className="chat-input"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send)"
            rows={1}
          />

          <button
            className="send-btn"
            onClick={handleSend}
            disabled={!textInput.trim() || isSending}
            title="Send message"
          >
            ↑
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatRoom;
