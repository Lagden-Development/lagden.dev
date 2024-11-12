'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, GitCommit, ExternalLink } from 'lucide-react';
import CommitModal from '@/components/CommitModal';
import projects from '@/../public/projects.json';

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

const CommitsPage = () => {
  const params = useParams();
  const projectId = params?.projectId;
  const [commits, setCommits] = useState<Commit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null);
  const [projectName, setProjectName] = useState<string>('');
  const [owner, setOwner] = useState<string>('');
  const [repo, setRepo] = useState<string>('');

  useEffect(() => {
    if (!projectId) return;

    const project = projects.find((project) => project.id === projectId);
    if (!project) {
      setError('Invalid project ID');
      setIsLoading(false);
      return;
    }

    const projectName = project.title;
    setProjectName(projectName);

    const repoUrl = project.githubUrl;
    const repoNameMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!repoNameMatch) {
      setError('Invalid GitHub URL');
      setIsLoading(false);
      return;
    }

    const fetchedOwner = repoNameMatch[1];
    const fetchedRepo = repoNameMatch[2];

    setOwner(fetchedOwner);
    setRepo(fetchedRepo);

    const fetchCommits = async () => {
      try {
        const response = await axios.get<Commit[]>('/api/get-commits', {
          params: {
            owner: fetchedOwner,
            repo: fetchedRepo,
          },
        });
        setCommits(response.data);
        setIsLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setIsLoading(false);
      }
    };

    fetchCommits();
  }, [projectId, params]);

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
              <Link href={`/projects/${projectId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Project
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
              Commit Updates
            </CardTitle>
            <p className="mt-2 text-lg text-gray-300">
              Latest commits to the {projectName} repository.
            </p>
            <Button
              variant="secondary"
              className="mt-4 bg-gray-800 text-white hover:bg-gray-700"
              asChild
            >
              <Link href={`/projects/${projectId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to {projectName}
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
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
                        <div className="flex-grow text-left">
                          <p className="text-xl font-bold text-white">
                            {commit.commit.message.length > 50
                              ? `${commit.commit.message.substring(0, 50)}...`
                              : commit.commit.message}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-400">
                            <Link
                              href={`https://github.com/${owner}/${repo}/commit/${commit.sha}`}
                              target="_blank"
                              className="flex items-center hover:text-gray-300"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {commit.sha.substring(0, 7)}
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </Link>
                            <span>by</span>
                            {commit.author ? (
                              <a
                                href={commit.author.html_url}
                                target="_blank"
                                className="hover:text-gray-300"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {commit.commit.author.name}
                                <ExternalLink className="ml-1 inline h-3 w-3" />
                              </a>
                            ) : (
                              <span>{commit.commit.author.name}</span>
                            )}
                            <span>•</span>
                            <span>
                              {new Date(
                                commit.commit.author.date
                              ).toLocaleString()}
                            </span>
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
            owner={owner}
            repo={repo}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
};

export default CommitsPage;
