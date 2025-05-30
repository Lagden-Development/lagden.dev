'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { CommitsList } from '@/components/shared/ui/CommitsList';
import { getCommitsClient } from '@/lib/api-client';
import type { CommitsResponse } from '@/types';

export default function UpdatesPage() {
  const [commitsData, setCommitsData] = useState<{
    project_title: string;
    repository_url: string;
    commits: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        setLoading(true);
        console.log('[UpdatesPage] Fetching commits for lagden-dev');
        const fetchedCommits = await getCommitsClient('lagden-dev');
        setCommitsData(fetchedCommits);
        setError(null);
      } catch (err) {
        console.error('[UpdatesPage] Error fetching commits:', err);
        setError('Failed to load updates');
        setCommitsData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCommits();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="mx-auto max-w-4xl px-4">
          <Card className="rounded-xl border border-gray-800 bg-black/50 shadow-xl backdrop-blur-md">
            <CardHeader className="text-center">
              <div className="animate-pulse">
                <div className="mx-auto mb-2 h-10 w-64 rounded bg-gray-800/50" />
                <div className="mx-auto h-6 w-48 rounded bg-gray-800/50" />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded bg-gray-800/50"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !commitsData || !commitsData.commits.length) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="border-gray-800 bg-black">
          <CardContent className="p-6">
            <p className="text-xl text-red-400">
              {error || "We're sorry, but an unexpected error occurred."}
            </p>
            <Button
              variant="secondary"
              className="mt-4 bg-gray-800 text-white hover:bg-gray-700"
              asChild
            >
              <Link href={`/`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { project_title, commits, repository_url } = commitsData;

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4">
        <Card className="rounded-xl border border-gray-800 border-gray-800/80 bg-black/50 shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold text-white">
              Latest Updates
            </CardTitle>
            <p className="mt-2 text-lg text-gray-300">
              Latest commits to lagden.dev.
            </p>
          </CardHeader>

          <CardContent className="p-6">
            <CommitsList commits={commits} repositoryUrl={repository_url} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
