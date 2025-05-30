'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface DynamicHeroProps {
  children: React.ReactNode;
  className?: string;
}

export default function DynamicHero({ children, className }: DynamicHeroProps) {
  const [viewportHeight, setViewportHeight] = useState('100vh');

  useEffect(() => {
    const updateHeight = () => {
      // Get the actual viewport height
      const vh = window.innerHeight;
      // Subtract navbar height (64px = 4rem)
      const navbarHeight = 64;
      // Calculate hero height
      const heroHeight = vh - navbarHeight;
      setViewportHeight(`${heroHeight}px`);
    };

    // Set initial height
    updateHeight();

    // Update on resize
    window.addEventListener('resize', updateHeight);

    // Update on orientation change (mobile)
    window.addEventListener('orientationchange', () => {
      setTimeout(updateHeight, 100);
    });

    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
    };
  }, []);

  return (
    <section
      className={cn(
        'relative flex flex-col items-center justify-center px-6 py-12 text-center',
        className
      )}
      style={{
        minHeight: viewportHeight || '700px', // Use viewport height if available, otherwise 700px minimum
      }}
    >
      <div className="mx-auto w-full max-w-7xl">{children}</div>
    </section>
  );
}
