// app/updates/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  GitCommit,
  ArrowLeft,
  ExternalLink,
  User,
  Clock,
  ChevronRight,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import CommitModal from '../components/CommitModal';

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

export default function Updates() {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null);

  useEffect(() => {
    async function fetchCommits() {
      try {
        const response = await axios.get<Commit[]>('/api/get-commits', {
          params: {
            owner: 'Lagden-Development',
            repo: 'lagden.dev',
          },
        });
        setCommits(response.data);
        setIsLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setIsLoading(false);
      }
    }

    fetchCommits();
  }, []);

  const handleCommitClick = (commit: Commit) => {
    setSelectedCommit(commit);
  };

  const handleCloseModal = () => {
    setSelectedCommit(null);
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-4">
        <Card className="border-gray-800 bg-black">
          <CardContent className="p-6">
            <p className="text-xl text-red-400">Error: {error}</p>
            <Button
              variant="secondary"
              className="mt-4 bg-gray-800 text-white hover:bg-gray-700"
              asChild
            >
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="mx-auto max-w-4xl px-4">
        <Card className="border-gray-800 bg-black">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold text-white">
              Website Updates
            </CardTitle>
            <p className="mt-2 text-lg text-gray-300">
              Here are the latest commits to the Lagden Development website
              repository.
            </p>
            <Button
              variant="secondary"
              className="mt-4 bg-gray-800 text-white hover:bg-gray-700"
              asChild
            >
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Home
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="space-y-4">
                {commits.map((commit) => (
                  <Card
                    key={commit.sha}
                    className="cursor-pointer border-gray-800 bg-black transition-colors hover:bg-gray-800"
                    onClick={() => handleCommitClick(commit)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <GitCommit className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
                        <div className="flex-grow">
                          <div className="flex items-center justify-between">
                            <p className="text-xl font-bold text-white">
                              {commit.commit.message.length > 50
                                ? `${commit.commit.message.substring(0, 50)}...`
                                : commit.commit.message}
                            </p>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
                            <Link
                              href={`https://github.com/Lagden-Development/lagden.dev/commit/${commit.sha}`}
                              target="_blank"
                              className="flex items-center hover:text-gray-300"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <code className="font-mono">
                                {commit.sha.substring(0, 7)}
                              </code>
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </Link>

                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <a
                                href={commit.author.html_url}
                                target="_blank"
                                className="hover:text-gray-300"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {commit.commit.author.name}
                                <ExternalLink className="ml-1 inline h-3 w-3" />
                              </a>
                            </div>

                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {new Date(
                                  commit.commit.author.date
                                ).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedCommit && (
          <CommitModal
            commit={selectedCommit}
            owner="Lagden-Development"
            repo="lagden.dev"
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
}
