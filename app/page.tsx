'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GithubIcon, Mail } from 'lucide-react';

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
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Hero Section */}
        <section className="mb-16 space-y-4 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-white">
            We are Lagden Development
          </h1>
          <p className="text-xl text-white">
            A small development group passionate about open-source.
          </p>
        </section>

        {/* About Section */}
        <Card className="mb-16 border-gray-800 bg-black">
          <CardHeader>
            <CardTitle className="text-3xl text-white">About Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed text-white">
              We are a collective of developers passionate about creating
              impactful solutions using open-source technologies. Our expertise
              spans front-end tools like React, Next.js, and Tailwind, alongside
              back-end frameworks such as Node.js, Flask, and PHP. With a strong
              foundation in languages like Python and Java, and databases like
              SQL and MongoDB, we contribute to a growing body of collaborative
              projects that benefit the broader developer community.
            </p>
          </CardContent>
        </Card>

        {/* Featured Projects Section */}
        <section className="mb-16">
          <h2 className="mb-8 text-3xl font-bold text-white">
            Featured Projects
          </h2>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}?from=home`}
                  className="transition-transform duration-200 hover:scale-105"
                >
                  <Card className="h-full border-gray-800 bg-black">
                    <CardContent className="p-6">
                      <div className="mb-4 flex h-40 items-center justify-center">
                        <Image
                          src={project.imgSrc}
                          alt={project.title}
                          width={160}
                          height={160}
                          className="rounded object-contain transition-opacity duration-200 hover:opacity-90"
                        />
                      </div>
                      <h3 className="mb-2 text-2xl font-bold text-white">
                        {project.title}
                      </h3>
                      <p className="text-gray-300">{project.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-8 text-center">
            <Button
              variant="secondary"
              className="bg-gray-800 text-white hover:bg-gray-700"
              asChild
            >
              <Link href="/projects">View all projects</Link>
            </Button>
          </div>
        </section>

        {/* Contact Section */}
        <Card className="border-gray-800 bg-black">
          <CardHeader>
            <CardTitle className="text-3xl text-white">Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-8 text-lg text-white">
              Get in touch with us through Email or GitHub.
            </p>
            <div className="flex justify-center space-x-6">
              <Button
                variant="secondary"
                className="bg-gray-800 text-white hover:bg-gray-700"
                asChild
              >
                <a href="mailto:contact@lagden.dev">
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </a>
              </Button>
              <Button
                variant="secondary"
                className="bg-gray-800 text-white hover:bg-gray-700"
                asChild
              >
                <a
                  href="https://github.com/Lagden-Development"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GithubIcon className="mr-2 h-4 w-4" />
                  GitHub
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
