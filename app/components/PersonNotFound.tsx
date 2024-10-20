// app/components/PersonNotFound.tsx
import React from 'react';
import Link from 'next/link';

export default function PersonNotFound() {
  return (
    <div className="flex justify-center py-8">
      <div className="w-full max-w-6xl px-4 text-center">
        <h1 className="mb-4 text-4xl font-bold">Person Not Found</h1>
        <p className="mb-4 text-lg">
          The person you are looking for does not exist or has been removed.
        </p>
        <p className="mb-4 text-lg">
          If you navigated here from a link on this site, please report the
          issue on our{' '}
          <a
            href="https://github.com/Lagden-Development/lagden.dev/issues/new"
            target="_blank"
            className="text-blue-500 hover:underline"
          >
            GitHub repository
          </a>
          .
        </p>
        <Link href="/people">
          <p className="text-blue-500 hover:underline">Return to All People</p>
        </Link>
      </div>
    </div>
  );
}
