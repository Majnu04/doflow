import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
  rotationSpeed: number;
  shape: 'circle' | 'square' | 'star';
}

const COLORS = ['#e06438', '#f3a45c', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#f59e0b'];

interface ConfettiOverlayProps {
  active: boolean;
  duration?: number;
}

const ConfettiOverlay: React.FC<ConfettiOverlayProps> = ({ active, duration = 3000 }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const newParticles: Particle[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 4 + Math.random() * 8,
      rotation: Math.random() * 360,
      velocityX: (Math.random() - 0.5) * 3,
      velocityY: 2 + Math.random() * 4,
      rotationSpeed: (Math.random() - 0.5) * 10,
      shape: (['circle', 'square', 'star'] as const)[Math.floor(Math.random() * 3)],
    }));

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
    }, duration);

    return () => clearTimeout(timer);
  }, [active, duration]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'star' ? '2px' : '2px',
            transform: `rotate(${p.rotation}deg)`,
            animation: `confetti-fall 3s ease-out forwards`,
            ['--velocity-x' as string]: p.velocityX,
            ['--velocity-y' as string]: p.velocityY,
            ['--rotation-speed' as string]: `${p.rotationSpeed}deg`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) translateX(calc(var(--velocity-x) * 50px)) rotate(calc(var(--rotation-speed) * 30)); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default React.memo(ConfettiOverlay);
