'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Person } from '@/types';
import { ensureHttps } from '@/helpers';
import { getPeopleClient } from '@/lib/api-client';
import TiltCard from '@/components/TiltCard';
import StaggerContainer from '@/components/StaggerContainer';
import PeopleSkeleton from '@/components/skeletons/PeopleSkeleton';

interface PeopleGridProps {
  filterSkills?: string[];
  fromPage?: string;
}

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

const PeopleGrid = ({ filterSkills = [], fromPage }: PeopleGridProps) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        setLoading(true);
        console.log('[PeopleGrid] Fetching people');
        const fetchedPeople = await getPeopleClient();
        console.log('[PeopleGrid] People received:', fetchedPeople);
        setPeople(fetchedPeople);
        setError(null);
      } catch (err) {
        console.error('[PeopleGrid] Error fetching people:', err);
        setError('Failed to load people');
        setPeople([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPeople();
  }, []);

  if (loading) {
    return <PeopleSkeleton count={6} />;
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h3 className="mb-2 text-xl font-semibold text-white">
            Failed to load people
          </h3>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  const filteredPeople = people.filter((person: Person) => {
    if (filterSkills.length > 0) {
      return filterSkills.every((skill) => person.skills.includes(skill));
    }
    return true;
  });

  const getPersonUrl = (slug: string) => {
    const baseUrl = `/people/${slug}`;
    return fromPage ? `${baseUrl}?from=${fromPage}` : baseUrl;
  };

  // Determine grid classes based on number of people
  const gridClasses =
    filteredPeople.length <= 2
      ? 'grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto'
      : 'grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <StaggerContainer className={gridClasses} delay={90}>
      {filteredPeople.map((person: Person) => (
        <TiltCard key={person.slug} className="group relative h-[360px]">
          <Link href={getPersonUrl(person.slug)} className="block h-full">
            <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-violet-500/30 via-fuchsia-500/30 to-indigo-500/30 opacity-0 blur transition-all duration-300 group-hover:opacity-100" />
            <div className="relative h-full overflow-hidden rounded-xl border border-gray-800/80 bg-black/50 shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-300 hover:border-violet-500/30 hover:shadow-[0_0_25px_rgba(124,58,237,0.2)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.1),transparent_50%)]" />
              <div className="relative flex h-full flex-col p-6">
                {/* Image container */}
                <div className="group/image relative mb-4 flex h-44 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-violet-500/5 via-fuchsia-500/5 to-indigo-500/5">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:14px_24px]" />
                  {ensureHttps(person.picture_url) ? (
                    <Image
                      src={ensureHttps(person.picture_url)!}
                      alt={person.name}
                      width={180}
                      height={180}
                      className="relative z-10 rounded-lg object-cover transition-all duration-500 group-hover/image:scale-110"
                    />
                  ) : (
                    <div className="relative z-10 flex h-full w-full items-center justify-center">
                      <div className="rounded-full bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-indigo-500/20 p-8">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Content section with flex-grow */}
                <div className="flex flex-grow flex-col">
                  {/* Name */}
                  <h3 className="mb-2 text-xl font-bold text-white transition-colors duration-300 group-hover:text-violet-300">
                    {person.name}
                  </h3>

                  {/* Info section */}
                  <div className="mb-4 space-y-1">
                    <p className="text-sm text-violet-300">{person.pronouns}</p>
                    <p className="text-sm text-gray-400">{person.occupation}</p>
                    <p className="text-sm text-gray-400">{person.location}</p>
                  </div>

                  {/* Skills - push to bottom */}
                  <div className="mt-auto">
                    {person.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {person.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="relative rounded-full border border-violet-500/20 bg-violet-500/5 px-3 py-1 text-xs text-violet-300 transition-all duration-300 hover:border-violet-500/30 hover:bg-violet-500/10"
                          >
                            {skill}
                          </span>
                        ))}
                        {person.skills.length > 3 && (
                          <span className="relative rounded-full border border-violet-500/20 bg-violet-500/5 px-3 py-1 text-xs text-violet-300">
                            +{person.skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="absolute right-4 top-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <ArrowUpRight className="h-5 w-5 text-violet-400" />
              </div>
            </div>
          </Link>
        </TiltCard>
      ))}
    </StaggerContainer>
  );
};

export default PeopleGrid;
