// app/shutdown/page.tsx
"use client";

import React, { Suspense } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import ShutdownContent from "../components/ShutdownContent";

export default function ShutdownPage() {
  return (
    <div className="max-w-4xl mx-auto text-center px-4">
      <Suspense fallback={<LoadingSpinner />}>
        <ShutdownContent />
      </Suspense>
    </div>
  );
}
