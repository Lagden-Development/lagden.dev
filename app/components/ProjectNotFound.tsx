// components/ProjectNotFound.tsx
import React from "react";
import Link from "next/link";

export default function ProjectNotFound() {
  return (
    <div className="flex justify-center py-8">
      <div className="max-w-6xl w-full text-center px-4">
        <h1 className="text-4xl font-bold mb-4">Project Not Found</h1>
        <p className="text-lg mb-4">
          The project you are looking for does not exist or has been removed.
        </p>

        <p className="text-lg mb-4">
          If you navigated here from a link on this site, please report the
          issue on our{" "}
          <a
            href="https://github.com/Lagden-Development/lagden.dev/issues/new"
            target="_blank"
            className="text-blue-500 hover:underline"
          >
            GitHub repository
          </a>
          .
        </p>
        <Link href="/projects">
          <p className="text-blue-500 hover:underline">
            Return to All Projects
          </p>
        </Link>
      </div>
    </div>
  );
}
