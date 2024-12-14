// app/projects/[slug]/commits/page.tsx
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { CommitsList } from '@/components/shared/ui/CommitsList';
import type { CommitsResponse } from '@/types';

async function getCommits(): Promise<CommitsResponse | null> {
  try {
    const baseUrl = process.env.LAGDEN_DEV_API_BASE_URL;
    const apiKey = process.env.LAGDEN_DEV_API_KEY;

    const response = await fetch(
      `${baseUrl}/ldev-cms/projects/lagden-dev/commits?api_key=${apiKey}&limit=10`,
      {
        next: { revalidate: 60 }, // Revalidate every minute
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch commits');
    }

    const data: CommitsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching commits:', error);
    return null;
  }
}

export default async function CommitsPage() {
  const commitsData = await getCommits();

  if (!commitsData) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="border-gray-800 bg-black">
          <CardContent className="p-6">
            <p className="text-xl text-red-400">
              We&apos;re sorry, but an unexpected error occurred.
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

  const { project_title, commits } = commitsData;

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
            <CommitsList commits={commits} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
