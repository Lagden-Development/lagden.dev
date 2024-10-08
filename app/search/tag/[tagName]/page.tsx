// app/search/tag/[tagName]/page.tsx
"use client";

import React from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import LoadingSpinner from "../../../components/LoadingSpinner";

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
  const tagName = decodeURIComponent(pathname.split("/").pop()!.toLowerCase());
  const fromProject = searchParams.get("fromProject");

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/projects.json")
      .then((res) => res.json())
      .then((data: Project[]) => {
        const filteredProjects = data.filter((project) =>
          project.tags.map((tag) => tag.toLowerCase()).includes(tagName)
        );
        setProjects(filteredProjects);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading projects: ", err);
        setIsLoading(false);
      });
  }, [tagName]);

  const ProjectCard = ({ project }: { project: Project }) => (
    <Link href={`/projects/${project.id}`} passHref>
      <div className="border border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-800 flex flex-col justify-between h-full">
        <div>
          <div className="w-full h-40 mb-4 flex items-center justify-center">
            <Image
              src={project.imgSrc}
              alt={project.title}
              width={160}
              height={160}
              className="object-cover rounded"
            />
          </div>
          <h2 className="text-2xl font-bold mb-2">{project.title}</h2>
          <p className="text-gray-400">{project.description}</p>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="flex justify-center">
      <div className="max-w-4xl w-full text-center px-4">
        <section className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Projects with Tag: {tagName}
          </h1>
          {fromProject && (
            <Link href={`/projects/${fromProject}`}>
              <p className="text-blue-500 hover:underline mb-4 inline-block">
                &larr; Back to {fromProject}
              </p>
            </Link>
          )}
        </section>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
