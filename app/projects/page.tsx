// app/projects/page.tsx
'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

interface Project {
  title: string;
  slug: string;
  description: string;
  tags: string[];
  github_repo_url: string;
  website_url: string;
  project_readme: Record<string, any>;
  picture_url: string;
  better_stack_status_id: string;
  is_featured: boolean;
}

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

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await fetch(`${baseUrl}/ldev-cms/projects`);
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        setProjects(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading projects:', error);
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const ProjectCard = ({ project }: { project: Project }) => (
    <Link
      href={`/projects/${project.slug}`}
      className="transition-transform duration-200 hover:scale-105"
    >
      <Card className="h-full border-gray-800 bg-black">
        <CardContent className="p-6">
          <div className="mb-4 flex h-40 items-center justify-center">
            <Image
              src={ensureHttps(project.picture_url)}
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
          {project.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <section className="mb-12 space-y-4 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-white">
            Our Projects
          </h1>
          <p className="text-xl text-white">
            Here you can find a list of our current and past projects.
          </p>
        </section>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
