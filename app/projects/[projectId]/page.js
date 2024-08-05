// app/projects/[projectId]/page.js
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { remark } from "remark";
import remarkHtml from "remark-html";
import LoadingSpinner from "../../components/LoadingSpinner";
import ProjectNotFound from "../../components/ProjectNotFound";

export default function Project() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const projectId = pathname.split("/").pop()?.toLowerCase();
  const fromHome = searchParams.get("from") === "home";

  const [project, setProject] = useState(null);
  const [readme, setReadme] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetch("/projects.json")
        .then((res) => res.json())
        .then((projects) => {
          const foundProject = projects.find(
            (p) => p.id.toLowerCase() === projectId
          );
          if (foundProject) {
            setProject(foundProject);

            fetch(foundProject.readmeUrl)
              .then((res) => res.text())
              .then((text) => {
                remark()
                  .use(remarkHtml)
                  .process(text)
                  .then((file) => {
                    setReadme(String(file));
                    setIsLoading(false);
                  });
              });
          } else {
            setIsNotFound(true);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.error("Error loading project: ", err);
          setIsNotFound(true);
          setIsLoading(false);
        });
    }
  }, [projectId]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isNotFound) {
    return <ProjectNotFound />;
  }

  return (
    <div className="flex justify-center py-8">
      <div className="max-w-6xl w-full flex flex-col md:flex-row px-4">
        <div className="md:w-1/3 md:pr-8">
          <Image
            src={project.imgSrc}
            alt={project.title}
            width={400}
            height={400}
            className="object-cover rounded mb-4"
          />
          <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
          <p className="text-lg mb-4">{project.description}</p>
          <div className="mb-4">
            {project.tags.map((tag, index) => (
              <Link
                key={index}
                href={`/search/tag/${tag}?fromProject=${project.id}`}
                passHref
              >
                <span className="inline-block bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded mr-2 mb-2 cursor-pointer hover:bg-gray-300">
                  {tag}
                </span>
              </Link>
            ))}
          </div>
          <div className="flex space-x-4">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-nobel hover:text-white"
              >
                <i className="fab fa-github fa-2x"></i>
              </a>
            )}
            {project.webUrl && (
              <a
                href={project.webUrl}
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
          <div className="flex justify-between items-center mb-4">
            <Link href={fromHome ? "/" : "/projects"}>
              <p className="text-blue-500 hover:underline">
                &larr; {fromHome ? "Return to Home" : "Return to All Projects"}
              </p>
            </Link>
            {fromHome && (
              <Link href="/projects">
                <p className="text-blue-500 hover:underline">
                  View All Projects
                </p>
              </Link>
            )}
          </div>
          <hr className="border-gray-800 border-t-2 mb-4" />
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div
              dangerouslySetInnerHTML={{ __html: readme }}
              className="prose"
            ></div>
          )}
        </div>
      </div>
    </div>
  );
}
