import { useEffect, useState } from 'react';

const BookStack = ({ index, delay }: { index: number; delay: number }) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const positions = [
    { top: '10%', left: '5%', rotate: -15 },
    { top: '25%', right: '8%', rotate: 12 },
    { top: '45%', left: '3%', rotate: 8 },
    { top: '60%', right: '5%', rotate: -10 },
    { top: '75%', left: '7%', rotate: 15 },
    { top: '85%', right: '10%', rotate: -8 },
  ];

  const pos = positions[index % positions.length];
  const parallaxOffset = scrollY * 0.3 * (index % 2 === 0 ? 1 : -1);
  
  const { rotate, ...positionStyle } = pos;

  return (
    <div
      className="absolute pointer-events-auto transition-transform duration-300 hover:scale-105"
      style={{
        ...positionStyle,
        transform: `translateY(${parallaxOffset}px) rotate(${rotate}deg)`,
        animationDelay: `${delay}ms`,
      }}
    >
      <svg width="60" height="80" viewBox="0 0 60 80" className="drop-shadow-lg animate-float">
        <rect x="5" y="10" width="40" height="55" rx="2" fill="#A67B5B" opacity="0.9" />
        <rect x="10" y="5" width="40" height="55" rx="2" fill="#C4A287" opacity="0.8" />
        <rect x="15" y="0" width="40" height="55" rx="2" fill="#8B6F47" opacity="0.7" />
      </svg>
    </div>
  );
};

export function FloatingBookStacks() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <BookStack key={i} index={i} delay={i * 400} />
      ))}
    </div>
  );
}
