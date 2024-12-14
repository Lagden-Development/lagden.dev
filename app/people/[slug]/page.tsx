// app/people/[slug]/page.tsx
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

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPerson(slug: string): Promise<Person | null> {
  try {
    const baseUrl = process.env.LAGDEN_DEV_API_BASE_URL;
    const apiKey = process.env.LAGDEN_DEV_API_KEY;

    const response = await fetch(
      `${baseUrl}/ldev-cms/people/${slug}?api_key=${apiKey}`,
      {
        next: { revalidate: 60 }, // Revalidate every minute
      }
    );

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch person');
    }

    const person: Person = await response.json();
    return person;
  } catch (error) {
    console.error('Error loading person:', error);
    return null;
  }
}

export default async function PersonPage({ params }: PageProps) {
  const resolvedParams = await params;
  const person = await getPerson(resolvedParams.slug);

  if (!person) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="mx-4 max-w-lg rounded-xl border border-gray-800/80 bg-black/50 p-8 text-center shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md">
          <h1 className="mb-4 bg-gradient-to-br from-white to-gray-400 bg-clip-text text-3xl font-bold text-transparent">
            Person Not Found
          </h1>
          <p className="mb-6 text-gray-400">
            The person you&apos;re looking for doesn&apos;t exist or has been
            moved.
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
        </Card>
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
          <Card className="border border-gray-800 border-gray-800/80 bg-black/50 shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md">
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
          <Card className="border border-gray-800 border-gray-800/80 bg-black/50 shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md">
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
                  __html: documentToHtmlString(person.introduction as Document),
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
