// app/shutdown/page.tsx
'use client';

import React, { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import LoadingSpinner from '../components/LoadingSpinner';
import ShutdownContent from '../components/ShutdownContent';

export default function ShutdownPage() {
  return (
    <div className="min-h-screen bg-black py-12">
      <div className="mx-auto max-w-4xl px-4">
        <Card className="border-gray-800 bg-black">
          <Suspense
            fallback={
              <div className="flex h-64 items-center justify-center">
                <LoadingSpinner />
              </div>
            }
          >
            <ShutdownContent />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}
