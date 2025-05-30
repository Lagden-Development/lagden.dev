'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Filter, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { trackSearch, trackFilter } from '@/lib/analytics';
import { getProjectsClient, getPeopleClient } from '@/lib/api-client';
import type { Project, Person } from '@/types';

interface SearchResult {
  type: 'project' | 'person';
  id: string;
  title: string;
  description: string;
  url: string;
  tags?: string[];
  relevanceScore: number;
}

interface SearchBarProps {
  projects?: Project[];
  people?: Person[];
  placeholder?: string;
  showFilters?: boolean;
  onResults?: (results: SearchResult[]) => void;
  initialQuery?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  projects: propProjects,
  people: propPeople,
  placeholder = 'Search projects and people...',
  showFilters = true,
  onResults,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [projects, setProjects] = useState<Project[]>(propProjects || []);
  const [people, setPeople] = useState<Person[]>(propPeople || []);
  const [dataLoading, setDataLoading] = useState(!propProjects && !propPeople);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastTrackedQuery = useRef<string>('');

  // Fetch data if not provided as props
  useEffect(() => {
    if (!propProjects && !propPeople) {
      const fetchData = async () => {
        try {
          setDataLoading(true);
          const [fetchedProjects, fetchedPeople] = await Promise.all([
            getProjectsClient(),
            getPeopleClient(),
          ]);
          setProjects(fetchedProjects);
          setPeople(fetchedPeople);
        } catch (error) {
          console.error('[SearchBar] Error fetching data:', error);
        } finally {
          setDataLoading(false);
        }
      };

      fetchData();
    }
  }, [propProjects, propPeople]);

  // Available filter options
  const filterOptions = React.useMemo(
    () => [
      { id: 'projects', label: 'Projects', type: 'content' },
      { id: 'people', label: 'People', type: 'content' },
      ...Array.from(new Set(projects.flatMap((p) => p.tags)))
        .map((tag) => ({
          id: tag,
          label: tag,
          type: 'tag',
        }))
        .slice(0, 10), // Limit to top 10 tags
    ],
    [projects]
  );

  // Search function with fuzzy matching and relevance scoring
  const searchContent = useCallback(
    (searchQuery: string): SearchResult[] => {
      if (!searchQuery.trim()) return [];

      const query = searchQuery.toLowerCase();
      const searchResults: SearchResult[] = [];

      // Search projects
      if (!selectedFilters.includes('people')) {
        projects.forEach((project) => {
          let score = 0;
          let matches = false;

          // Title match (highest weight)
          if (project.title.toLowerCase().includes(query)) {
            score += 100;
            matches = true;
          }

          // Description match
          if (project.description.toLowerCase().includes(query)) {
            score += 50;
            matches = true;
          }

          // Tag matches
          const tagMatches = project.tags.filter((tag) =>
            tag.toLowerCase().includes(query)
          );
          if (tagMatches.length > 0) {
            score += tagMatches.length * 30;
            matches = true;
          }

          // Slug match
          if (project.slug.toLowerCase().includes(query)) {
            score += 25;
            matches = true;
          }

          // Filter by selected tags
          if (selectedFilters.length > 0) {
            const tagFilters = selectedFilters.filter(
              (f) => filterOptions.find((opt) => opt.id === f)?.type === 'tag'
            );
            if (tagFilters.length > 0) {
              matches =
                matches &&
                tagFilters.some((filter) =>
                  project.tags.some(
                    (tag) => tag.toLowerCase() === filter.toLowerCase()
                  )
                );
            }
          }

          if (matches) {
            searchResults.push({
              type: 'project',
              id: project.slug,
              title: project.title,
              description: project.description,
              url: `/projects/${project.slug}`,
              tags: project.tags,
              relevanceScore: score,
            });
          }
        });
      }

      // Search people
      if (!selectedFilters.includes('projects')) {
        people.forEach((person) => {
          let score = 0;
          let matches = false;

          // Name match (highest weight)
          if (person.name.toLowerCase().includes(query)) {
            score += 100;
            matches = true;
          }

          // Occupation match
          if (person.occupation.toLowerCase().includes(query)) {
            score += 75;
            matches = true;
          }

          // Skills match
          const skillMatches = person.skills.filter((skill) =>
            skill.toLowerCase().includes(query)
          );
          if (skillMatches.length > 0) {
            score += skillMatches.length * 40;
            matches = true;
          }

          // Location match
          if (person.location.toLowerCase().includes(query)) {
            score += 30;
            matches = true;
          }

          // Slug match
          if (person.slug.toLowerCase().includes(query)) {
            score += 25;
            matches = true;
          }

          if (matches) {
            searchResults.push({
              type: 'person',
              id: person.slug,
              title: person.name,
              description: `${person.occupation} • ${person.location}`,
              url: `/people/${person.slug}`,
              tags: person.skills,
              relevanceScore: score,
            });
          }
        });
      }

      // Sort by relevance score
      return searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
    },
    [projects, people, selectedFilters, filterOptions]
  );

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const searchResults = searchContent(query);
      setResults(searchResults);
      onResults?.(searchResults);

      // Track search if query is not empty and hasn't been tracked yet
      if (query.trim() && query.trim() !== lastTrackedQuery.current) {
        lastTrackedQuery.current = query.trim();
        trackSearch({
          query: query.trim(),
          filters: selectedFilters,
          resultCount: searchResults.length,
          source: 'global',
        });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchContent, selectedFilters, onResults]);

  // Open search results if there's an initial query
  useEffect(() => {
    if (initialQuery) {
      setIsOpen(true);
    }
  }, [initialQuery]);

  // Handle filter changes
  const toggleFilter = (filterId: string) => {
    const newFilters = selectedFilters.includes(filterId)
      ? selectedFilters.filter((f) => f !== filterId)
      : [...selectedFilters, filterId];

    setSelectedFilters(newFilters);

    const filterOption = filterOptions.find((opt) => opt.id === filterId);
    if (filterOption) {
      trackFilter({
        filterType: filterOption.type as 'tag' | 'category',
        filterValue: filterId,
        resultCount: results.length,
        page: 'search',
      });
    }
  };

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowFilterMenu(false);
      }
    };

    if (isOpen || showFilterMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, showFilterMenu]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setShowFilterMenu(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search
            className="absolute left-4 h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={dataLoading ? 'Loading search data...' : placeholder}
            disabled={dataLoading}
            className="w-full rounded-full border border-gray-800 bg-black/50 py-3 pl-12 pr-20 text-white placeholder-gray-400 backdrop-blur-md transition-all duration-300 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Search projects and people"
            role="searchbox"
            aria-haspopup="listbox"
          />

          {/* Clear button */}
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                inputRef.current?.focus();
              }}
              className="absolute right-12 rounded-full p-1 text-gray-400 hover:text-white"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Filter button */}
          {showFilters && (
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`absolute right-4 rounded-full p-1 transition-colors ${
                selectedFilters.length > 0
                  ? 'text-violet-400 hover:text-violet-300'
                  : 'text-gray-400 hover:text-white'
              }`}
              aria-label="Toggle filters"
              aria-expanded={showFilterMenu}
            >
              <Filter className="h-4 w-4" />
              {selectedFilters.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-xs text-white">
                  {selectedFilters.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Active filters display */}
        {selectedFilters.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedFilters.map((filterId) => {
              const filter = filterOptions.find((opt) => opt.id === filterId);
              return filter ? (
                <span
                  key={filterId}
                  className="inline-flex items-center rounded-full bg-violet-500/20 px-3 py-1 text-xs text-violet-300"
                >
                  {filter.label}
                  <button
                    onClick={() => toggleFilter(filterId)}
                    className="ml-1 hover:text-white"
                    aria-label={`Remove ${filter.label} filter`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* Filter Menu */}
      {showFilterMenu && showFilters && (
        <Card className="absolute right-0 top-full z-50 mt-2 w-64 border-gray-800 bg-black/95 backdrop-blur-md">
          <div className="p-4">
            <h3 className="mb-3 text-sm font-semibold text-white">Filters</h3>
            <div className="space-y-2">
              {filterOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex cursor-pointer items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={selectedFilters.includes(option.id)}
                    onChange={() => toggleFilter(option.id)}
                    className="rounded border-gray-600 bg-gray-800 text-violet-500 focus:ring-violet-500"
                  />
                  <span className="text-sm text-gray-300">
                    {option.label}
                    {option.type === 'tag' && (
                      <span className="ml-1 text-xs text-gray-500">(tag)</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Search Results */}
      {isOpen && query && (
        <Card className="absolute top-full z-40 mt-2 w-full border-gray-800 bg-black/95 backdrop-blur-md">
          <div className="max-h-96 overflow-y-auto">
            {results.length > 0 ? (
              <div className="p-2">
                <div className="mb-2 px-3 py-1 text-xs text-gray-400">
                  {results.length} result{results.length !== 1 ? 's' : ''} found
                </div>
                {results.map((result) => (
                  <Link
                    key={`${result.type}-${result.id}`}
                    href={result.url}
                    className="group block rounded-lg p-3 transition-colors hover:bg-gray-800/50"
                    onClick={() => {
                      setIsOpen(false);
                      // Track result click
                      if (
                        typeof window !== 'undefined' &&
                        (window as any).gtag
                      ) {
                        (window as any).gtag('event', 'search_result_click', {
                          search_term: query,
                          result_type: result.type,
                          result_position: results.indexOf(result) + 1,
                        });
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              result.type === 'project'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-green-500/20 text-green-400'
                            }`}
                          >
                            {result.type}
                          </span>
                          <h4 className="font-medium text-white group-hover:text-violet-300">
                            {result.title}
                          </h4>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-gray-400">
                          {result.description}
                        </p>
                        {result.tags && result.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {result.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-gray-800 px-2 py-1 text-xs text-gray-300"
                              >
                                {tag}
                              </span>
                            ))}
                            {result.tags.length > 3 && (
                              <span className="rounded-full bg-gray-800 px-2 py-1 text-xs text-gray-300">
                                +{result.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <div className="mb-2 text-gray-400">No results found</div>
                <div className="text-sm text-gray-500">
                  Try adjusting your search terms or filters
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default SearchBar;
