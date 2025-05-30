'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { Document } from '@contentful/rich-text-types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Github,
  Globe,
  Linkedin,
  MapPin,
  User2,
  ArrowLeft,
  Briefcase,
} from 'lucide-react';
import type { Person } from '@/types';
import { ensureHttps } from '@/helpers';
import { getPersonClient } from '@/lib/api-client';
import PersonDetailSkeleton from '@/components/skeletons/PersonDetailSkeleton';

export default function PersonPage() {
  const params = useParams();
  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const slug = params.slug as string;

  useEffect(() => {
    const fetchPerson = async () => {
      try {
        setLoading(true);
        console.log(`[PersonPage] Fetching person: ${slug}`);
        const fetchedPerson = await getPersonClient(slug);
        setPerson(fetchedPerson);
        setError(null);
      } catch (err) {
        console.error(`[PersonPage] Error fetching person:`, err);
        setError('Failed to load person');
        setPerson(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPerson();
    }
  }, [slug]);

  if (loading) {
    return <PersonDetailSkeleton />;
  }

  if (error || !person) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="relative mx-4 max-w-lg overflow-hidden rounded-xl border border-gray-800/80 bg-black/50 p-8 text-center shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md">
          <h1 className="mb-4 bg-gradient-to-br from-white to-gray-400 bg-clip-text text-3xl font-bold text-transparent">
            {error ? 'Error Loading Person' : 'Person Not Found'}
          </h1>
          <p className="mb-6 text-gray-400">
            {error ||
              "The person you're looking for doesn't exist or has been moved."}
          </p>
          <Button
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 px-6 py-2 text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]"
            asChild
          >
            <Link href="/people" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              Back to People
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Helper function to find links by name
  const getLink = (name: string) =>
    person.links.find((link) => link.name.toLowerCase() === name.toLowerCase());
  const githubLink = getLink('github');
  const linkedinLink = getLink('linkedin');
  const websiteLink = getLink('website');

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto flex max-w-6xl flex-col px-4 text-white md:flex-row">
        <div className="md:w-1/3 md:pr-8">
          <div className="relative overflow-hidden rounded-xl border border-gray-800/80 bg-black/50 shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md">
            <div className="p-6">
              {ensureHttps(person.picture_url) ? (
                <Image
                  src={ensureHttps(person.picture_url)!}
                  alt={person.name}
                  width={400}
                  height={400}
                  className="mb-6 rounded-lg object-cover"
                  priority
                />
              ) : (
                <div className="mb-6 flex h-96 w-full items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/5 via-fuchsia-500/5 to-indigo-500/5">
                  <div className="rounded-full bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-indigo-500/20 p-12">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30" />
                  </div>
                </div>
              )}
              <h1 className="mb-2 text-4xl font-bold text-white">
                {person.name}
              </h1>

              <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2 text-gray-300">
                  <Briefcase className="h-4 w-4" />
                  {person.occupation}
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="h-4 w-4" />
                  {person.location}
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <User2 className="h-4 w-4" />
                  {person.pronouns}
                </div>
              </div>

              <div className="mb-6 flex flex-wrap gap-2">
                {person.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-block rounded bg-gray-800 px-3 py-1 text-sm text-white transition-colors hover:bg-gray-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                {githubLink && (
                  <Button
                    variant="secondary"
                    className="flex-auto bg-gray-800 text-white hover:bg-gray-700"
                    asChild
                  >
                    <a
                      href={githubLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="mr-2 h-4 w-4" />
                      GitHub
                    </a>
                  </Button>
                )}
                {linkedinLink && (
                  <Button
                    variant="secondary"
                    className="flex-auto bg-gray-800 text-white hover:bg-gray-700"
                    asChild
                  >
                    <a
                      href={linkedinLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Linkedin className="mr-2 h-4 w-4" />
                      LinkedIn
                    </a>
                  </Button>
                )}
                {websiteLink && (
                  <Button
                    variant="secondary"
                    className="flex-auto bg-gray-800 text-white hover:bg-gray-700"
                    asChild
                  >
                    <a
                      href={websiteLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      Website
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 md:mt-0 md:w-2/3 md:pl-8">
          <div className="relative overflow-hidden rounded-xl border border-gray-800/80 bg-black/50 shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="secondary"
                  className="bg-gray-800 text-white hover:bg-gray-700"
                  asChild
                >
                  <Link href="/people">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to All People
                  </Link>
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="border-t-2 border-gray-800"></div>
              <div
                dangerouslySetInnerHTML={{
                  __html: documentToHtmlString(person.introduction as Document),
                }}
                className="prose prose-invert max-w-none pt-6"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
