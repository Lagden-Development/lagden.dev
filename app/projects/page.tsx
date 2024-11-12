'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

interface Project {
  id: string;
  title: string;
  description: string;
  imgSrc: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/projects.json')
      .then((res) => res.json())
      .then((data: Project[]) => {
        setProjects(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error loading projects: ', err);
        setIsLoading(false);
      });
  }, []);

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
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
