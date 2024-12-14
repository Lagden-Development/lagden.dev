import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { CommitsList } from '@/components/shared/ui/CommitsList';
import type { CommitsResponse } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getCommits(slug: string): Promise<CommitsResponse | null> {
  try {
    const baseUrl = process.env.LAGDEN_DEV_API_BASE_URL;
    const apiKey = process.env.LAGDEN_DEV_API_KEY;

    const response = await fetch(
      `${baseUrl}/ldev-cms/projects/${slug}/commits?api_key=${apiKey}&limit=10`,
      {
        next: { revalidate: 60 },
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

export default async function CommitsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const commitsData = await getCommits(resolvedParams.slug);

  if (!commitsData) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-lg border-gray-800 bg-black/50 shadow-xl backdrop-blur-md">
          <CardContent className="p-8">
            <div className="text-center">
              <p className="mb-6 text-xl font-semibold text-red-400">
                Error: Project not found
              </p>
              <Button
                className="group relative overflow-hidden rounded-full border border-gray-800 bg-black px-4 py-2 text-white transition-all duration-300 hover:border-violet-500/50 hover:shadow-[0_0_15px_rgba(124,58,237,0.2)]"
                asChild
              >
                <Link
                  href={`/projects/${resolvedParams.slug}`}
                  className="flex items-center"
                >
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

  const { project_title, commits } = commitsData;

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
                <Link
                  href={`/projects/${resolvedParams.slug}`}
                  className="flex items-center"
                >
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
            <CommitsList commits={commits} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}