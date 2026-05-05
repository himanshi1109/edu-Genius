import { useMemo } from 'react';

const ParticleBackground = ({ count = 30 }) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: 2 + Math.random() * 2,
      opacity: 0.05 + Math.random() * 0.15,
      duration: 10 + Math.random() * 15,
      delay: Math.random() * 15,
    }));
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            '--x': `${p.x}%`,
            '--size': `${p.size}px`,
            '--start-opacity': p.opacity,
            '--duration': `${p.duration}s`,
            '--delay': `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

export default ParticleBackground;
