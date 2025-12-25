// app/components/shared/ui/CommitsList.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { GitCommit, ExternalLink, Calendar, User, Hash } from 'lucide-react';
import CommitModal from '@/components/CommitModal';

interface Commit {
  sha: string;
  message: string;
  author_name: string;
  author_email: string;
  date: string;
  url: string;
  author_username?: string;
  author_avatar?: string;
}

interface CommitsListProps {
  commits: Commit[];
  repositoryUrl?: string;
}

// Hash-based art generation utilities
function hashToNumber(hash: string, start: number, length: number): number {
  return parseInt(hash.substring(start, start + length), 16);
}

function hashToColors(hash: string): {
  primary: string;
  secondary: string;
  accent: string;
  gradientAngle: number;
} {
  const r1 = hashToNumber(hash, 0, 2);
  const g1 = hashToNumber(hash, 2, 2);
  const b1 = hashToNumber(hash, 4, 2);

  const r2 = hashToNumber(hash, 6, 2);
  const g2 = hashToNumber(hash, 8, 2);
  const b2 = hashToNumber(hash, 10, 2);

  const r3 = hashToNumber(hash, 12, 2);
  const g3 = hashToNumber(hash, 14, 2);
  const b3 = hashToNumber(hash, 16, 2);

  const angle = hashToNumber(hash, 18, 2) * 2;

  return {
    primary: `rgb(${r1}, ${g1}, ${b1})`,
    secondary: `rgb(${r2}, ${g2}, ${b2})`,
    accent: `rgb(${r3}, ${g3}, ${b3})`,
    gradientAngle: angle,
  };
}

function hashToGradient(hash: string): {
  angle: number;
  intensity: number;
} {
  return {
    angle: hashToNumber(hash, 18, 2) * 2,
    intensity: (hashToNumber(hash, 22, 2) / 255) * 100,
  };
}

// Simplified Commit Art Component - Gradient Only
const CommitArt: React.FC<{ hash: string; size?: number }> = ({
  hash,
  size = 80,
}) => {
  const artData = useMemo(() => {
    const colors = hashToColors(hash);
    const gradient = hashToGradient(hash);
    return { colors, gradient };
  }, [hash]);

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-gray-600/30 shadow-lg"
      style={{ width: size, height: size }}
    >
      {/* Main gradient background */}
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          background: `linear-gradient(${artData.gradient.angle}deg, ${artData.colors.primary}, ${artData.colors.secondary}, ${artData.colors.accent})`,
          opacity: 0.9,
        }}
      />

      {/* Subtle radial highlight */}
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          background: `radial-gradient(circle at ${artData.gradient.intensity}% ${100 - artData.gradient.intensity}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
        }}
      />

      {/* Overlay for depth */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 via-transparent to-black/10" />

      {/* Subtle border glow */}
      <div
        className="absolute inset-0 rounded-xl border opacity-30"
        style={{
          borderColor: artData.colors.accent,
          boxShadow: `inset 0 0 10px ${artData.colors.primary}20`,
        }}
      />
    </div>
  );
};

// GitHub profile fetcher with fallback
const useGitHubProfile = (commit: Commit) => {
  const [profile, setProfile] = useState<{
    username: string;
    avatar: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        // First check if we already have the data from the API
        if (commit.author_username && commit.author_avatar) {
          setProfile({
            username: commit.author_username,
            avatar: commit.author_avatar,
          });
          setLoading(false);
          return;
        }

        // Fallback: try to find GitHub username from email patterns
        let username = '';

        if (commit.author_email.includes('@users.noreply.github.com')) {
          const match = commit.author_email.match(
            /(\d+\+)?([^@]+)@users\.noreply\.github\.com/
          );
          if (match && match[2]) username = match[2];
        } else if (commit.author_email.includes('github.com')) {
          const match = commit.author_email.match(/([^@]+)@.*github\.com/);
          if (match && match[1]) username = match[1];
        }

        // If still no username found, try using author name
        if (!username) {
          username = commit.author_name.toLowerCase().replace(/\s+/g, '-');
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

    fetchProfile();
  }, [
    commit.author_name,
    commit.author_email,
    commit.author_username,
    commit.author_avatar,
  ]);

  return { profile, loading };
};

// Individual Commit Card Component
const CommitCard: React.FC<{
  commit: Commit;
  index: number;
  isLast: boolean;
  onClick: () => void;
}> = ({ commit, index, isLast, onClick }) => {
  const { profile, loading } = useGitHubProfile(commit);
  const commitType = getCommitTypeFromMessage(commit.message);
  const timeAgo = formatTimeAgo(commit.date);

  return (
    <div
      className="commit-card group relative"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Connection line for commit timeline */}
      {!isLast && (
        <div className="absolute left-[52px] top-[90px] h-8 w-0.5 bg-gradient-to-b from-gray-600 to-transparent opacity-40" />
      )}

      <Card
        className="cursor-pointer overflow-hidden border border-gray-800/60 bg-black/40 backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-gray-700/80 hover:bg-black/60 hover:shadow-2xl hover:shadow-violet-500/10"
        onClick={onClick}
      >
        <CardContent className="p-0">
          <div className="flex">
            {/* Left side - Art and timeline */}
            <div className="flex flex-col items-center p-6 pr-4">
              <div className="commit-art relative">
                <CommitArt hash={commit.sha} size={80} />

                {/* Commit type overlay */}
                <div
                  className={`absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-black text-xs ${commitType.bg}`}
                >
                  {commitType.icon}
                </div>
              </div>

              {/* Timeline dot */}
              <div className="commit-timeline-dot mt-4 h-3 w-3 rounded-full bg-gradient-to-br from-violet-500 to-purple-500" />
            </div>

            {/* Right side - Content */}
            <div className="flex-1 p-6 pl-2">
              {/* Header with time and hash */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link
                    href={commit.url}
                    target="_blank"
                    className="group/hash flex items-center gap-2 rounded-full bg-gray-800/60 px-3 py-1 font-mono text-xs text-gray-300 transition-all hover:bg-gray-700/80 hover:text-white"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Hash className="h-3 w-3" />
                    {commit.sha.substring(0, 7)}
                    <ExternalLink className="h-3 w-3 opacity-60 transition-opacity group-hover/hash:opacity-100" />
                  </Link>

                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {timeAgo}
                  </div>
                </div>
              </div>

              {/* Commit message */}
              <h3 className="mb-3 text-lg font-semibold leading-relaxed text-white transition-colors group-hover:text-violet-100">
                {commit.message.length > 60
                  ? `${commit.message.substring(0, 60)}...`
                  : commit.message}
              </h3>

              {/* Author info with real GitHub profile */}
              <div className="flex items-center gap-3 text-sm text-gray-400">
                {loading ? (
                  <div className="h-8 w-8 animate-pulse rounded-full bg-gray-700" />
                ) : profile?.avatar ? (
                  <Image
                    src={profile.avatar}
                    alt={commit.author_name}
                    width={32}
                    height={32}
                    className="rounded-full border border-gray-600"
                  />
                ) : (
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${hashToColors(commit.sha).primary}, ${hashToColors(commit.sha).secondary})`,
                    }}
                  >
                    {commit.author_name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span className="font-medium text-gray-300">
                    {profile?.username || commit.author_name}
                  </span>
                </div>
              </div>

              {/* Hover effect gradient bar */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${commitType.color}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper functions
const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const commitDate = new Date(dateString);
  const diffInHours = Math.floor(
    (now.getTime() - commitDate.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return 'just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
  return `${Math.floor(diffInHours / 168)}w ago`;
};

const getCommitTypeFromMessage = (message: string) => {
  const msg = message.toLowerCase();
  if (msg.startsWith('feat') || msg.includes('feature'))
    return {
      icon: '✨',
      color: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-500/10',
    };
  if (msg.startsWith('fix') || msg.includes('bug'))
    return {
      icon: '🐛',
      color: 'from-red-500 to-pink-500',
      bg: 'bg-red-500/10',
    };
  if (msg.startsWith('docs') || msg.includes('doc'))
    return {
      icon: '📚',
      color: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-500/10',
    };
  if (msg.startsWith('style') || msg.includes('ui'))
    return {
      icon: '🎨',
      color: 'from-purple-500 to-pink-500',
      bg: 'bg-purple-500/10',
    };
  if (msg.startsWith('refactor'))
    return {
      icon: '♻️',
      color: 'from-yellow-500 to-orange-500',
      bg: 'bg-yellow-500/10',
    };
  if (msg.startsWith('test'))
    return {
      icon: '🧪',
      color: 'from-indigo-500 to-purple-500',
      bg: 'bg-indigo-500/10',
    };
  if (msg.startsWith('chore'))
    return {
      icon: '🔧',
      color: 'from-gray-500 to-gray-600',
      bg: 'bg-gray-500/10',
    };
  return {
    icon: '💫',
    color: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-500/10',
  };
};

export const CommitsList = ({ commits, repositoryUrl }: CommitsListProps) => {
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null);

  const handleCommitClick = (commit: Commit) => {
    setSelectedCommit(commit);
  };

  const handleCloseModal = () => {
    setSelectedCommit(null);
  };

  // Extract owner and repo from repository URL or commit URL
  const getOwnerAndRepo = () => {
    let urlToUse = repositoryUrl;

    // If no repository URL provided, try to extract from first commit URL
    if (!urlToUse && commits.length > 0) {
      urlToUse = commits[0]?.url;
    }

    if (urlToUse) {
      const match = urlToUse.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (match && match[1] && match[2]) {
        return { owner: match[1], repo: match[2].replace('.git', '') };
      }
    }

    return { owner: '', repo: '' };
  };

  const { owner, repo } = getOwnerAndRepo();

  // Empty state
  if (!commits || commits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-6 h-24 w-24 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 p-6">
          <GitCommit className="h-full w-full text-violet-400" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-white">
          No commits yet
        </h3>
        <p className="text-gray-400">
          Commits will appear here once there are updates to the repository.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="commits-container space-y-6">
        {commits.map((commit, index) => (
          <CommitCard
            key={commit.sha}
            commit={commit}
            index={index}
            isLast={index === commits.length - 1}
            onClick={() => handleCommitClick(commit)}
          />
        ))}
      </div>

      {selectedCommit && (
        <CommitModal
          commit={{
            sha: selectedCommit.sha,
            commit: {
              message: selectedCommit.message,
              author: {
                name: selectedCommit.author_name,
                date: selectedCommit.date,
              },
            },
            author: {
              login: selectedCommit.author_name,
              html_url: selectedCommit.url,
            },
          }}
          owner={owner || ''}
          repo={repo || ''}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};
