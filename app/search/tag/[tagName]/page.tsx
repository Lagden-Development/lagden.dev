import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Tag } from 'lucide-react';
import ProjectsGrid from '@/components/shared/ui/ProjectsGrid';

interface PageProps {
  params: Promise<{ tagName: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getProjectTitle(slug: string): Promise<string | null> {
  try {
    const baseUrl = process.env.LAGDEN_DEV_API_BASE_URL;
    const apiKey = process.env.LAGDEN_DEV_API_KEY;

    const response = await fetch(
      `${baseUrl}/ldev-cms/projects/${slug}?api_key=${apiKey}`,
      {
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.title;
  } catch (error) {
    console.error('Error fetching project title:', error);
    return null;
  }
}

export default async function TagSearch({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const tagName = decodeURIComponent(resolvedParams.tagName);
  const fromProject = resolvedSearchParams.fromProject as string | undefined;
  const projectTitle = fromProject ? await getProjectTitle(fromProject) : null;

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4">
        <Card className="border border-gray-800 bg-black/50 shadow-xl backdrop-blur-md">
          <CardHeader className="relative pb-6">
            {fromProject && (
              <div className="absolute left-6 top-6">
                <Button
                  className="group relative overflow-hidden rounded-full border border-gray-800 bg-black px-4 py-2 text-white transition-all duration-300 hover:border-violet-500/50 hover:shadow-[0_0_15px_rgba(124,58,237,0.2)]"
                  asChild
                >
                  <Link
                    href={`/projects/${fromProject}`}
                    className="flex items-center"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                    <span>Back to {projectTitle || 'project'}</span>
                  </Link>
                </Button>
              </div>
            )}

            <CardTitle className="flex items-center justify-center space-x-3 text-4xl font-bold text-white">
              <Tag className="h-8 w-8" />
              <span>Projects tagged: {tagName}</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <ProjectsGrid filterTags={[tagName]} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
