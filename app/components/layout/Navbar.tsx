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
  ChevronRight,
  Search,
} from 'lucide-react';

const navigationLinks = [
  { path: '/', label: 'Home', icon: <Home className="h-4 w-4" /> },
  {
    path: '/projects',
    label: 'Projects',
    icon: <FolderGit2 className="h-4 w-4" />,
  },
  { path: '/people', label: 'People', icon: <Users className="h-4 w-4" /> },
  { path: '/search', label: 'Search', icon: <Search className="h-4 w-4" /> },
  { path: '/updates', label: 'Updates', icon: <Bell className="h-4 w-4" /> },
];

export default function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDesktopLinkClass = (path: string) => {
    const isActive = pathname === path;
    return {
      base: `relative inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all duration-300`,
      state: isActive
        ? 'border-violet-500/50 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-indigo-500/10 text-white shadow-[0_0_15px_rgba(124,58,237,0.2)] backdrop-blur-sm hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]'
        : 'border-gray-800/50 text-gray-400 hover:border-violet-500/30 hover:bg-gradient-to-r hover:from-violet-500/5 hover:via-fuchsia-500/5 hover:to-indigo-500/5 hover:text-white hover:shadow-[0_0_15px_rgba(124,58,237,0.1)]',
    };
  };

  const getMobileLinkClass = (path: string) => {
    const isActive = pathname === path;
    return {
      base: `group flex w-full items-center gap-2 rounded-xl border px-4 py-3 text-sm transition-all duration-300`,
      state: isActive
        ? 'border-violet-500/50 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-indigo-500/10 text-white'
        : 'border-gray-800/50 text-gray-400 hover:border-violet-500/30 hover:bg-gradient-to-r hover:from-violet-500/5 hover:via-fuchsia-500/5 hover:to-indigo-500/5 hover:text-white',
    };
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

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
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen, handleClickOutside]);

  const navbarOpacity = Math.max(0.2, Math.min(0.95, scrollY / 100));

  return (
    <nav
      ref={navRef}
      className="fixed left-0 right-0 top-0 z-50 transition-colors duration-300"
      style={{
        backgroundColor: mounted
          ? `rgba(0, 0, 0, ${navbarOpacity})`
          : 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="relative">
        <div className="absolute inset-0 border-b border-gray-800/50" />

        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="group relative">
                <div className="absolute -inset-2 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="h-full w-full bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-indigo-500/10 blur" />
                </div>
                <span className="relative bg-gradient-to-r from-white to-gray-300 bg-clip-text text-xl font-bold text-transparent">
                  lagden.dev
                </span>
              </Link>

              <div className="hidden space-x-2 md:flex">
                {navigationLinks.slice(0, 4).map(({ path, label, icon }) => {
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

              <Button
                variant="outline"
                size="icon"
                className="relative overflow-hidden rounded-full border border-gray-800/50 bg-black/20 p-2 text-gray-400 transition-all duration-300 hover:border-violet-500/30 hover:bg-black/40 hover:text-white hover:shadow-[0_0_15px_rgba(124,58,237,0.2)] md:hidden"
                onClick={toggleMenu}
              >
                <Menu className="h-5 w-5" />
              </Button>

              {isMenuOpen && (
                <Card
                  ref={menuRef}
                  className="absolute right-2 top-full mt-2 w-64 overflow-hidden rounded-2xl border-gray-800/50 bg-black/95 shadow-[0_0_30px_rgba(0,0,0,0.3)] backdrop-blur-xl"
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
                          <ChevronRight className="h-4 w-4 opacity-50 transition-transform duration-300 group-hover:translate-x-0.5" />
                        </Link>
                      );
                    })}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
