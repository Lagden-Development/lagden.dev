'use client';

import { useEffect } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';

interface SafeAnalyticsProps {
  gaId: string;
}

export default function SafeAnalytics({ gaId }: SafeAnalyticsProps) {
  useEffect(() => {
    // Check if analytics is being blocked
    const checkAnalytics = () => {
      if (typeof window !== 'undefined') {
        // Set a flag that analytics might be blocked
        if (!(window as any).gtag) {
          console.info(
            'Analytics appears to be blocked. Site will continue to function normally.'
          );
        }
      }
    };

    // Check after a delay to allow scripts to load
    setTimeout(checkAnalytics, 2000);
  }, []);

  try {
    return <GoogleAnalytics gaId={gaId} />;
  } catch (error) {
    // Silently fail if analytics component throws
    console.info(
      'Analytics failed to load. This is likely due to an ad blocker.'
    );
    return null;
  }
}
