'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

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

interface ProjectsGridProps {
  projects: Project[];
  isLoading?: boolean;
  featuredOnly?: boolean;
  filterTags?: string[];
  fromPage?: string;
}

const ensureHttps = (url: string) => {
  if (url.startsWith('//')) return `https:${url}`;
  if (!url.startsWith('http')) return `https://${url}`;
  return url;
};

const ProjectsGrid = ({
  projects,
  isLoading = false,
  featuredOnly = false,
  filterTags = [],
  fromPage = 'home',
}: ProjectsGridProps) => {
  // Filter projects based on props
  const filteredProjects = projects.filter((project) => {
    // Apply featured filter if specified
    if (featuredOnly && !project.is_featured) return false;

    // Apply tag filter if specified
    if (filterTags.length > 0) {
      return filterTags.every((tag) => project.tags.includes(tag));
    }

    return true;
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          <div className="absolute inset-0 h-12 w-12 animate-pulse rounded-full border-2 border-violet-500 opacity-20" />
          <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border-2 border-violet-500 opacity-10" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {filteredProjects.map((project, index) => (
        <Link
          key={project.slug}
          href={`/projects/${project.slug}?from=${fromPage}`}
          className="group relative"
          style={{
            transform: `translateY(${Math.sin(index * 200 * 0.002) * 10}px)`,
          }}
        >
          <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-violet-500/30 via-fuchsia-500/30 to-indigo-500/30 opacity-0 blur transition-all duration-300 group-hover:opacity-100" />
          <div className="relative overflow-hidden rounded-xl border border-gray-800/80 bg-black/50 shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-300 hover:border-violet-500/30 hover:shadow-[0_0_25px_rgba(124,58,237,0.2)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.1),transparent_50%)]" />
            <div className="relative p-6">
              <div className="group/image relative mb-6 flex h-48 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-violet-500/5 via-fuchsia-500/5 to-indigo-500/5">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:14px_24px]" />
                <Image
                  src={ensureHttps(project.picture_url)}
                  alt={project.title}
                  width={200}
                  height={200}
                  className="relative z-10 object-contain transition-all duration-500 group-hover/image:scale-110"
                />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-white transition-colors duration-300 group-hover:text-violet-300">
                {project.title}
              </h3>
              <p className="mb-4 text-gray-400">{project.description}</p>
              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="relative rounded-full border border-violet-500/20 bg-violet-500/5 px-3 py-1 text-sm text-violet-300 transition-all duration-300 hover:border-violet-500/30 hover:bg-violet-500/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="absolute right-4 top-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <ArrowUpRight className="h-5 w-5 text-violet-400" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProjectsGrid;
