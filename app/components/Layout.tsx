"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Utility function to determine active link
  const getLinkClass = (path: string) => {
    const baseClasses =
      "mx-2 rounded-lg transition duration-200 ease-in px-3 py-1";
    const activeClasses = "bg-gray-500 bg-opacity-50 text-white";
    const inactiveClasses =
      "text-nobel hover:bg-gray-500 hover:bg-opacity-50 hover:text-white";

    return pathname === path
      ? `${baseClasses} ${activeClasses}`
      : `${baseClasses} ${inactiveClasses}`;
  };

  return (
    <div className="flex flex-col min-h-screen text-white bg-black">
      <nav className="fixed top-0 left-0 right-0 p-4 flex items-center justify-between border-b border-gray-800 bg-black z-10">
        <div className="flex items-center">
          <span className="font-bold text-white text-xl">lagden.dev</span>
          <Link href="/" className={getLinkClass("/")}>
            Home
          </Link>
          <Link href="/projects" className={getLinkClass("/projects")}>
            Projects
          </Link>
          <Link href="/people" className={getLinkClass("/people")}>
            People
          </Link>
        </div>
        <div className="flex items-center">
          <Link href="/updates" className={getLinkClass("/updates")}>
            Updates
          </Link>
        </div>
      </nav>
      <main className="flex-grow p-4 mt-16">{children}</main>
      <footer className="p-4 text-center border-t border-gray-800">
        © 2024 Lagden Development.{" "}
        <a
          href="https://github.com/Lagden-Development/lagden.dev"
          className="underline text-white"
          target="_blank"
        >
          GitHub
        </a>
      </footer>
    </div>
  );
}
