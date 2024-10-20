// app/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import LoadingSpinner from './components/LoadingSpinner';

interface Project {
  id: string;
  title: string;
  description: string;
  imgSrc: string;
  featured: boolean;
}

export default function Home() {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/projects.json')
      .then((res) => res.json())
      .then((projects: Project[]) => {
        const featured = projects.filter((project) => project.featured);
        setFeaturedProjects(featured);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error loading projects: ', err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-4xl px-4 text-center">
        <section className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">
            We are Lagden Development.
          </h1>
          <p className="text-lg">
            A small development group passionate about open-source.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-3xl font-bold">About Us</h2>
          <p className="text-lg">
            We specialize in web development, covering front-end technologies
            like React, NextJS, and Tailwind; back-end technologies like
            Node.js, Flask, and PHP; and databases like SQL and MongoDB. Our
            expertise includes Python, Discord.py, Flask, Tailwind, NextJS,
            React, PHP, Java (including Minecraft plugins), SQL, and MongoDB,
            enabling us to provide comprehensive web solutions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-3xl font-bold">Featured Projects</h2>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}?from=home`}
                  passHref
                >
                  <div className="flex h-full cursor-pointer flex-col justify-between rounded-lg border border-gray-700 p-4 hover:bg-gray-800">
                    <div>
                      <div className="mb-4 flex h-40 w-full items-center justify-center">
                        <Image
                          src={project.imgSrc}
                          alt={project.title}
                          width={160}
                          height={160}
                          className="rounded object-contain"
                        />
                      </div>
                      <h3 className="mb-2 text-2xl font-bold">
                        {project.title}
                      </h3>
                      <p className="text-gray-400">{project.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <Link href="/projects" passHref>
            <p className="mt-4 cursor-pointer text-gray-400 hover:underline">
              View all projects
            </p>
          </Link>
        </section>

        <section>
          <h2 className="mb-4 text-3xl font-bold">Contact Us</h2>
          <p className="mb-4 text-lg">
            Get in touch with us through Email or GitHub.
          </p>
          <div className="flex justify-center space-x-4">
            <a href="mailto:contact@lagden.dev" className="underline">
              Email
            </a>
            <a
              href="https://github.com/Lagden-Development"
              target="_blank"
              className="underline"
            >
              GitHub
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
