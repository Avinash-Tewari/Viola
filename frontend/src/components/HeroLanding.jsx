const HeroLanding = ({ onStartChat, connecting }) => {
  return (
    <div className="hero-landing">
      <div className="hero-content">
        {/* 3D Orb */}
        <div className="orb-wrapper">
          <div className="orb-scene">
            <div className="orb-core" />
            <div className="orb-ring" />
            <div className="orb-ring" />
            <div className="orb-ring" />
            <div className="orb-particle" />
            <div className="orb-particle" />
            <div className="orb-particle" />
            <div className="orb-particle" />
          </div>
        </div>

        <h1 className="hero-title">
          Meet <span className="gradient-text">Viola</span>
        </h1>
        <p className="hero-subtitle">
          Your AI-powered voice & text assistant. Have natural conversations,
          search the web, send emails, and more — all in real-time.
        </p>

        <button
          className="hero-cta"
          onClick={onStartChat}
          disabled={connecting}
        >
          {connecting ? '● Connecting...' : '✦ Start Chatting'}
        </button>

        <div className="hero-features">
          <div className="feature-card">
            <div className="feature-icon">🎙️</div>
            <div className="feature-title">Voice Chat</div>
            <div className="feature-desc">Real-time voice conversations</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <div className="feature-title">Smart Tools</div>
            <div className="feature-desc">Weather, web search, email</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <div className="feature-title">Text + Voice</div>
            <div className="feature-desc">Chat however you prefer</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroLanding;
