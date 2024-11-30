// app/people/[slug]/page.tsx
'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import LoadingSpinner from '../../components/LoadingSpinner';
import PersonNotFound from '../../components/PersonNotFound';

import { Document } from '@contentful/rich-text-types';

interface Person {
  name: string;
  slug: string;
  occupation: string;
  location: string;
  pronouns: string;
  skills: string[];
  links: {
    url: string;
    name: string;
  }[];
  introduction: Document;
  picture_url: string;
}

// Helper function to ensure image URLs have https protocol
const ensureHttps = (url: string) => {
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  if (!url.startsWith('http')) {
    return `https://${url}`;
  }
  return url;
};

export default function Person() {
  const pathname = usePathname();
  const personSlug = pathname.split('/').pop()?.toLowerCase();

  const [person, setPerson] = useState<Person | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);

  useEffect(() => {
    const fetchPerson = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await fetch(`${baseUrl}/ldev-cms/people`);
        if (!response.ok) {
          throw new Error('Failed to fetch people');
        }

        const people: Person[] = await response.json();
        const foundPerson = people.find(
          (p) => p.slug.toLowerCase() === personSlug
        );

        if (foundPerson) {
          setPerson(foundPerson);
        } else {
          setIsNotFound(true);
        }
      } catch (error) {
        console.error('Error loading person:', error);
        setIsNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (personSlug) {
      fetchPerson();
    }
  }, [personSlug]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <LoadingSpinner />
      </div>
    );
  }

  if (isNotFound || !person) {
    return <PersonNotFound />;
  }

  // Helper function to find links by name
  const getLink = (name: string) =>
    person.links.find((link) => link.name.toLowerCase() === name.toLowerCase());
  const githubLink = getLink('github');
  const linkedinLink = getLink('linkedin');
  const websiteLink = getLink('website');

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="mx-auto flex max-w-6xl flex-col px-4 text-white md:flex-row">
        <div className="md:w-1/3 md:pr-8">
          <Card className="border-gray-800 bg-black">
            <CardContent className="p-6">
              <Image
                src={ensureHttps(person.picture_url)}
                alt={person.name}
                width={400}
                height={400}
                className="mb-6 rounded-lg object-cover"
                priority
              />
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
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 md:mt-0 md:w-2/3 md:pl-8">
          <Card className="border-gray-800 bg-black">
            <CardHeader>
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
            </CardHeader>
            <CardContent>
              <div className="border-t-2 border-gray-800"></div>
              <div
                dangerouslySetInnerHTML={{
                  __html: documentToHtmlString(person.introduction),
                }}
                className="prose prose-invert max-w-none pt-6"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
