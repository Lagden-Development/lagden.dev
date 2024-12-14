// components/StatusIndicator.tsx
'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Card } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface StatusTooltipProps {
  status: string;
  lastCheckedAt: string;
  url: string;
  position: { top: number; left: number };
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const StatusTooltip = ({
  status,
  lastCheckedAt,
  url,
  position,
  onMouseEnter,
  onMouseLeave,
}: StatusTooltipProps) => {
  return createPortal(
    <div
      className="fixed z-[100] transform"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translate(-50%, -100%)',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="pb-2">
        <Card className="w-72 rounded-xl border border-gray-800/50 bg-black/95 shadow-2xl backdrop-blur-xl">
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between border-b border-gray-800/50 pb-2">
              <span
                className={`text-sm font-semibold ${
                  status === 'up'
                    ? 'text-emerald-400'
                    : status === 'down'
                      ? 'text-red-400'
                      : 'text-yellow-400'
                }`}
              >
                {status === 'up'
                  ? 'Operational'
                  : status === 'down'
                    ? 'Down'
                    : 'Checking'}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(lastCheckedAt).toLocaleString()}
              </span>
            </div>

            <div className="mt-3 text-center">
              <Link
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs text-violet-400 transition-colors hover:text-violet-300"
              >
                View Status Page
                <ExternalLink className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>,
    document.body
  );
};

interface StatusIndicatorProps {
  status: string;
  lastCheckedAt: string;
  url: string;
}

export default function StatusIndicator({
  status,
  lastCheckedAt,
  url,
}: StatusIndicatorProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      top: rect.top - 10,
      left: rect.left + rect.width / 2,
    });
    setShowTooltip(true);
  };

  const statusColors = {
    up: 'from-emerald-500 to-green-500',
    down: 'from-red-500 to-rose-500',
    checking: 'from-yellow-500 to-amber-500',
  };

  const currentColor =
    statusColors[status as keyof typeof statusColors] || statusColors.checking;

  return (
    <div className="relative ml-4 flex items-center">
      <div
        className="relative cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span
          className={`relative mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r ${currentColor}`}
        >
          <span
            className={`absolute h-full w-full animate-ping rounded-full bg-gradient-to-r ${currentColor} opacity-75`}
          />
          <span
            className={`absolute h-full w-full animate-pulse rounded-full bg-gradient-to-r ${currentColor} opacity-50`}
          />
        </span>
      </div>

      {showTooltip && (
        <StatusTooltip
          status={status}
          lastCheckedAt={lastCheckedAt}
          url={url}
          position={tooltipPosition}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        />
      )}
    </div>
  );
}
