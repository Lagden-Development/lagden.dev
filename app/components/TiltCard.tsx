'use client';

import { useRef, useCallback, MouseEvent } from 'react';
import { cn } from '@/lib/utils';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  tiltMaxAngleX?: number;
  tiltMaxAngleY?: number;
  glowEffect?: boolean;
}

export default function TiltCard({
  children,
  className = '',
  tiltMaxAngleX = 8,
  tiltMaxAngleY = 8,
  glowEffect = true,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;

      const card = cardRef.current;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate percentage from center
      const percentX = (x - centerX) / centerX;
      const percentY = (y - centerY) / centerY;

      // Calculate tilt
      const rotateX = -percentY * tiltMaxAngleX;
      const rotateY = percentX * tiltMaxAngleY;

      // Apply transform directly to avoid re-renders
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;

      // Set CSS variables for glassmorphism effects
      const mouseX = (x / rect.width) * 100;
      const mouseY = (y / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${mouseX}%`);
      card.style.setProperty('--mouse-y', `${mouseY}%`);

      // Update glow effect
      if (glowEffect && glowRef.current) {
        const glowX = (x / rect.width) * 100;
        const glowY = (y / rect.height) * 100;

        glowRef.current.style.background = `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(139, 92, 246, 0.3) 0%, transparent 60%)`;
        glowRef.current.style.opacity = '1';
      }
    },
    [tiltMaxAngleX, tiltMaxAngleY, glowEffect]
  );

  const handleMouseLeave = useCallback(() => {
    if (cardRef.current) {
      cardRef.current.style.transform =
        'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
    if (glowRef.current) {
      glowRef.current.style.opacity = '0';
    }
  }, []);

  return (
    <div
      ref={cardRef}
      className={cn('relative', className)}
      style={{
        transformStyle: 'preserve-3d',
        transition: 'transform 0.15s ease-out',
        willChange: 'transform',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {glowEffect && (
        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-200"
          style={{
            opacity: 0,
            filter: 'blur(20px)',
            zIndex: 0,
          }}
        />
      )}
      <div className="relative" style={{ zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
