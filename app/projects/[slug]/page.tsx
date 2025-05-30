'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { Document } from '@contentful/rich-text-types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatusIndicator from '@/components/StatusIndicator';
import {
  ProjectStructuredData,
  BreadcrumbStructuredData,
} from '@/lib/structured-data';
import {
  GithubIcon,
  Globe,
  ArrowLeft,
  History,
  ExternalLink,
} from 'lucide-react';
import type { Project } from '@/types';
import { ensureHttps } from '@/helpers';
import { getProjectClient } from '@/lib/api-client';
import ProjectDetailSkeleton from '@/components/skeletons/ProjectDetailSkeleton';

export default function ProjectPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const slug = params.slug as string;
  const fromParam = searchParams.get('from');
  const fromHome = fromParam === 'home';

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        console.log(`[ProjectPage] Fetching project: ${slug}`);
        const fetchedProject = await getProjectClient(slug);
        setProject(fetchedProject);
        setError(null);
      } catch (err) {
        console.error(`[ProjectPage] Error fetching project:`, err);
        setError('Failed to load project');
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProject();
    }
  }, [slug]);

  if (loading) {
    return <ProjectDetailSkeleton />;
  }

  if (error || !project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="relative mx-4 max-w-lg overflow-hidden rounded-xl border border-gray-800/80 bg-black/50 p-8 text-center shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md">
          <h1 className="mb-4 bg-gradient-to-br from-white to-gray-400 bg-clip-text text-3xl font-bold text-transparent">
            {error ? 'Error Loading Project' : 'Project Not Found'}
          </h1>
          <p className="mb-6 text-gray-400">
            {error ||
              "The project you're looking for doesn't exist or has been moved."}
          </p>
          <Button
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 px-6 py-2 text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]"
            asChild
          >
            <Link href="/projects" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              Return to Projects
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { name: 'Home', url: 'https://lagden.dev' },
    { name: 'Projects', url: 'https://lagden.dev/projects' },
    {
      name: project.title || 'Project',
      url: `https://lagden.dev/projects/${slug}`,
    },
  ];

  return (
    <>
      <ProjectStructuredData project={project} />
      <BreadcrumbStructuredData items={breadcrumbItems} />

      <div className="relative min-h-screen overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 py-16">
          <div className="flex flex-col gap-8 md:flex-row">
            {/* Sidebar */}
            <div className="md:w-1/3">
              <div className="relative overflow-hidden rounded-xl border border-gray-800/80 bg-black/50 shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md">
                <div className="p-6">
                  <div className="mb-6 overflow-hidden rounded-lg bg-gradient-to-br from-gray-900 to-black p-4">
                    {ensureHttps(project.picture_url) ? (
                      <Image
                        src={ensureHttps(project.picture_url)!}
                        alt={project.title}
                        width={400}
                        height={400}
                        className="rounded object-contain transition-all duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-96 w-full items-center justify-center rounded bg-gradient-to-br from-violet-500/5 via-fuchsia-500/5 to-indigo-500/5">
                        <div className="rounded-lg bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-indigo-500/20 p-12">
                          <div className="h-24 w-24 rounded-lg bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30" />
                        </div>
                      </div>
                    )}
                  </div>

                  <h1 className="bg-gradient-to-br from-white via-gray-100 to-violet-200 bg-clip-text text-4xl font-bold text-transparent">
                    {project.title}
                  </h1>

                  <p className="my-4 text-gray-400">{project.description}</p>

                  {project.better_stack_status_id && (
                    <div className="mb-4">
                      <StatusIndicator
                        status="unknown"
                        lastCheckedAt=""
                        url=""
                        projectSlug={project.slug}
                        monitorId={project.better_stack_status_id}
                      />
                    </div>
                  )}

                  <div className="mb-6 flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <Link
                        key={index}
                        href={`/search/tag/${tag}?fromProject=${project.slug}`}
                        className="group relative overflow-hidden rounded-full bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-cyan-500/10 px-3 py-1 text-sm text-violet-300 transition-all duration-300 hover:from-violet-500/20 hover:via-indigo-500/20 hover:to-cyan-500/20"
                      >
                        <span className="relative z-10">{tag}</span>
                      </Link>
                    ))}
                  </div>

                  <div className="mb-6 space-y-3">
                    {project.github_repo_url && (
                      <Button
                        className="group relative w-full overflow-hidden rounded-full border border-gray-800 bg-black px-4 py-2 text-white transition-all duration-300 hover:border-violet-500/50 hover:shadow-[0_0_15px_rgba(124,58,237,0.2)]"
                        asChild
                      >
                        <a
                          href={project.github_repo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center"
                        >
                          <GithubIcon className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                          View on GitHub
                        </a>
                      </Button>
                    )}
                    {project.website_url && (
                      <Button
                        className="group relative w-full overflow-hidden rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 px-4 py-2 text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                        asChild
                      >
                        <a
                          href={project.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center"
                        >
                          <Globe className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                          Visit Website
                        </a>
                      </Button>
                    )}
                    <Button
                      className="group relative w-full overflow-hidden rounded-full border border-gray-800 bg-black px-4 py-2 text-white transition-all duration-300 hover:border-violet-500/50 hover:shadow-[0_0_15px_rgba(124,58,237,0.2)]"
                      asChild
                    >
                      <Link
                        href={`/projects/${project.slug}/commits`}
                        className="flex items-center justify-center"
                      >
                        <History className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                        View Commit History
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:w-2/3">
              <div className="relative overflow-hidden rounded-xl border border-gray-800/80 bg-black/50 shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md">
                <div className="p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <Button
                      className="group relative overflow-hidden rounded-full border border-gray-800 bg-black px-4 py-2 text-white transition-all duration-300 hover:border-violet-500/50 hover:shadow-[0_0_15px_rgba(124,58,237,0.2)]"
                      asChild
                    >
                      <Link
                        href={fromHome ? '/' : '/projects'}
                        className="flex items-center"
                      >
                        <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                        {fromHome ? 'Back to Home' : 'Back to Projects'}
                      </Link>
                    </Button>

                    {fromHome && (
                      <Button
                        className="group relative overflow-hidden rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 px-4 py-2 text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                        asChild
                      >
                        <Link href="/projects">
                          View All Projects
                          <ExternalLink className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
                        </Link>
                      </Button>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-transparent blur-3xl" />
                    <div className="relative border-t border-gray-800/50" />
                  </div>

                  <article
                    dangerouslySetInnerHTML={{
                      __html: documentToHtmlString(
                        project.project_readme as Document
                      ),
                    }}
                    className="prose prose-invert max-w-none pt-6 prose-headings:bg-gradient-to-br prose-headings:from-white prose-headings:via-gray-100 prose-headings:to-violet-200 prose-headings:bg-clip-text prose-headings:text-transparent prose-a:text-violet-400 prose-a:transition-colors prose-a:hover:text-violet-300 prose-strong:text-white prose-code:rounded-md prose-code:bg-gray-800/50 prose-code:px-1 prose-code:py-0.5"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
