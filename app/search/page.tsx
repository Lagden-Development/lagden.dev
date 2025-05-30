'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import { getProjectsClient, getPeopleClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Project, Person } from '@/types';

function SearchContent() {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialQuery = searchParams.get('q') || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [fetchedProjects, fetchedPeople] = await Promise.all([
          getProjectsClient(),
          getPeopleClient(),
        ]);
        setProjects(fetchedProjects);
        setPeople(fetchedPeople);
        setError(null);
      } catch (err) {
        console.error('[SearchPage] Error fetching data:', err);
        setError('Failed to load search data');
        setProjects([]);
        setPeople([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="relative min-h-screen py-12">
        <div className="mb-8 animate-pulse">
          <div className="mb-4 h-4 w-24 rounded bg-gray-800"></div>
          <div className="mb-4 h-12 w-64 rounded bg-gray-800"></div>
          <div className="h-6 w-96 rounded bg-gray-800"></div>
        </div>

        <div className="mb-12">
          <div className="h-12 w-full max-w-2xl rounded-full bg-gray-800"></div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-xl bg-gray-800"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h3 className="mb-2 text-xl font-semibold text-white">
            Failed to load search data
          </h3>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center text-gray-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <h1 className="mb-4 bg-gradient-to-br from-white via-white to-violet-200 bg-clip-text text-5xl font-bold tracking-tight text-transparent">
          Search
        </h1>
        <p className="text-xl text-gray-400">
          Find projects, people, and content across Lagden Development
        </p>
      </div>

      {/* Search Interface */}
      <div className="mb-12">
        <SearchBar
          projects={projects}
          people={people}
          placeholder="Search projects and people..."
          showFilters={true}
          initialQuery={initialQuery}
        />
      </div>

      {/* Search Tips */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-gray-800 bg-black/50 p-6 backdrop-blur-md">
          <h3 className="mb-3 text-lg font-semibold text-white">Search Tips</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• Use specific keywords for better results</li>
            <li>• Filter by content type or tags</li>
            <li>• Search by technology, skill, or project name</li>
            <li>• Try partial matches for broader results</li>
          </ul>
        </Card>

        <Card className="border-gray-800 bg-black/50 p-6 backdrop-blur-md">
          <h3 className="mb-3 text-lg font-semibold text-white">
            What You Can Find
          </h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              • <strong>Projects:</strong> Open source repositories and tools
            </li>
            <li>
              • <strong>People:</strong> Team members and contributors
            </li>
            <li>
              • <strong>Technologies:</strong> Skills and frameworks used
            </li>
            <li>
              • <strong>Content:</strong> Descriptions and documentation
            </li>
          </ul>
        </Card>

        <Card className="border-gray-800 bg-black/50 p-6 backdrop-blur-md">
          <h3 className="mb-3 text-lg font-semibold text-white">
            Popular Searches
          </h3>
          <div className="space-y-2">
            {['React', 'TypeScript', 'Next.js', 'Open Source', 'API'].map(
              (term) => (
                <Link
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="block rounded-lg bg-gray-800/50 px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700/50 hover:text-white"
                >
                  {term}
                </Link>
              )
            )}
          </div>
        </Card>
      </div>

      {/* Browse Categories */}
      <div className="mt-16">
        <h2 className="mb-8 text-3xl font-bold text-white">
          Browse by Category
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Link href="/projects" className="group">
            <Card className="border-gray-800 bg-black/50 p-6 backdrop-blur-md transition-all duration-300 group-hover:border-violet-500/30 group-hover:bg-black/60">
              <h3 className="mb-2 text-xl font-semibold text-white group-hover:text-violet-300">
                All Projects
              </h3>
              <p className="text-gray-400">
                Browse all {projects.length} projects in our portfolio
              </p>
              <div className="mt-4 text-sm text-violet-400">
                View projects →
              </div>
            </Card>
          </Link>

          <Link href="/people" className="group">
            <Card className="border-gray-800 bg-black/50 p-6 backdrop-blur-md transition-all duration-300 group-hover:border-violet-500/30 group-hover:bg-black/60">
              <h3 className="mb-2 text-xl font-semibold text-white group-hover:text-violet-300">
                Team Members
              </h3>
              <p className="text-gray-400">
                Meet the {people.length} people behind our projects
              </p>
              <div className="mt-4 text-sm text-violet-400">View people →</div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-screen py-12">
          <div className="mb-8 animate-pulse">
            <div className="mb-4 h-4 w-24 rounded bg-gray-800"></div>
            <div className="mb-4 h-12 w-64 rounded bg-gray-800"></div>
            <div className="h-6 w-96 rounded bg-gray-800"></div>
          </div>

          <div className="mb-12">
            <div className="h-12 w-full max-w-2xl rounded-full bg-gray-800"></div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-xl bg-gray-800"
              ></div>
            ))}
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
