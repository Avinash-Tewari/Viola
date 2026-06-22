import { useState, useEffect, useRef, useCallback } from 'react';
import { LiveKitRoom, RoomAudioRenderer, useChat, useVoiceAssistant, useLocalParticipant, useTrackTranscription } from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Plus, Sparkles, User, Clock } from 'lucide-react';

/* ═══════════════════════════════════════════════════
   ChatRoom — Active chat session with LiveKit voice + text
   Premium glassmorphic design with 3D effects
   ═══════════════════════════════════════════════════ */

const ChatRoom = ({ session, token, roomName, serverUrl, onDisconnect, onUpdateTitle, onStartNewChat, connecting }) => {
  if (!session) return null;

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

  return (
    <div className="chat-room">
      <ChatHeader title={session.title} connected={false} />
      <div className="empty-state">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="empty-state-inner"
        >
          <div className="empty-icon-wrap">
            <MessageSquareIcon />
          </div>
          <div className="empty-text">This conversation has ended</div>
          <motion.button
            className="empty-action"
            onClick={onStartNewChat}
            disabled={connecting}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={16} />
            {connecting ? 'Connecting...' : 'Start New Chat'}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

const MessageSquareIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="empty-svg-icon">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

/**
 * ChatHeader
 */
const ChatHeader = ({ title, connected, onNewChat }) => (
  <div className="chat-header">
    <div className="chat-header-left">
      <div className={`chat-status-dot ${connected ? '' : 'disconnected'}`} />
      <span className="chat-room-title">{title || 'Viola Chat'}</span>
    </div>
    <div className="chat-header-actions">
      {onNewChat && (
        <motion.button
          className="chat-action-btn"
          onClick={onNewChat}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Plus size={14} />
          New
        </motion.button>
      )}
    </div>
  </div>
);

/**
 * LiveChatView — Inside LiveKitRoom context
 */
const LiveChatView = ({ session, onUpdateTitle }) => {
  const [textInput, setTextInput] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const textAreaRef = useRef(null);
  const titleUpdated = useRef(false);

  const { state: voiceState, audioTrack, agentTranscriptions } = useVoiceAssistant();
  const { localParticipant } = useLocalParticipant();

  let chatHook = { chatMessages: [], send: null, isSending: false };
  try {
    chatHook = useChat();
  } catch {
    // useChat may not be available
  }
  const { chatMessages, send: sendChat, isSending } = chatHook;

  const micPub = localParticipant?.getTrackPublication(Track.Source.Microphone);
  const { segments: userTranscriptions } = useTrackTranscription({
    publication: micPub,
    source: Track.Source.Microphone,
    participant: localParticipant,
  });

  // Merge messages
  useEffect(() => {
    const allMsgs = [];

    agentTranscriptions?.forEach(t => {
      allMsgs.push({
        id: 'agent-' + (t.id || t.firstReceivedTime),
        type: 'agent',
        text: t.text,
        time: t.firstReceivedTime || Date.now(),
        source: 'voice',
      });
    });

    userTranscriptions?.forEach(t => {
      allMsgs.push({
        id: 'user-voice-' + (t.id || t.firstReceivedTime),
        type: 'user',
        text: t.text,
        time: t.firstReceivedTime || Date.now(),
        source: 'voice',
      });
    });

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

    if (!titleUpdated.current && allMsgs.length > 0) {
      const firstAgent = allMsgs.find(m => m.type === 'agent' && m.text?.length > 5);
      if (firstAgent) {
        const title = firstAgent.text.slice(0, 40) + (firstAgent.text.length > 40 ? '...' : '');
        onUpdateTitle(session.id, title);
        titleUpdated.current = true;
      }
    }
  }, [agentTranscriptions, userTranscriptions, chatMessages, session.id, onUpdateTitle]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    textarea.style.height = '0px';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [textInput]);

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

      {/* Voice state visualizer */}
      <AnimatePresence>
        {voiceEnabled && (isAgentSpeaking || isListening) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="voice-visualizer"
          >
            <div className="viz-bars-container">
              {[...Array(7)].map((_, i) => (
                <motion.div
                  key={i}
                  className="viz-bar"
                  animate={{
                    scaleY: isAgentSpeaking
                      ? [0.3, 1, 0.5, 0.8, 0.3]
                      : [0.2, 0.6, 0.3, 0.5, 0.2],
                  }}
                  transition={{
                    duration: isAgentSpeaking ? 0.6 : 1.2,
                    repeat: Infinity,
                    delay: i * 0.08,
                    ease: 'easeInOut',
                  }}
                  style={{
                    background: `linear-gradient(to top, var(--accent-cyan), var(--accent-violet))`,
                  }}
                />
              ))}
            </div>
            <span className="viz-label">
              {isAgentSpeaking ? 'Viola is speaking...' : 'Listening...'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="messages-area">
        {messages.length === 0 && (
          <div className="empty-state" style={{ opacity: 0.5 }}>
            <Sparkles size={40} strokeWidth={1} />
            <div className="empty-text">Start talking or type a message</div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={`message-row ${msg.type}`}
            >
              <div className={`msg-avatar ${msg.type}`}>
                {msg.type === 'agent' ? <Sparkles size={16} /> : <User size={16} />}
              </div>
              <div className="msg-body">
                <div className="msg-bubble">{msg.text}</div>
                <div className="msg-meta">
                  {msg.source === 'voice' ? <Mic size={10} /> : <MessageSquareIcon />}
                  <span>
                    {msg.time ? new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isSending && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="message-row"
          >
            <div className="msg-avatar agent"><Sparkles size={16} /></div>
            <div className="msg-bubble">
              <div className="typing-indicator">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="chat-input-area">
        <div className="chat-input-row">
          <motion.button
            className={`voice-toggle-btn ${voiceEnabled ? 'active' : ''}`}
            onClick={() => setVoiceEnabled(v => !v)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={voiceEnabled ? 'Mute voice' : 'Enable voice'}
            aria-label={voiceEnabled ? 'Mute voice' : 'Enable voice'}
          >
            {voiceEnabled ? <Mic size={18} /> : <MicOff size={18} />}
          </motion.button>

          <textarea
            ref={textAreaRef}
            className="chat-input"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send)"
            rows={1}
          />

          <motion.button
            className="send-btn"
            onClick={handleSend}
            disabled={!textInput.trim() || isSending}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Send message"
            aria-label="Send message"
          >
            <Send size={18} />
          </motion.button>
        </div>
      </div>
    </>
  );
};

export default ChatRoom;
