'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import { usePathname, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GithubIcon, Globe, ArrowLeft, History } from 'lucide-react';
import ProjectNotFound from '@/components/ProjectNotFound';

interface Project {
  id: string;
  title: string;
  description: string;
  imgSrc: string;
  readmeUrl: string;
  statusId?: string;
  tags: string[];
  githubUrl?: string;
  webUrl?: string;
}

interface StatusDetails {
  status?: string;
  last_checked_at?: string;
  response_times: {
    data: {
      attributes: {
        regions: {
          response_times: {
            response_time: number;
          }[];
        }[];
      };
    };
  };
}

const initialStatusDetails: StatusDetails = {
  response_times: {
    data: {
      attributes: {
        regions: [],
      },
    },
  },
};

export default function Project() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const projectId = pathname.split('/').pop()?.toLowerCase();
  const fromHome = searchParams.get('from') === 'home';

  const [project, setProject] = useState<Project | null>(null);
  const [readme, setReadme] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);
  const [status, setStatus] = useState<string | null>(null);
  const [statusDetails, setStatusDetails] =
    useState<StatusDetails>(initialStatusDetails);
  const [averageResponseTime, setAverageResponseTime] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (projectId) {
      fetch('/projects.json')
        .then((res) => res.json())
        .then((projects: Project[]) => {
          const foundProject = projects.find(
            (p) => p.id.toLowerCase() === projectId
          );
          if (foundProject) {
            setProject(foundProject);

            fetch(foundProject.readmeUrl)
              .then((res) => res.text())
              .then((text) => {
                remark()
                  .use(remarkHtml)
                  .process(text)
                  .then((file) => {
                    setReadme(String(file));
                    setIsLoading(false);
                  });
              });

            if (foundProject.statusId) {
              fetchProjectStatus(foundProject.statusId);
              const interval = setInterval(() => {
                fetchProjectStatus(foundProject.statusId);
              }, 30000); // 30 seconds

              return () => clearInterval(interval);
            }
          } else {
            setIsNotFound(true);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.error('Error loading project: ', err);
          setIsNotFound(true);
          setIsLoading(false);
        });
    }
  }, [projectId]);

  const fetchProjectStatus = (statusId: string) => {
    fetch(`/api/project-status?statusId=${statusId}`)
      .then((res) => res.json())
      .then((data: StatusDetails) => {
        if (data.status) {
          setStatus(data.status);
          setStatusDetails(data);
          const responseTimes =
            data.response_times.data.attributes.regions.flatMap((region) =>
              region.response_times.map((rt) => rt.response_time)
            );
          const avgResponseTime = (
            responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
          ).toFixed(2);
          setAverageResponseTime(avgResponseTime);
        } else {
          setStatus('unknown');
        }
      })
      .catch((err) => {
        console.error('Error fetching project status: ', err);
        setStatus('unknown');
      });
  };

  const statusIndicator = status ? (
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
                  <strong>Average Response Time:</strong> {averageResponseTime}{' '}
                  seconds
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
                  <strong>Information:</strong> Validation occurs after a period
                  of downtime to ensure the service is back up and running.
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
  ) : null;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    );
  }

  if (isNotFound) {
    return <ProjectNotFound />;
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="mx-auto flex max-w-6xl flex-col px-4 text-white md:flex-row">
        <div className="md:w-1/3 md:pr-8">
          <Card className="border-gray-800 bg-black">
            <CardContent className="p-6">
              <Image
                src={project!.imgSrc}
                alt={project!.title}
                width={400}
                height={400}
                className="mb-6 rounded object-contain"
              />
              <div className="flex items-center">
                <h1 className="text-4xl font-bold text-white">
                  {project!.title}
                </h1>
                {statusIndicator}
              </div>
              <p className="my-4 text-lg text-gray-300">
                {project!.description}
              </p>
              <div className="mb-6 flex flex-wrap gap-2">
                {project!.tags.map((tag, index) => (
                  <Link
                    key={index}
                    href={`/search/tag/${tag}?fromProject=${project!.id}`}
                  >
                    <span className="inline-block rounded bg-gray-800 px-3 py-1 text-sm text-white transition-colors hover:bg-gray-700">
                      {tag}
                    </span>
                  </Link>
                ))}
              </div>
              <div className="mb-6 flex space-x-4">
                {project!.githubUrl && (
                  <Button
                    variant="secondary"
                    className="bg-gray-800 text-white hover:bg-gray-700"
                    asChild
                  >
                    <a
                      href={project!.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <GithubIcon className="mr-2 h-4 w-4" />
                      GitHub
                    </a>
                  </Button>
                )}
                {project!.webUrl && (
                  <Button
                    variant="secondary"
                    className="bg-gray-800 text-white hover:bg-gray-700"
                    asChild
                  >
                    <a
                      href={project!.webUrl}
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
                <Link href={`/projects/${projectId}/commits`}>
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
              <div
                dangerouslySetInnerHTML={{ __html: readme }}
                className="prose prose-invert max-w-none pt-6"
              ></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
