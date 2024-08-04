// app/projects/betterqr/page.js
"use client"; // This marks the component as a client component

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { remark } from "remark";
import remarkHtml from "remark-html";

export default function BetterQR() {
  const [readme, setReadme] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const project = {
    id: "betterqr",
    title: "BetterQR",
    description:
      "The best QR managing service with various features, all for free.",
    imgSrc: "/images/project-betterqr.svg",
    tags: ["Python", "Flask", "Tailwind CSS"],
    githubUrl: "https://github.com/Lagden-Development/betterqr",
    webUrl: "https://betterqr.com",
    readmeUrl:
      "https://raw.githubusercontent.com/Lagden-Development/betterqr/main/README.md",
  };

  useEffect(() => {
    fetch(project.readmeUrl)
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
  }, [project.readmeUrl]);

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
              <span
                key={index}
                className="inline-block bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded mr-2 mb-2"
              >
                {tag}
              </span>
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
          <Link href="/projects">
            <p className="text-blue-500 hover:underline mb-4 inline-block">
              &larr; Back to All Projects
            </p>
          </Link>
          <hr className="border-gray-800 border-t-2 mb-4" />
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div
                style={{
                  border: "2px solid transparent",
                  borderTop: "2px solid white",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  animation: "spin 0.5s linear infinite",
                }}
              ></div>
              <style jsx>{`
                @keyframes spin {
                  0% {
                    transform: rotate(0deg);
                  }
                  100% {
                    transform: rotate(360deg);
                  }
                }
              `}</style>
            </div>
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
