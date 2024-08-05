// app/projects/page.js

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Projects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch("/projects.json")
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error("Error loading projects: ", err));
  }, []);

  const ProjectCard = ({ project }) => (
    <Link href={`/projects/${project.id}`} passHref>
      <div className="border border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-800 flex flex-col justify-between h-full">
        <div>
          <div className="w-full h-40 mb-4 flex items-center justify-center">
            <Image
              src={project.imgSrc}
              alt={project.title}
              width={160}
              height={160}
              className="object-cover rounded"
            />
          </div>
          <h2 className="text-2xl font-bold mb-2">{project.title}</h2>
          <p className="text-gray-400">{project.description}</p>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="flex justify-center">
      <div className="max-w-4xl w-full text-center px-4">
        <section className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Our Projects</h1>
          <p className="text-lg">
            Here you can find a list of our current and past projects.
          </p>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}
