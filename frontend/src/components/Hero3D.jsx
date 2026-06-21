import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, Mic, MessageSquare, Zap, Shield, Globe } from 'lucide-react';
import AIOrbScene from './AIOrbScene';

/* ═══════════════════════════════════════════════════
   Hero3D — Immersive landing section for Viola AI
   3D Orb + Parallax + Feature Cards
   ═══════════════════════════════════════════════════ */

const FeatureCard = ({ icon: Icon, title, description, delay, gradient }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ y: -6, scale: 1.02 }}
    className="feature-card-3d"
  >
    <div className={`feature-icon-wrap ${gradient}`}>
      <Icon size={22} strokeWidth={1.5} />
    </div>
    <h3 className="feature-title-3d">{title}</h3>
    <p className="feature-desc-3d">{description}</p>
  </motion.div>
);

const Hero3D = ({ onStartChat, connecting }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const orbY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const orbScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.85]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);

  const smoothOrbScale = useSpring(orbScale, { stiffness: 100, damping: 25 });
  const smoothOrbY = useSpring(orbY, { stiffness: 80, damping: 20 });

  const features = [
    {
      icon: Mic,
      title: 'Voice Chat',
      description: 'Real-time voice conversations powered by LiveKit',
      gradient: 'gradient-cyan',
    },
    {
      icon: Zap,
      title: 'Smart Tools',
      description: 'Weather, web search, email — all at your command',
      gradient: 'gradient-violet',
    },
    {
      icon: MessageSquare,
      title: 'Text + Voice',
      description: 'Seamlessly switch between typing and talking',
      gradient: 'gradient-pink',
    },
    {
      icon: Shield,
      title: 'Secure',
      description: 'End-to-end encrypted conversations',
      gradient: 'gradient-emerald',
    },
    {
      icon: Globe,
      title: 'Real-time AI',
      description: 'Powered by advanced language models',
      gradient: 'gradient-blue',
    },
  ];

  return (
    <div ref={containerRef} className="hero3d-container">
      {/* Background grid */}
      <div className="hero3d-grid" />

      {/* Ambient blobs */}
      <div className="hero3d-ambient">
        <div className="ambient-blob blob-cyan" />
        <div className="ambient-blob blob-violet" />
        <div className="ambient-blob blob-pink" />
      </div>

      {/* Main content */}
      <div className="hero3d-content">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ opacity: titleOpacity }}
          className="hero3d-badge"
        >
          <span className="badge-dot" />
          <span>AI Voice Assistant</span>
        </motion.div>

        {/* 3D Orb */}
        <motion.div
          style={{ y: smoothOrbY, scale: smoothOrbScale }}
          className="hero3d-orb-wrapper"
        >
          <AIOrbScene style={{ height: 360, width: 360 }} />
        </motion.div>

        {/* Title */}
        <motion.div
          style={{ opacity: titleOpacity, y: titleY }}
          className="hero3d-text"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="hero3d-title"
          >
            Meet{' '}
            <span className="hero3d-gradient-text">Viola</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="hero3d-subtitle"
          >
            Your AI-powered voice & text assistant. Have natural conversations,
            search the web, send emails, and more — all in real-time.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="hero3d-cta-row"
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={onStartChat}
              disabled={connecting}
              className="hero3d-cta-primary"
            >
              <span className="cta-shimmer" />
              <span className="cta-content">
                {connecting ? (
                  <>
                    <span className="cta-spinner" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Start Chatting
                    <ArrowRight size={18} />
                  </>
                )}
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="hero3d-cta-secondary"
            >
              Watch Demo
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Feature Cards */}
      <div className="hero3d-features">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="hero3d-features-title"
        >
          Powered by <span className="hero3d-gradient-text">Intelligence</span>
        </motion.h2>

        <div className="hero3d-features-grid">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} {...feature} delay={i * 0.1} />
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="hero3d-bottom-fade" />
    </div>
  );
};

export default Hero3D;
