// app/people/page.js

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function People() {
  const [people, setPeople] = useState([]);

  useEffect(() => {
    fetch("/people.json")
      .then((res) => res.json())
      .then((data) => setPeople(data))
      .catch((err) => console.error("Error loading people: ", err));
  }, []);

  const PersonCard = ({ person }) => (
    <Link href={`/people/${person.id}`} passHref>
      <div className="border border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-800 flex flex-col justify-between h-full">
        <div>
          <div className="w-full h-40 mb-4 flex items-center justify-center">
            <Image
              src={person.imgSrc}
              alt={person.name}
              width={160}
              height={160}
              className="object-cover rounded"
            />
          </div>
          <h2 className="text-2xl font-bold mb-2">{person.name}</h2>
          <p className="text-gray-400">{person.role}</p>
        </div>
      </div>
    </Link>
  );

  const gridColsClass =
    people.length === 2
      ? "sm:grid-cols-2 lg:grid-cols-2 justify-center"
      : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="flex justify-center">
      <div className="max-w-4xl w-full text-center px-4">
        <section className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Our Team</h1>
          <p className="text-lg">
            Meet the dedicated professionals who make our organization great.
          </p>
        </section>

        <div className={`grid grid-cols-1 ${gridColsClass} gap-6`}>
          {people.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      </div>
    </div>
  );
}
