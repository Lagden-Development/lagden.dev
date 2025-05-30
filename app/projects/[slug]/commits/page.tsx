'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { CommitsList } from '@/components/shared/ui/CommitsList';
import { getCommitsClient } from '@/lib/api-client';
import type { CommitsResponse } from '@/types';

export default function CommitsPage() {
  const params = useParams();
  const [commitsData, setCommitsData] = useState<{
    project_title: string;
    repository_url: string;
    commits: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const slug = params.slug as string;

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        setLoading(true);
        console.log(`[CommitsPage] Fetching commits for: ${slug}`);
        const fetchedCommits = await getCommitsClient(slug);
        setCommitsData(fetchedCommits);
        setError(null);
      } catch (err) {
        console.error(`[CommitsPage] Error fetching commits:`, err);
        setError('Failed to load commits');
        setCommitsData(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCommits();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="mx-auto max-w-4xl px-4">
          <Card className="rounded-xl border border-gray-800 bg-black/50 shadow-xl backdrop-blur-md">
            <CardHeader className="relative pb-6">
              <div className="animate-pulse">
                <div className="mb-4 h-10 w-32 rounded-full bg-gray-800/50" />
                <div className="mb-2 h-10 w-64 rounded bg-gray-800/50" />
                <div className="h-6 w-48 rounded bg-gray-800/50" />
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
        <Card className="w-full max-w-lg border-gray-800 bg-black/50 shadow-xl backdrop-blur-md">
          <CardContent className="p-8">
            <div className="text-center">
              <p className="mb-6 text-xl font-semibold text-red-400">
                {error || 'No commits found'}
              </p>
              <Button
                className="group relative overflow-hidden rounded-full border border-gray-800 bg-black px-4 py-2 text-white transition-all duration-300 hover:border-violet-500/50 hover:shadow-[0_0_15px_rgba(124,58,237,0.2)]"
                asChild
              >
                <Link href={`/projects/${slug}`} className="flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                  <span>Back to Project</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { project_title, commits, repository_url } = commitsData;

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4">
        <Card className="rounded-xl border border-gray-800 bg-black/50 shadow-xl backdrop-blur-md">
          <CardHeader className="relative pb-6">
            <div className="absolute left-6 top-6">
              <Button
                className="group relative overflow-hidden rounded-full border border-gray-800 bg-black px-4 py-2 text-white transition-all duration-300 hover:border-violet-500/50 hover:shadow-[0_0_15px_rgba(124,58,237,0.2)]"
                asChild
              >
                <Link href={`/projects/${slug}`} className="flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                  <span>Back to {project_title}</span>
                </Link>
              </Button>
            </div>

            <div className="pt-8 text-center">
              <CardTitle className="text-4xl font-bold text-white">
                Commit Updates
              </CardTitle>
              <p className="mt-3 text-lg text-gray-300">
                Latest commits to the {project_title} repository
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <CommitsList commits={commits} repositoryUrl={repository_url} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
