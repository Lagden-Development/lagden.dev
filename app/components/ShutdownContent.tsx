'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Mail,
  Calendar,
  Info,
  Link as LinkIcon,
  Github,
  MessageSquare,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

interface ShutdownProject {
  projectID: string;
  projectName: string;
  projectDescription: string;
  projectURL: string;
  shutdownDate: string;
  shutdownReason: string;
  githubRepo?: string;
}

export default function ShutdownContent() {
  const [project, setProject] = useState<ShutdownProject | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  useEffect(() => {
    if (projectId) {
      fetch('/shutdown_projects.json')
        .then((res) => res.json())
        .then((projects: ShutdownProject[]) => {
          const foundProject = projects.find((p) => p.projectID === projectId);
          if (foundProject) {
            setProject(foundProject);
          } else {
            setError('Project not found.');
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Error loading shutdown projects: ', err);
          setError('Failed to load shutdown project data.');
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-gray-800 bg-black">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
            <p className="text-xl text-red-400">{error}</p>
            <Button
              variant="secondary"
              className="bg-gray-800 text-white hover:bg-gray-700"
              asChild
            >
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (project) {
    return (
      <Card className="border-gray-800 bg-black">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <AlertTriangle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-4xl font-bold text-white">
            {project.projectName} has been shut down
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          <div className="rounded-lg bg-gray-800/50 p-6 text-center">
            <p className="text-lg text-gray-300">
              Sorry, this project has been shut down. If you have any questions,
              please{' '}
              <Button
                variant="link"
                className="h-auto p-0 text-blue-400 hover:text-blue-300"
                asChild
              >
                <a href="mailto:contact@lagden.dev">contact us</a>
              </Button>
              .
            </p>
          </div>

          <div className="rounded-lg bg-gray-800/50 p-6">
            <p className="text-gray-300">
              Confused? You have been redirected to{' '}
              <span className="font-semibold text-white">
                https://lagden.dev/
              </span>{' '}
              because the website you were just on ({project.projectURL}) has
              been shut down by one of our members. You are now on the
              lagden.dev website. We are a small group of developers who work on
              various projects.
            </p>
          </div>

          <div className="space-y-4 rounded-lg bg-gray-800/50 p-6">
            <h2 className="mb-6 text-2xl font-bold text-white">
              Project Details
            </h2>

            <div className="grid gap-4 text-left md:grid-cols-2">
              <div className="flex items-start gap-2">
                <Info className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
                <div>
                  <dt className="text-sm text-gray-400">Project Name</dt>
                  <dd className="text-white">{project.projectName}</dd>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MessageSquare className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
                <div>
                  <dt className="text-sm text-gray-400">Description</dt>
                  <dd className="text-white">{project.projectDescription}</dd>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <LinkIcon className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
                <div>
                  <dt className="text-sm text-gray-400">Project URL</dt>
                  <dd className="text-white">{project.projectURL}</dd>
                </div>
              </div>

              {project.githubRepo && (
                <div className="flex items-start gap-2">
                  <Github className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
                  <div>
                    <dt className="text-sm text-gray-400">GitHub Repository</dt>
                    <dd>
                      <Button
                        variant="link"
                        className="h-auto p-0 text-blue-400 hover:text-blue-300"
                        asChild
                      >
                        <a
                          href={project.githubRepo}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {project.githubRepo.replace(
                            'https://github.com/',
                            ''
                          )}
                        </a>
                      </Button>
                    </dd>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2">
                <Calendar className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
                <div>
                  <dt className="text-sm text-gray-400">Shutdown Date</dt>
                  <dd className="text-white">{project.shutdownDate}</dd>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Info className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
                <div>
                  <dt className="text-sm text-gray-400">Reason</dt>
                  <dd className="text-white">{project.shutdownReason}</dd>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              variant="secondary"
              className="bg-gray-800 text-white hover:bg-gray-700"
              asChild
            >
              <Link href="/">Return to Home</Link>
            </Button>
            <Button
              variant="secondary"
              className="bg-gray-800 text-white hover:bg-gray-700"
              asChild
            >
              <a href="mailto:contact@lagden.dev">
                <Mail className="mr-2 h-4 w-4" />
                Contact Us
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-800 bg-black">
      <CardHeader className="text-center">
        <div className="mb-4 flex justify-center">
          <AlertTriangle className="h-16 w-16 text-red-500" />
        </div>
        <CardTitle className="text-4xl font-bold text-white">
          This project has been shut down
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        <div className="rounded-lg bg-gray-800/50 p-6 text-center">
          <p className="text-lg text-gray-300">
            Sorry, this project has been shut down. If you have any questions,
            please{' '}
            <Button
              variant="link"
              className="h-auto p-0 text-blue-400 hover:text-blue-300"
              asChild
            >
              <a href="mailto:contact@lagden.dev">contact us</a>
            </Button>
            .
          </p>
        </div>

        <div className="rounded-lg bg-gray-800/50 p-6">
          <p className="text-gray-300">
            Confused? You have been redirected to{' '}
            <span className="font-semibold text-white">
              https://lagden.dev/
            </span>{' '}
            because the website you were just on has been shut down by one of
            our members. You are now on the lagden.dev website. We are a small
            group of developers who work on various projects.
          </p>
        </div>

        <div className="flex justify-center">
          <Button
            variant="secondary"
            className="bg-gray-800 text-white hover:bg-gray-700"
            asChild
          >
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
