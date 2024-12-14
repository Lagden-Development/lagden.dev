// components/shared/ui/MouseGradient.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';

const useSmoothMouse = (smoothFactor = 0.15) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [smoothedPosition, setSmoothedPosition] = useState({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const smoothAnimation = () => {
      setSmoothedPosition((prev) => ({
        x: prev.x + (mousePosition.x - prev.x) * smoothFactor,
        y: prev.y + (mousePosition.y - prev.y) * smoothFactor,
      }));
      animationFrameRef.current = requestAnimationFrame(smoothAnimation);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animationFrameRef.current = requestAnimationFrame(smoothAnimation);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [smoothFactor, mousePosition.x, mousePosition.y]);

  return smoothedPosition;
};

export default function MouseGradient() {
  const [mounted, setMounted] = useState(false);
  const mousePosition = useSmoothMouse(0.08);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 transition-opacity duration-1000"
      style={{
        background: `
          radial-gradient(1200px circle at ${mousePosition.x}px ${mousePosition.y}px, 
            rgba(124, 58, 237, 0.12),
            rgba(99, 102, 241, 0.12),
            rgba(139, 92, 246, 0.08),
            transparent 60%
          )
        `,
      }}
    />
  );
}
