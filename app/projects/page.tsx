'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import LoadingSpinner from '../components/LoadingSpinner';

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
    <Link href={`/projects/${project.id}`} passHref>
      <div className="flex h-full cursor-pointer flex-col justify-between rounded-lg border border-gray-700 p-4 hover:bg-gray-800">
        <div>
          <div className="mb-4 flex h-40 w-full items-center justify-center">
            <Image
              src={project.imgSrc}
              alt={project.title}
              width={160}
              height={160}
              className="rounded object-cover"
            />
          </div>
          <h2 className="mb-2 text-2xl font-bold">{project.title}</h2>
          <p className="text-gray-400">{project.description}</p>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-4xl px-4 text-center">
        <section className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">Our Projects</h1>
          <p className="text-lg">
            Here you can find a list of our current and past projects.
          </p>
        </section>

        {isLoading ? (
          <LoadingSpinner />
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
