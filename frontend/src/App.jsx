import { useState, useEffect, useCallback } from 'react';
import './App.css';
import ChatSidebar from './components/ChatSidebar';
import ChatRoom from './components/ChatRoom';
import { Demo } from './components/demo';

/* ═══════════════════════════════════════════════════
   Viola AI — Main Application Shell
   ═══════════════════════════════════════════════════ */

const uid = () => crypto.randomUUID?.() || Math.random().toString(36).slice(2);

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [token, setToken] = useState(null);
  const [roomName, setRoomName] = useState(null);
  const [serverUrl, setServerUrl] = useState(null);
  const [connecting, setConnecting] = useState(false);

  // Load sessions
  useEffect(() => {
    fetch('/api/history')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setSessions(data);
      })
      .catch(() => {
        const saved = localStorage.getItem('viola_sessions');
        if (saved) setSessions(JSON.parse(saved));
      });
  }, []);

  useEffect(() => {
    localStorage.setItem('viola_sessions', JSON.stringify(sessions));
  }, [sessions]);

  const startNewChat = useCallback(async () => {
    setConnecting(true);
    try {
      const res = await fetch(`/api/getToken?name=User`);
      const data = await res.json();

      if (data.error) {
        console.error('Token error:', data.error);
        setConnecting(false);
        return;
      }

      const sessionId = uid();
      const newSession = {
        id: sessionId,
        title: 'New Chat',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        message_count: 0,
        room: data.room,
      };

      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(sessionId);
      setToken(data.token);
      setRoomName(data.room);
      setServerUrl(data.url || import.meta.env.VITE_LIVEKIT_URL);
      setConnecting(false);
    } catch (err) {
      console.error('Failed to start chat:', err);
      setConnecting(false);
    }
  }, []);

  const selectSession = useCallback((sessionId) => {
    setActiveSessionId(sessionId);
    setToken(null);
    setRoomName(null);
  }, []);

  const deleteSession = useCallback(async (sessionId) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
      setToken(null);
      setRoomName(null);
    }
    try {
      await fetch(`/api/history/${sessionId}`, { method: 'DELETE' });
    } catch { /* ignore */ }
  }, [activeSessionId]);

  const updateSessionTitle = useCallback((sessionId, title) => {
    setSessions(prev => prev.map(s =>
      s.id === sessionId ? { ...s, title } : s
    ));
  }, []);

  const handleDisconnect = useCallback(() => {
    setToken(null);
    setRoomName(null);
  }, []);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <ChatSidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(p => !p)}
        sessions={sessions}
        activeId={activeSessionId}
        onSelect={selectSession}
        onNewChat={startNewChat}
        onDelete={deleteSession}
        connecting={connecting}
      />

      {/* Main content */}
      <main className={`main-content ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
        {!activeSessionId ? (
          <div className="w-full h-full overflow-y-auto">
            <Demo onStartChat={startNewChat} connecting={connecting} />
          </div>
        ) : (
          <ChatRoom
            session={activeSession}
            token={token}
            roomName={roomName}
            serverUrl={serverUrl}
            onDisconnect={handleDisconnect}
            onUpdateTitle={updateSessionTitle}
            onStartNewChat={startNewChat}
            connecting={connecting}
          />
        )}
      </main>
    </div>
  );
}

export default App;
