'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export default function SectionHeader({
  children,
  className = '',
  as: Component = 'h2',
}: SectionHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const elementTop = rect.top;

        // Trigger when element is in the upper 60% of viewport
        setIsScrolled(elementTop < viewportHeight * 0.6);
      }
    };

    // Check initial state
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Component
      ref={headerRef as any}
      className={cn(
        'section-header',
        isScrolled && 'section-header-scrolled',
        className
      )}
    >
      {children}
    </Component>
  );
}
