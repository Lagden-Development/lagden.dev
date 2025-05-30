'use client';

import {
  useEffect,
  useRef,
  useState,
  Children,
  cloneElement,
  isValidElement,
} from 'react';
import { cn } from '@/lib/utils';

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function StaggerContainer({
  children,
  className = '',
  delay = 80,
}: StaggerContainerProps) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          // Start stagger animation
          const childCount = Children.count(children);

          // Clear any existing timeouts
          timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
          timeoutsRef.current = [];

          // Stagger the visibility of each item
          for (let i = 0; i < childCount; i++) {
            const timeout = setTimeout(() => {
              setVisibleItems((prev) => new Set([...prev, i]));
            }, i * delay);
            timeoutsRef.current.push(timeout);
          }

          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, [children, delay]);

  const childrenWithProps = Children.map(children, (child, index) => {
    if (!isValidElement(child)) return child;

    const isVisible = visibleItems.has(index);
    const staggerClass = isVisible
      ? 'stagger-item-visible'
      : 'stagger-item-hidden';

    return (
      <div
        key={child.key || index}
        className={staggerClass}
        style={{
          transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
        }}
      >
        {child}
      </div>
    );
  });

  return (
    <div ref={containerRef} className={cn(className)}>
      {childrenWithProps}
    </div>
  );
}
