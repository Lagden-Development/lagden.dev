'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
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
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex justify-center">
      <div className="max-w-4xl w-full text-center px-4">
        <section className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Website Updates</h1>
          <p className="text-lg">
            Here are the latest commits to the Lagden Development website
            repository.
          </p>
          <Link href="/" passHref>
            <p className="text-gray-400 mt-4 cursor-pointer hover:underline">
              Go back to Home
            </p>
          </Link>
        </section>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <section className="mb-8">
            <div className="grid grid-cols-1 gap-6">
              {commits.map((commit) => (
                <div
                  key={commit.sha}
                  className="border border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-800"
                  onClick={() => handleCommitClick(commit)}
                >
                  <p className="text-xl font-bold">
                    {commit.commit.message.length > 50
                      ? `${commit.commit.message.substring(0, 50)}...`
                      : commit.commit.message}
                  </p>
                  <p className="text-gray-400">
                    <Link
                      href={`https://github.com/Lagden-Development/lagden.dev/commit/${commit.sha}`}
                      target="_blank"
                      className="underline"
                    >
                      {commit.sha.substring(0, 7)}
                    </Link>
                    {' - '}
                    <a
                      href={commit.author.html_url}
                      target="_blank"
                      className="underline"
                    >
                      {commit.commit.author.name}
                    </a>
                    {' - '}
                    {new Date(commit.commit.author.date).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

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
