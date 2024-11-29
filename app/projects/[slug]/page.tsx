// app/projects/[slug]/page.tsx
'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { Document } from '@contentful/rich-text-types';
import { useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GithubIcon, Globe, ArrowLeft, History } from 'lucide-react';
import ProjectNotFound from '@/components/ProjectNotFound';

interface Project {
  title: string;
  slug: string;
  tags: string[];
  github_repo_url: string;
  website_url: string;
  project_readme: Document;
  picture_url: string;
  better_stack_status_id: string;
  is_featured: boolean;
  description: string;
}

interface StatusDetails {
  status?: string;
  last_checked_at?: string;
  response_times: {
    data: {
      attributes: {
        response_time: number;
      }[];
    };
  };
}

const initialStatusDetails: StatusDetails = {
  response_times: {
    data: {
      attributes: [
        {
          response_time: 0,
        },
      ],
    },
  },
};

// Helper function to ensure image URLs have https protocol
const ensureHttps = (url: string) => {
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  if (!url.startsWith('http')) {
    return `https://${url}`;
  }
  return url;
};

export default function Project() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;
  const fromHome = searchParams.get('from') === 'home';

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);
  const [status, setStatus] = useState<string | null>(null);
  const [statusDetails, setStatusDetails] =
    useState<StatusDetails>(initialStatusDetails);
  const [averageResponseTime, setAverageResponseTime] = useState<string | null>(
    null
  );

  useEffect(() => {
    let statusInterval: NodeJS.Timeout;

    const fetchProject = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await fetch(`${baseUrl}/ldev-cms/projects`);
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const projects: Project[] = await response.json();
        const foundProject = projects.find((p) => p.slug === slug);

        if (!foundProject) {
          setIsNotFound(true);
        } else {
          setProject(foundProject);
          if (foundProject.better_stack_status_id) {
            await fetchProjectStatus(foundProject.better_stack_status_id);
            // Set up the interval after the initial fetch
            statusInterval = setInterval(() => {
              fetchProjectStatus(foundProject.better_stack_status_id);
            }, 30000);
          }
        }
      } catch (error) {
        console.error('Error loading project:', error);
        setIsNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchProject();
    }

    // Always return a cleanup function
    return () => {
      if (statusInterval) {
        clearInterval(statusInterval);
      }
    };
  }, [slug]);

  const fetchProjectStatus = async (statusId: string) => {
    try {
      const response = await fetch(`/api/project-status?statusId=${statusId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch status');
      }
      const data = await response.json();

      if (data.status) {
        setStatus(data.status);
        setStatusDetails(data);
        if (data.response_times?.data?.length > 0) {
          const responseTimes = data.response_times.data.map(
            (item: any) => item.attributes.response_time
          );
          const avgResponseTime = (
            responseTimes.reduce((a: number, b: number) => a + b, 0) /
            responseTimes.length
          ).toFixed(2);
          setAverageResponseTime(avgResponseTime);
        }
      } else {
        setStatus('unknown');
      }
    } catch (error) {
      console.error('Error fetching project status:', error);
      setStatus('unknown');
    }
  };

  const renderStatusIndicator = () => {
    if (!status) return null;

    return (
      <div className="relative ml-4 flex items-center">
        <div className="group relative">
          <span
            className={`mr-2 inline-block h-6 w-6 rounded-full ${
              status === 'up'
                ? 'bg-green-500'
                : status === 'down'
                  ? 'bg-red-500'
                  : status === 'validating'
                    ? 'bg-yellow-500'
                    : 'bg-gray-500'
            }`}
            style={{
              animation: 'waves 1.5s ease-in-out infinite',
            }}
          ></span>
          <Card className="absolute bottom-full left-1/2 mb-2 w-64 -translate-x-1/2 transform border-gray-800 bg-black p-2 text-center text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
            <CardContent className="p-4">
              {status === 'up' ? (
                <>
                  <div className="mb-1">
                    <strong>Status:</strong> Up
                  </div>
                  <div className="mb-1">
                    <strong>Last Checked:</strong>{' '}
                    {new Date(statusDetails.last_checked_at!).toLocaleString()}
                  </div>
                  <div className="mb-2">
                    <strong>Average Response Time:</strong>{' '}
                    {averageResponseTime} seconds
                  </div>
                  <Link
                    href="https://status.lagden.dev"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    More Info
                  </Link>
                </>
              ) : status === 'down' ? (
                <>
                  <div className="mb-1">
                    <strong>Status:</strong> Down
                  </div>
                  <div className="mb-2">
                    <strong>Last Checked:</strong>{' '}
                    {new Date(statusDetails.last_checked_at!).toLocaleString()}
                  </div>
                  <Link
                    href="https://status.lagden.dev"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    More Info
                  </Link>
                </>
              ) : status === 'validating' ? (
                <>
                  <div className="mb-1">
                    <strong>Status:</strong> Validating
                  </div>
                  <div className="mb-1">
                    <strong>Last Checked:</strong>{' '}
                    {new Date(statusDetails.last_checked_at!).toLocaleString()}
                  </div>
                  <div className="mb-2">
                    <strong>Information:</strong> Validation occurs after a
                    period of downtime to ensure the service is back up and
                    running.
                  </div>
                  <Link
                    href="https://status.lagden.dev"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    More Info
                  </Link>
                </>
              ) : (
                <>
                  <div className="mb-1">
                    <strong>Status:</strong> Unknown
                  </div>
                  <div className="mb-2">
                    <strong>Last Checked:</strong> N/A
                  </div>
                  <Link
                    href="https://status.lagden.dev"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    More Info
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        <style jsx>{`
          @keyframes waves {
            0%,
            100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.2);
            }
          }
        `}</style>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    );
  }

  if (isNotFound || !project) {
    return <ProjectNotFound />;
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="mx-auto flex max-w-6xl flex-col px-4 text-white md:flex-row">
        <div className="md:w-1/3 md:pr-8">
          <Card className="border-gray-800 bg-black">
            <CardContent className="p-6">
              <Image
                src={ensureHttps(project.picture_url)}
                alt={project.title}
                width={400}
                height={400}
                className="mb-6 rounded object-contain"
              />
              <div className="flex items-center">
                <h1 className="text-4xl font-bold text-white">
                  {project.title}
                </h1>
                {renderStatusIndicator()}
              </div>
              <p className="my-4 text-lg text-gray-300">
                {project.description}
              </p>
              <div className="mb-6 flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <Link
                    key={index}
                    href={`/search/tag/${tag}?fromProject=${project.slug}`}
                  >
                    <span className="inline-block rounded bg-gray-800 px-3 py-1 text-sm text-white transition-colors hover:bg-gray-700">
                      {tag}
                    </span>
                  </Link>
                ))}
              </div>
              <div className="mb-6 flex space-x-4">
                {project.github_repo_url && (
                  <Button
                    variant="secondary"
                    className="bg-gray-800 text-white hover:bg-gray-700"
                    asChild
                  >
                    <a
                      href={project.github_repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <GithubIcon className="mr-2 h-4 w-4" />
                      GitHub
                    </a>
                  </Button>
                )}
                {project.website_url && (
                  <Button
                    variant="secondary"
                    className="bg-gray-800 text-white hover:bg-gray-700"
                    asChild
                  >
                    <a
                      href={project.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      Website
                    </a>
                  </Button>
                )}
              </div>
              <Button
                variant="secondary"
                className="w-full bg-gray-800 text-white hover:bg-gray-700"
                asChild
              >
                <Link href={`/projects/${project.slug}/commits`}>
                  <History className="mr-2 h-4 w-4" />
                  View Commit History
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 md:mt-0 md:w-2/3 md:pl-8">
          <Card className="border-gray-800 bg-black">
            <CardContent className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <Button
                  variant="secondary"
                  className="bg-gray-800 text-white hover:bg-gray-700"
                  asChild
                >
                  <Link href={fromHome ? '/' : '/projects'}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {fromHome ? 'Return to Home' : 'Return to All Projects'}
                  </Link>
                </Button>
                {fromHome && (
                  <Button
                    variant="secondary"
                    className="bg-gray-800 text-white hover:bg-gray-700"
                    asChild
                  >
                    <Link href="/projects">View All Projects</Link>
                  </Button>
                )}
              </div>
              <div className="border-t-2 border-gray-800"></div>
              <article
                dangerouslySetInnerHTML={{
                  __html: documentToHtmlString(project.project_readme),
                }}
                className="prose prose-invert max-w-none pt-6"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
