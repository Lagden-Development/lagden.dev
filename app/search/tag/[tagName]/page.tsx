'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Tag } from 'lucide-react';
import LoadingSpinner from '../../../components/LoadingSpinner';

interface Project {
  id: string;
  title: string;
  description: string;
  imgSrc: string;
  tags: string[];
}

export default function TagSearch() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tagName = decodeURIComponent(pathname.split('/').pop()!.toLowerCase());
  const fromProject = searchParams.get('fromProject');

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/projects.json')
      .then((res) => res.json())
      .then((data: Project[]) => {
        const filteredProjects = data.filter((project) =>
          project.tags.map((tag) => tag.toLowerCase()).includes(tagName)
        );
        setProjects(filteredProjects);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error loading projects: ', err);
        setIsLoading(false);
      });
  }, [tagName]);

  const ProjectCard = ({ project }: { project: Project }) => (
    <Link
      href={`/projects/${project.id}`}
      className="transition-transform duration-200 hover:scale-105"
    >
      <Card className="h-full border-gray-800 bg-black">
        <CardContent className="p-6">
          <div className="mb-4 flex h-40 items-center justify-center">
            <Image
              src={project.imgSrc}
              alt={project.title}
              width={160}
              height={160}
              className="rounded object-contain transition-opacity duration-200 hover:opacity-90"
            />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white">
            {project.title}
          </h2>
          <p className="text-gray-300">{project.description}</p>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="mx-auto max-w-4xl px-4">
        <Card className="border-gray-800 bg-black">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-3 text-4xl font-bold text-white">
              <Tag className="h-8 w-8" />
              <span>Projects tagged: {tagName}</span>
            </CardTitle>

            {fromProject && (
              <Button
                variant="secondary"
                className="mt-4 bg-gray-800 text-white hover:bg-gray-700"
                asChild
              >
                <Link href={`/projects/${fromProject}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to {fromProject}
                </Link>
              </Button>
            )}
          </CardHeader>

          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center space-y-4 text-gray-300">
                <p className="text-lg">No projects found with this tag.</p>
                <Button
                  variant="secondary"
                  className="bg-gray-800 text-white hover:bg-gray-700"
                  asChild
                >
                  <Link href="/projects">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    View All Projects
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
