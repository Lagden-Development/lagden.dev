// app/people/[personId]/page.tsx
'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import { usePathname } from 'next/navigation';
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
    return <LoadingSpinner />;
  }

  if (isNotFound) {
    return <PersonNotFound />;
  }

  return (
    <div className="flex justify-center py-8">
      <div className="flex w-full max-w-6xl flex-col px-4 md:flex-row">
        <div className="md:w-1/3 md:pr-8">
          <Image
            src={person!.imgSrc}
            alt={person!.name}
            width={400}
            height={400}
            className="mb-4 rounded object-cover"
          />
          <h1 className="mb-2 text-4xl font-bold">{person!.name}</h1>
          <p className="mb-2 text-lg">{person!.role}</p>
          <p className="mb-4 text-gray-500">
            {person!.location} <span className="mx-2">|</span>{' '}
            {person!.pronouns}
          </p>
          <div className="mb-4">
            {person!.skills.map((skill, index) => (
              <span
                key={index}
                className="mb-2 mr-2 inline-block rounded bg-gray-200 px-2 py-1 text-xs text-gray-800"
              >
                {skill}
              </span>
            ))}
          </div>
          <div className="mb-4 flex space-x-4">
            {person!.githubUrl && (
              <a
                href={person!.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-nobel hover:text-white"
              >
                <i className="fab fa-github fa-2x"></i>
              </a>
            )}
            {person!.linkedinUrl && (
              <a
                href={person!.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-nobel hover:text-white"
              >
                <i className="fab fa-linkedin fa-2x"></i>
              </a>
            )}
            {person!.webUrl && (
              <a
                href={person!.webUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-nobel hover:text-white"
              >
                <i className="fas fa-globe fa-2x"></i>
              </a>
            )}
          </div>
        </div>
        <div className="md:w-2/3 md:pl-8">
          <Link href="/people">
            <p className="mb-4 inline-block text-blue-500 hover:underline">
              &larr; Back to All People
            </p>
          </Link>
          <hr className="mb-4 border-t-2 border-gray-800" />
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div
              dangerouslySetInnerHTML={{ __html: bio }}
              className="prose"
            ></div>
          )}
        </div>
      </div>
    </div>
  );
}
