const ChatSidebar = ({ open, onToggle, sessions, activeId, onSelect, onNewChat, onDelete, connecting }) => {
  return (
    <>
      <button className="sidebar-toggle" onClick={onToggle} title="Toggle sidebar">
        {open ? '◁' : '▷'}
      </button>

      <aside className={`sidebar ${open ? '' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon">V</div>
            <span className="brand-name">Viola</span>
          </div>
        </div>

        <div style={{ padding: '12px 16px 0' }}>
          <button className="new-chat-btn" onClick={onNewChat} disabled={connecting}>
            <span>＋</span>
            {connecting ? 'Connecting...' : 'New Chat'}
          </button>
        </div>

        <div className="sidebar-sessions">
          {sessions.length === 0 && (
            <div style={{ padding: '20px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              No conversations yet
            </div>
          )}
          {sessions.map(session => (
            <div
              key={session.id}
              className={`session-item ${activeId === session.id ? 'active' : ''}`}
              onClick={() => onSelect(session.id)}
            >
              <span className="session-title">
                {session.title || 'New Chat'}
              </span>
              <button
                className="session-delete"
                onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}
                title="Delete"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          Viola AI · Powered by LiveKit
        </div>
      </aside>
    </>
  );
};

export default ChatSidebar;
