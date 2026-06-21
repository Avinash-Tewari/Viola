import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronLeft, ChevronRight, Trash2, MessageSquare, Sparkles } from 'lucide-react';

/* ═══════════════════════════════════════════════════
   ChatSidebar — Glass-morphic sidebar with animations
   ═══════════════════════════════════════════════════ */

const ChatSidebar = ({ open, onToggle, sessions, activeId, onSelect, onNewChat, onDelete, connecting }) => {
  return (
    <>
      {/* Toggle button */}
      <motion.button
        className="sidebar-toggle"
        onClick={onToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Toggle sidebar"
        aria-label={open ? 'Close sidebar' : 'Open sidebar'}
      >
        {open ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </motion.button>

      {/* Sidebar */}
      <aside className={`sidebar ${open ? '' : 'closed'}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon">
              <Sparkles size={16} />
            </div>
            <span className="brand-name">Viola</span>
          </div>
        </div>

        {/* New Chat Button */}
        <div style={{ padding: '12px 16px 0' }}>
          <motion.button
            className="new-chat-btn"
            onClick={onNewChat}
            disabled={connecting}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={16} />
            {connecting ? 'Connecting...' : 'New Chat'}
          </motion.button>
        </div>

        {/* Sessions list */}
        <div className="sidebar-sessions">
          <AnimatePresence mode="popLayout">
            {sessions.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="sidebar-empty"
              >
                <MessageSquare size={20} strokeWidth={1} />
                <span>No conversations yet</span>
              </motion.div>
            )}
            {sessions.map((session) => (
              <motion.div
                key={session.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className={`session-item ${activeId === session.id ? 'active' : ''}`}
                onClick={() => onSelect(session.id)}
              >
                <div className="session-item-inner">
                  <MessageSquare size={14} className="session-icon" />
                  <span className="session-title">
                    {session.title || 'New Chat'}
                  </span>
                </div>
                <button
                  className="session-delete"
                  onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}
                  title="Delete conversation"
                  aria-label="Delete conversation"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="footer-status">
            <div className="status-dot-live" />
            <span>Viola AI · Powered by LiveKit</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ChatSidebar;
