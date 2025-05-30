'use client';

import React, { useEffect, useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  X,
  GitCommit,
  ExternalLink,
  User,
  Calendar,
  Hash,
  Clock,
} from 'lucide-react';

type Commit = {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author: {
    login: string;
    html_url: string;
  };
};

type CommitModalProps = {
  commit: Commit;
  owner: string;
  repo: string;
  onClose: () => void;
};

// GitHub profile fetcher for modal
const useGitHubProfileModal = (authorName: string, authorEmail: string) => {
  const [profile, setProfile] = useState<{
    username: string;
    avatar: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let username = '';

        // Try to extract from common GitHub email patterns
        if (authorEmail.includes('@users.noreply.github.com')) {
          const match = authorEmail.match(
            /(\d+\+)?([^@]+)@users\.noreply\.github\.com/
          );
          if (match && match[2]) username = match[2];
        } else if (authorEmail.includes('github.com')) {
          const match = authorEmail.match(/([^@]+)@.*github\.com/);
          if (match && match[1]) username = match[1];
        }

        // If no username found, try using author name
        if (!username) {
          username = authorName.toLowerCase().replace(/\s+/g, '-');
        }

        // Only fetch if we have a reasonable username
        if (username && username.length > 0) {
          const response = await fetch(
            `https://api.github.com/users/${username}`
          );
          if (response.ok) {
            const userData = await response.json();
            setProfile({
              username: userData.login,
              avatar: userData.avatar_url,
            });
          } else {
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.warn('Failed to fetch GitHub profile:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    if (authorName && authorEmail) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [authorName, authorEmail]);

  return { profile, loading };
};

const CommitModal: React.FC<CommitModalProps> = ({
  commit,
  owner,
  repo,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // We need to construct email from commit data since modal gets different format
  const authorEmail = commit.author?.login
    ? `${commit.author.login}@users.noreply.github.com`
    : '';
  const { profile, loading } = useGitHubProfileModal(
    commit.commit.author.name,
    authorEmail
  );

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      const modalContent = document.querySelector('.modal-content');
      if (modalContent && !modalContent.contains(event.target as Node)) {
        onClose();
      }
    },
    [onClose]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }

      // Trap focus within modal
      if (event.key === 'Tab') {
        const modal = modalRef.current;
        if (!modal) return;

        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    // Store the currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Set up event listeners
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    // Focus the close button after modal renders
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';

      // Restore focus to the previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [handleClickOutside, handleKeyDown]);

  const modalContent = (
    <div
      className="fixed inset-0 isolate z-[9999] flex items-center justify-center overflow-y-auto overflow-x-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        aria-hidden="true"
      />
      <Card
        ref={modalRef}
        className="modal-content relative z-[10000] m-4 w-full max-w-2xl rounded-xl border-gray-800 bg-black"
      >
        <Button
          ref={closeButtonRef}
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 text-gray-400 hover:bg-gray-800 hover:text-white"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>

        <CardHeader className="border-b border-gray-800 pb-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500">
              <GitCommit className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1 pr-12">
              <CardTitle
                id="modal-title"
                className="mb-2 break-words text-xl font-bold leading-tight text-white"
              >
                {commit.commit.message.split('\n')[0]}
              </CardTitle>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  <code className="font-mono">
                    {commit.sha.substring(0, 7)}
                  </code>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(commit.commit.author.date).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Author info */}
          <div className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900/50 p-4">
            {loading ? (
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-700" />
            ) : profile?.avatar ? (
              <img
                src={profile.avatar}
                alt={commit.commit.author.name}
                className="h-10 w-10 rounded-full border border-gray-600"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 font-semibold text-white">
                {commit.commit.author.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="font-medium text-white">
                {profile?.username || commit.commit.author.name}
              </div>
              <div className="text-sm text-gray-400">
                {new Date(commit.commit.author.date).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Full commit message if multiline */}
          {commit.commit.message.includes('\n') && (
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
                Full Commit Message
              </h3>
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-300">
                  {commit.commit.message}
                </pre>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-gray-800 pt-4">
            <Button
              variant="ghost"
              className="text-gray-400 hover:bg-gray-800 hover:text-white"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              className="bg-gradient-to-r from-violet-500 to-purple-500 font-medium text-white hover:from-violet-600 hover:to-purple-600"
              asChild
            >
              <a
                href={`https://github.com/${owner}/${repo}/commit/${commit.sha}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View on GitHub
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CommitModal;
