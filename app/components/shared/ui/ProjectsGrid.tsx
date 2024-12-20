import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ensureHttps } from '@/helpers';

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
  featuredOnly?: boolean;
  filterTags?: string[];
  fromPage?: string;
}

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

async function getProjects() {
  const apiKey = process.env.LAGDEN_DEV_API_KEY;
  const baseUrl = process.env.LAGDEN_DEV_API_BASE_URL;

  if (!apiKey || !baseUrl) {
    throw new Error('Missing required environment variables');
  }

  const response = await fetch(
    `${baseUrl}/ldev-cms/projects?api_key=${apiKey}`,
    {
      next: { revalidate: 3600 }, // Cache for 1 hour
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }

  return response.json();
}

const ProjectsGrid = async ({
  featuredOnly = false,
  filterTags = [],
  fromPage,
}: ProjectsGridProps) => {
  const projects = await getProjects();

  const filteredProjects = projects.filter((project: Project) => {
    if (featuredOnly && !project.is_featured) return false;
    if (filterTags.length > 0) {
      return filterTags.every((tag) => project.tags.includes(tag));
    }
    return true;
  });

  const getProjectUrl = (slug: string) => {
    const baseUrl = `/projects/${slug}`;
    return fromPage ? `${baseUrl}?from=${fromPage}` : baseUrl;
  };

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {filteredProjects.map((project: Project) => (
        <Link
          key={project.slug}
          href={getProjectUrl(project.slug)}
          className="group relative"
        >
          <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-violet-500/30 via-fuchsia-500/30 to-indigo-500/30 opacity-0 blur transition-all duration-300 group-hover:opacity-100" />
          <div className="relative h-[400px] overflow-hidden rounded-xl border border-gray-800/80 bg-black/50 shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-300 hover:border-violet-500/30 hover:shadow-[0_0_25px_rgba(124,58,237,0.2)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.1),transparent_50%)]" />
            <div className="relative flex h-full flex-col p-6">
              <div className="group/image relative mb-4 flex h-44 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-violet-500/5 via-fuchsia-500/5 to-indigo-500/5">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:14px_24px]" />
                <Image
                  src={ensureHttps(project.picture_url)}
                  alt={project.title}
                  width={180}
                  height={180}
                  className="relative z-10 object-contain transition-all duration-500 group-hover/image:scale-110"
                />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-white transition-colors duration-300 group-hover:text-violet-300">
                {truncateText(project.title, 50)}
              </h3>
              <p className="mb-4 line-clamp-2 flex-grow text-sm text-gray-400">
                {project.description}
              </p>
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
