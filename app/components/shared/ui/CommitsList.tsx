// app/components/shared/ui/CommitsList.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { GitCommit, ExternalLink } from 'lucide-react';
import CommitModal from '@/components/CommitModal';

interface Commit {
  sha: string;
  message: string;
  author_name: string;
  author_email: string;
  date: string;
  url: string;
}

interface CommitsListProps {
  commits: Commit[];
}

export const CommitsList = ({ commits }: CommitsListProps) => {
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null);

  const handleCommitClick = (commit: Commit) => {
    setSelectedCommit(commit);
  };

  const handleCloseModal = () => {
    setSelectedCommit(null);
  };

  return (
    <>
      <div className="space-y-4">
        {commits.map((commit) => (
          <Card
            key={commit.sha}
            className="cursor-pointer rounded-xl border-gray-800 bg-black transition-colors hover:bg-gray-800"
            onClick={() => handleCommitClick(commit)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <GitCommit className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
                <div className="flex-grow text-left">
                  <p className="text-xl font-bold text-white">
                    {commit.message.length > 50
                      ? `${commit.message.substring(0, 50)}...`
                      : commit.message}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-400">
                    <Link
                      href={commit.url}
                      target="_blank"
                      className="flex items-center hover:text-gray-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {commit.sha.substring(0, 7)}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                    <span>by</span>
                    <span>{commit.author_name}</span>
                    <span>•</span>
                    <span>{new Date(commit.date).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
          owner=""
          repo=""
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};
