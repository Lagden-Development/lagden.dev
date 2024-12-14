import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Person } from '@/types';
import { ensureHttps } from '@/helpers';

interface PeopleGridProps {
  filterSkills?: string[];
  fromPage?: string;
}

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

async function getPeople() {
  const apiKey = process.env.LAGDEN_DEV_API_KEY;
  const baseUrl = process.env.LAGDEN_DEV_API_BASE_URL;

  if (!apiKey || !baseUrl) {
    throw new Error('Missing required environment variables');
  }

  const response = await fetch(`${baseUrl}/ldev-cms/people?api_key=${apiKey}`, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error('Failed to fetch people');
  }

  return response.json();
}

const PeopleGrid = async ({ filterSkills = [], fromPage }: PeopleGridProps) => {
  const people = await getPeople();

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
    <div className={gridClasses}>
      {filteredPeople.map((person: Person) => (
        <Link
          key={person.slug}
          href={getPersonUrl(person.slug)}
          className="group relative"
        >
          <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-violet-500/30 via-fuchsia-500/30 to-indigo-500/30 opacity-0 blur transition-all duration-300 group-hover:opacity-100" />
          <div className="relative h-[400px] overflow-hidden rounded-xl border border-gray-800/80 bg-black/50 shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-300 hover:border-violet-500/30 hover:shadow-[0_0_25px_rgba(124,58,237,0.2)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.1),transparent_50%)]" />
            <div className="relative flex h-full flex-col p-6">
              <div className="group/image relative mb-4 flex h-44 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-violet-500/5 via-fuchsia-500/5 to-indigo-500/5">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:14px_24px]" />
                <Image
                  src={ensureHttps(person.picture_url)}
                  alt={person.name}
                  width={180}
                  height={180}
                  className="relative z-10 object-cover transition-all duration-500 group-hover/image:scale-110"
                />
              </div>
              <h3 className="mb-1 text-2xl font-bold text-white transition-colors duration-300 group-hover:text-violet-300">
                {truncateText(person.name, 50)}
              </h3>
              <p className="mb-2 text-sm text-violet-300">{person.pronouns}</p>
              <p className="mb-1 text-sm text-gray-400">{person.occupation}</p>
              <p className="mb-4 text-sm text-gray-400">{person.location}</p>
              {person.skills.length > 0 && (
                <div className="mt-auto flex flex-wrap gap-2">
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
            <div className="absolute right-4 top-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <ArrowUpRight className="h-5 w-5 text-violet-400" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default PeopleGrid;
