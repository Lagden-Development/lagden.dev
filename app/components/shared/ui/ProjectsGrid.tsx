'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ensureHttps } from '@/helpers';
import { getProjectsClient } from '@/lib/api-client';
import PaginatedProjectGrid from '@/components/PaginatedProjectGrid';
import TiltCard from '@/components/TiltCard';
import StaggerContainer from '@/components/StaggerContainer';
import ProjectSkeleton from '@/components/skeletons/ProjectSkeleton';
import type { Project } from '@/types';

interface ProjectsGridProps {
  featuredOnly?: boolean;
  filterTags?: string[];
  fromPage?: string;
  enablePagination?: boolean;
  itemsPerPage?: number;
}

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

const ProjectsGrid = ({
  featuredOnly = false,
  filterTags = [],
  fromPage,
  enablePagination = false,
  itemsPerPage = 9,
}: ProjectsGridProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        console.log(
          '[ProjectsGrid] Fetching projects, featuredOnly:',
          featuredOnly
        );
        const fetchedProjects = await getProjectsClient(featuredOnly);
        console.log('[ProjectsGrid] Projects received:', fetchedProjects);
        console.log(
          '[ProjectsGrid] Number of projects:',
          fetchedProjects?.length || 0
        );
        setProjects(fetchedProjects);
        setError(null);
      } catch (err) {
        console.error('[ProjectsGrid] Error fetching projects:', err);
        setError('Failed to load projects');
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [featuredOnly]);

  if (loading) {
    return <ProjectSkeleton count={featuredOnly ? 3 : 6} />;
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h3 className="mb-2 text-xl font-semibold text-white">
            Failed to load projects
          </h3>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  const filteredProjects = projects.filter((project) => {
    if (filterTags.length > 0) {
      return filterTags.every((tag) => project.tags.includes(tag));
    }
    return true;
  });

  const getProjectUrl = (slug: string) => {
    const baseUrl = `/projects/${slug}`;
    return fromPage ? `${baseUrl}?from=${fromPage}` : baseUrl;
  };

  if (filteredProjects.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h3 className="mb-2 text-xl font-semibold text-white">
            No projects found
          </h3>
          <p className="text-gray-400">
            {filterTags.length > 0
              ? `No projects match the selected tags: ${filterTags.join(', ')}`
              : 'No projects are currently available.'}
          </p>
        </div>
      </div>
    );
  }

  // Project card component
  const ProjectCard = ({
    project,
    getProjectUrl,
    featuredOnly,
  }: {
    project: Project;
    getProjectUrl: (slug: string) => string;
    featuredOnly: boolean;
  }) => (
    <TiltCard key={project.slug} className="group relative h-[360px]">
      <Link
        href={getProjectUrl(project.slug)}
        className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        aria-label={`View ${project.title} project details`}
      >
        <div className="relative h-full overflow-hidden rounded-xl border border-gray-800/80 bg-black/50 shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-300 hover:border-violet-500/30 hover:shadow-[0_0_25px_rgba(124,58,237,0.2)]">
          <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-violet-500/30 via-fuchsia-500/30 to-indigo-500/30 opacity-0 blur transition-all duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.1),transparent_50%)]" />
          <div className="relative flex h-full flex-col p-6">
            <div className="group/image relative mb-4 flex h-44 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-violet-500/5 via-fuchsia-500/5 to-indigo-500/5">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:14px_24px]" />
              {ensureHttps(project.picture_url) ? (
                <Image
                  src={ensureHttps(project.picture_url)!}
                  alt={project.title}
                  width={180}
                  height={180}
                  className="relative z-10 object-contain transition-all duration-500 group-hover/image:scale-110"
                  loading={featuredOnly ? 'eager' : 'lazy'}
                  priority={featuredOnly}
                />
              ) : (
                <div className="relative z-10 flex h-full w-full items-center justify-center">
                  <div className="rounded-full bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-indigo-500/20 p-8">
                    <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30" />
                  </div>
                </div>
              )}
            </div>
            {/* Title - compact height */}
            <div className="mb-0 flex h-12 items-start">
              <h3 className="line-clamp-2 text-xl font-bold text-white transition-colors duration-300 group-hover:text-violet-300">
                {truncateText(project.title, 50)}
              </h3>
            </div>

            {/* Description - compact height */}
            <div className="mb-4 flex h-10 items-start">
              <p className="line-clamp-2 text-sm text-gray-400">
                {project.description}
              </p>
            </div>

            {/* Tags - fixed height area */}
            <div className="mt-auto flex h-7 items-start">
              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="relative rounded-full border border-violet-500/20 bg-violet-500/5 px-3 py-1 text-xs text-violet-300 transition-all duration-300 hover:border-violet-500/30 hover:bg-violet-500/10"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="relative rounded-full border border-violet-500/20 bg-violet-500/5 px-3 py-1 text-xs text-violet-300">
                      +{project.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="absolute right-4 top-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
              <ArrowUpRight className="h-5 w-5 text-violet-400" />
            </div>
          </div>
        </div>
      </Link>
    </TiltCard>
  );

  if (enablePagination) {
    return (
      <PaginatedProjectGrid
        projects={filteredProjects}
        itemsPerPage={itemsPerPage}
        fromPage={fromPage}
      />
    );
  }

  return (
    <StaggerContainer
      className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
      delay={80}
    >
      {filteredProjects.map((project) => (
        <ProjectCard
          key={project.slug}
          project={project}
          getProjectUrl={getProjectUrl}
          featuredOnly={featuredOnly}
        />
      ))}
    </StaggerContainer>
  );
};

export default ProjectsGrid;
