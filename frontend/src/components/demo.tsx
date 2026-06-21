import { AnimatedMarqueeHero } from "@/components/ui/hero-3";

// Verified Unsplash image URLs — AI, tech, futuristic themes for Viola
const VIOLA_IMAGES = [
  "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1676299081847-824916de030a?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1531746790095-e5505f3b1072?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1676299081847-824916de030a?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1531746790095-e5505f3b1072?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=900&auto=format&fit=crop&q=60",
];

interface DemoProps {
  onStartChat?: () => void;
  connecting?: boolean;
}

export function Demo({ onStartChat, connecting }: DemoProps) {
  return (
    <AnimatedMarqueeHero
      tagline="✦ Your AI-Powered Voice & Text Assistant"
      title={
        <>
          <span className="block">Meet Viola —</span>
          <span className="bg-gradient-to-r from-[var(--accent-cyan)] via-[var(--accent-violet)] to-[var(--accent-pink)] bg-clip-text text-transparent">
            Talk, Ask, Create
          </span>
        </>
      }
      description="Have natural voice conversations, search the web, send emails, and more — all in real-time with cutting-edge AI."
      ctaText={connecting ? "Connecting..." : "Start Chatting"}
      images={VIOLA_IMAGES}
      onCtaClick={onStartChat}
      ctaDisabled={connecting}
    />
  );
}

export default Demo;
