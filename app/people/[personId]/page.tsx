'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
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

interface Person {
  id: string;
  name: string;
  role: string;
  location: string;
  pronouns: string;
  imgSrc: string;
  bioUrl: string;
  skills: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  webUrl?: string;
}

export default function Person() {
  const pathname = usePathname();
  const personId = pathname.split('/').pop()?.toLowerCase();

  const [person, setPerson] = useState<Person | null>(null);
  const [bio, setBio] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);

  useEffect(() => {
    if (personId) {
      fetch('/people.json')
        .then((res) => res.json())
        .then((people: Person[]) => {
          const foundPerson = people.find(
            (p) => p.id.toLowerCase() === personId
          );
          if (foundPerson) {
            setPerson(foundPerson);

            fetch(foundPerson.bioUrl)
              .then((res) => res.text())
              .then((text) => {
                remark()
                  .use(remarkHtml)
                  .process(text)
                  .then((file) => {
                    setBio(String(file));
                    setIsLoading(false);
                  });
              });
          } else {
            setIsNotFound(true);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.error('Error loading person: ', err);
          setIsNotFound(true);
          setIsLoading(false);
        });
    }
  }, [personId]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <LoadingSpinner />
      </div>
    );
  }

  if (isNotFound) {
    return <PersonNotFound />;
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="mx-auto flex max-w-6xl flex-col px-4 text-white md:flex-row">
        <div className="md:w-1/3 md:pr-8">
          <Card className="border-gray-800 bg-black">
            <CardContent className="p-6">
              <Image
                src={person!.imgSrc}
                alt={person!.name}
                width={400}
                height={400}
                className="mb-6 rounded-lg object-cover"
                priority
              />
              <h1 className="mb-2 text-4xl font-bold text-white">
                {person!.name}
              </h1>

              <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2 text-gray-300">
                  <Briefcase className="h-4 w-4" />
                  {person!.role}
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="h-4 w-4" />
                  {person!.location}
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <User2 className="h-4 w-4" />
                  {person!.pronouns}
                </div>
              </div>

              <div className="mb-6 flex flex-wrap gap-2">
                {person!.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-block rounded bg-gray-800 px-3 py-1 text-sm text-white transition-colors hover:bg-gray-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                {person!.githubUrl && (
                  <Button
                    variant="secondary"
                    className="flex-auto bg-gray-800 text-white hover:bg-gray-700"
                    asChild
                  >
                    <a
                      href={person!.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="mr-2 h-4 w-4" />
                      GitHub
                    </a>
                  </Button>
                )}
                {person!.linkedinUrl && (
                  <Button
                    variant="secondary"
                    className="flex-auto bg-gray-800 text-white hover:bg-gray-700"
                    asChild
                  >
                    <a
                      href={person!.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Linkedin className="mr-2 h-4 w-4" />
                      LinkedIn
                    </a>
                  </Button>
                )}
                {person!.webUrl && (
                  <Button
                    variant="secondary"
                    className="flex-auto bg-gray-800 text-white hover:bg-gray-700"
                    asChild
                  >
                    <a
                      href={person!.webUrl}
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
              {isLoading ? (
                <div className="py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <div
                  dangerouslySetInnerHTML={{ __html: bio }}
                  className="prose prose-invert max-w-none pt-6"
                ></div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
