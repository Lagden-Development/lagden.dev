// app/page.js
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [featuredProjects, setFeaturedProjects] = useState([]);

  useEffect(() => {
    fetch("/projects.json")
      .then((res) => res.json())
      .then((projects) => {
        const featured = projects.filter((project) => project.featured);
        setFeaturedProjects(featured);
      })
      .catch((err) => console.error("Error loading projects: ", err));
  }, []);

  return (
    <div className="flex justify-center">
      <div className="max-w-4xl w-full text-center px-4">
        <section className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            We are Lagden Development.
          </h1>
          <p className="text-lg">
            A small development group passionate about open-source.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">About Us</h2>
          <p className="text-lg">
            We specialize in multiple kinds of web development, including
            front-end technologies like React, NextJS, and Tailwind; back-end
            technologies like Node.js, Flask, and PHP; and databases like SQL
            and MongoDB. Our team has expertise in Python, Discord.py, Flask,
            Tailwind, NextJS, React, PHP, Java (including Minecraft plugins),
            SQL, and MongoDB, allowing us to deliver comprehensive and robust
            web solutions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Featured Projects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`} passHref>
                <div className="border border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-800 flex flex-col justify-between h-full">
                  <div>
                    <div className="w-full h-40 mb-4 flex items-center justify-center">
                      <Image
                        src={project.imgSrc}
                        alt={project.title}
                        width={160}
                        height={160}
                        className="object-contain rounded"
                      />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
                    <p className="text-gray-400">{project.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Link href="/projects" passHref>
            <p className="text-gray-400 mt-4 cursor-pointer hover:underline">
              View all projects
            </p>
          </Link>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
          <p className="text-lg mb-4">
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
