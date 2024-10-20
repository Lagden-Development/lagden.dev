// app/people/page.tsx
'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import LoadingSpinner from '../components/LoadingSpinner';

interface Person {
  id: string;
  name: string;
  role: string;
  imgSrc: string;
}

export default function People() {
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/people.json')
      .then((res) => res.json())
      .then((data: Person[]) => {
        setPeople(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error loading people: ', err);
        setIsLoading(false);
      });
  }, []);

  const PersonCard = ({ person }: { person: Person }) => (
    <Link href={`/people/${person.id}`} passHref>
      <div className="flex h-full cursor-pointer flex-col justify-between rounded-lg border border-gray-700 p-4 hover:bg-gray-800">
        <div>
          <div className="mb-4 flex h-40 w-full items-center justify-center">
            <Image
              src={person.imgSrc}
              alt={person.name}
              width={160}
              height={160}
              className="rounded object-cover"
            />
          </div>
          <h2 className="mb-2 text-2xl font-bold">{person.name}</h2>
          <p className="text-gray-400">{person.role}</p>
        </div>
      </div>
    </Link>
  );

  const gridColsClass =
    people.length === 2
      ? 'sm:grid-cols-2 lg:grid-cols-2 justify-center'
      : 'sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-4xl px-4 text-center">
        <section className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">Our Team</h1>
          <p className="text-lg">
            Meet the dedicated professionals who make our organization great.
          </p>
        </section>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className={`grid grid-cols-1 ${gridColsClass} gap-6`}>
            {people.map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
