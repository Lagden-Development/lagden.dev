'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Home,
  FolderGit2,
  Users,
  Bell,
  Menu,
  Github,
  ChevronRight,
} from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const getDesktopLinkClass = (path: string) => {
    const isActive = pathname === path;
    return {
      base: 'inline-flex items-center gap-2 px-3 py-2 rounded-md transition-colors',
      state: isActive
        ? 'bg-gray-800 text-white'
        : 'text-gray-400 hover:bg-gray-800 hover:text-white',
    };
  };

  const getMobileLinkClass = (path: string) => {
    const isActive = pathname === path;
    return {
      base: 'flex items-center gap-2 w-full px-3 py-2 rounded-md transition-colors',
      state: isActive
        ? 'bg-gray-800 text-white'
        : 'text-gray-400 hover:bg-gray-800 hover:text-white',
    };
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

  const navigationLinks = [
    { path: '/', label: 'Home', icon: <Home className="h-4 w-4" /> },
    {
      path: '/projects',
      label: 'Projects',
      icon: <FolderGit2 className="h-4 w-4" />,
    },
    { path: '/people', label: 'People', icon: <Users className="h-4 w-4" /> },
    { path: '/updates', label: 'Updates', icon: <Bell className="h-4 w-4" /> },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <nav className="fixed left-0 right-0 top-0 z-10 border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/75">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="mr-4 flex items-center space-x-2">
                <span className="text-xl font-bold text-white">lagden.dev</span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden space-x-1 md:flex">
                {navigationLinks.slice(0, 3).map(({ path, label, icon }) => {
                  const { base, state } = getDesktopLinkClass(path);
                  return (
                    <Link key={path} href={path} className={`${base} ${state}`}>
                      {icon}
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Desktop Updates Link */}
              <div className="hidden md:flex">
                {(() => {
                  const { base, state } = getDesktopLinkClass('/updates');
                  return (
                    <Link href="/updates" className={`${base} ${state}`}>
                      <Bell className="h-4 w-4" />
                      Updates
                    </Link>
                  );
                })()}
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={toggleMenu}
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Mobile Menu */}
              {isMenuOpen && (
                <Card
                  ref={menuRef}
                  className="absolute right-2 top-full mt-2 w-56 border-gray-800 bg-black"
                >
                  <div className="p-2">
                    {navigationLinks.map(({ path, label, icon }) => {
                      const { base, state } = getMobileLinkClass(path);
                      return (
                        <Link
                          key={path}
                          href={path}
                          className={`${base} ${state}`}
                          onClick={closeMenu}
                        >
                          {icon}
                          <span className="flex-1">{label}</span>
                          <ChevronRight className="h-4 w-4 opacity-50" />
                        </Link>
                      );
                    })}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="mt-16 flex-grow px-4 py-8">{children}</main>

      <footer className="border-t border-gray-800 bg-black px-4 py-6">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm text-gray-400">
            © 2024 Lagden Development
            <Button
              variant="link"
              className="ml-2 h-auto p-0 text-white"
              asChild
            >
              <a
                href="https://github.com/Lagden-Development/lagden.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center hover:text-gray-300"
              >
                <Github className="mr-1 h-4 w-4" />
                GitHub
              </a>
            </Button>
          </p>
        </div>
      </footer>
    </div>
  );
}
