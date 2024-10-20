'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect, useCallback, useRef } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Utility function to determine active link for desktop
  const getDesktopLinkClass = (path: string) => {
    const baseClasses =
      'mx-2 rounded-lg transition duration-200 ease-in px-3 py-1';
    const activeClasses = 'bg-gray-500 bg-opacity-50 text-white';
    const inactiveClasses =
      'text-nobel hover:bg-gray-500 hover:bg-opacity-50 hover:text-white';

    return pathname === path
      ? `${baseClasses} ${activeClasses}`
      : `${baseClasses} ${inactiveClasses}`;
  };

  // Utility function to determine active link for mobile
  const getMobileLinkClass = (path: string) => {
    const baseClasses =
      'block w-full px-4 py-2 rounded-lg transition duration-200 ease-in';
    const activeClasses = 'bg-gray-700 text-white';
    const inactiveClasses = 'text-nobel hover:bg-gray-700 hover:text-white';

    return pathname === path
      ? `${baseClasses} ${activeClasses}`
      : `${baseClasses} ${inactiveClasses}`;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      closeMenu();
    }
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen, handleClickOutside]);

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <nav className="fixed left-0 right-0 top-0 z-10 flex items-center justify-between border-b border-gray-800 bg-black p-4">
        <div className="flex items-center">
          <Link href="/">
            <span className="text-xl font-bold text-white">lagden.dev</span>
          </Link>
          {/* Desktop Links */}
          <div className="hidden md:flex">
            <Link href="/" className={getDesktopLinkClass('/')}>
              Home
            </Link>
            <Link href="/projects" className={getDesktopLinkClass('/projects')}>
              Projects
            </Link>
            <Link href="/people" className={getDesktopLinkClass('/people')}>
              People
            </Link>
          </div>
        </div>
        <div className="relative flex items-center">
          {/* Desktop Link for Updates */}
          <div className="hidden md:flex">
            <Link href="/updates" className={getDesktopLinkClass('/updates')}>
              Updates
            </Link>
          </div>
          {/* Burger Menu for Mobile */}
          <button
            className="ml-4 text-2xl text-white focus:outline-none md:hidden"
            onClick={toggleMenu}
          >
            <i className="fas fa-bars"></i>
          </button>
          {isMenuOpen && (
            <div
              ref={menuRef}
              className="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg border border-gray-600 bg-black py-2 shadow-lg"
            >
              <Link
                href="/"
                className={getMobileLinkClass('/')}
                onClick={closeMenu}
              >
                Home
              </Link>
              <Link
                href="/projects"
                className={getMobileLinkClass('/projects')}
                onClick={closeMenu}
              >
                Projects
              </Link>
              <Link
                href="/people"
                className={getMobileLinkClass('/people')}
                onClick={closeMenu}
              >
                People
              </Link>
              <Link
                href="/updates"
                className={getMobileLinkClass('/updates')}
                onClick={closeMenu}
              >
                Updates
              </Link>
            </div>
          )}
        </div>
      </nav>
      <main className="mt-16 flex-grow p-4">{children}</main>
      <footer className="border-t border-gray-800 p-4 text-center">
        © 2024 Lagden Development.{' '}
        <a
          href="https://github.com/Lagden-Development/lagden.dev"
          className="text-white underline"
          target="_blank"
        >
          GitHub
        </a>
      </footer>
    </div>
  );
}
