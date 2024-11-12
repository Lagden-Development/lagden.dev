'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

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
    <Link
      href={`/people/${person.id}`}
      className="transition-transform duration-200 hover:scale-105"
    >
      <Card className="h-full border-gray-800 bg-black">
        <CardContent className="p-6">
          <div className="mb-4 flex h-40 items-center justify-center">
            <Image
              src={person.imgSrc}
              alt={person.name}
              width={160}
              height={160}
              className="rounded object-contain transition-opacity duration-200 hover:opacity-90"
            />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white">{person.name}</h2>
          <p className="text-gray-300">{person.role}</p>
        </CardContent>
      </Card>
    </Link>
  );

  const gridColsClass =
    people.length === 2
      ? 'sm:grid-cols-2 lg:grid-cols-2 justify-center'
      : 'sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <section className="mb-12 space-y-4 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-white">
            Our Team
          </h1>
          <p className="text-xl text-white">
            Meet the dedicated professionals who make our organization great.
          </p>
        </section>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
          </div>
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
