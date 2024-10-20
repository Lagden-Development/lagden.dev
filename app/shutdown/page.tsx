// app/shutdown/page.tsx
'use client';

import React, { Suspense } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import ShutdownContent from '../components/ShutdownContent';

export default function ShutdownPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 text-center">
      <Suspense fallback={<LoadingSpinner />}>
        <ShutdownContent />
      </Suspense>
    </div>
  );
}
