"use client"; // Add this line to mark the component as a client component

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Layout({ children }) {
  const pathname = usePathname();

  // Utility function to determine active link
  const getLinkClass = (path) => {
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
      <nav className="p-4 flex items-center border-b border-gray-800">
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
      </nav>
      <main className="flex-grow p-4">{children}</main>
      <footer className="p-4 text-center border-t border-gray-800">
        © 2024 Lagden Development.{" "}
        <a
          href="https://github.com/Lagden-Development/lagden.dev"
          className="underline text-white"
        >
          GitHub
        </a>
      </footer>
    </div>
  );
}
