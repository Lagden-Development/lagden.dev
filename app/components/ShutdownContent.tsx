// components/ShutdownContent.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import LoadingSpinner from "../components/LoadingSpinner";

interface ShutdownProject {
  projectID: string;
  projectName: string;
  projectDescription: string;
  projectURL: string;
  shutdownDate: string;
  shutdownReason: string;
  githubRepo?: string; // Optional field
}

export default function ShutdownContent() {
  const [project, setProject] = useState<ShutdownProject | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  useEffect(() => {
    if (projectId) {
      fetch("/shutdown_projects.json")
        .then((res) => res.json())
        .then((projects: ShutdownProject[]) => {
          const foundProject = projects.find((p) => p.projectID === projectId);
          if (foundProject) {
            setProject(foundProject);
          } else {
            setError("Project not found.");
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error loading shutdown projects: ", err);
          setError("Failed to load shutdown project data.");
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [projectId]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (project) {
    return (
      <div className="max-w-4xl mx-auto text-center px-4">
        <h1 className="text-4xl font-bold mb-4">
          {project.projectName} has been shut down.
        </h1>
        <p className="text-lg">
          Sorry, this project has been shut down. If you have any questions,
          please{" "}
          <a
            href="mailto:contact@lagden.dev"
            className="text-blue-500 underline"
          >
            contact us
          </a>
          .
        </p>
        <br />
        <p>
          Confused? You have been redirected to https://lagden.dev/ because the
          website you were just on ({project.projectURL}) has been shut down by
          one of our members. You are now on the lagden.dev website. We are a
          small group of developers who work on various projects. If you have
          any questions, please{" "}
          <a
            href="mailto:contact@lagden.dev"
            className="text-blue-500 underline"
          >
            contact us
          </a>
          .
        </p>
        <br />
        <p className="text-md text-gray-500 mb-4">
          <strong>Project Name:</strong> {project.projectName}
          <br />
          <strong>Project Description:</strong> {project.projectDescription}
          <br />
          <strong>Project URL:</strong> {project.projectURL}
          <br />
          {project.githubRepo && (
            <>
              <strong>GitHub Repository:</strong>{" "}
              <a
                href={project.githubRepo}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-700"
              >
                {project.githubRepo.replace("https://github.com/", "")}
              </a>
              <br />
            </>
          )}
          <strong>Shutdown Date:</strong> {project.shutdownDate}
          <br />
          <strong>Reason:</strong> {project.shutdownReason}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto text-center px-4">
      <h1 className="text-4xl font-bold mb-4">
        This project has been shut down.
      </h1>
      <p className="text-lg">
        Sorry, this project has been shut down. If you have any questions,
        please{" "}
        <a href="mailto:contact@lagden.dev" className="text-blue-500 underline">
          contact us
        </a>
        .
      </p>
      <br />
      <p>
        Confused? You have been redirected to https://lagden.dev/ because the
        website you were just on has been shut down by one of our members. You
        are now on the lagden.dev website. We are a small group of developers
        who work on various projects. If you have any questions, please{" "}
        <a href="mailto:contact@lagden.dev" className="text-blue-500 underline">
          contact us
        </a>
        .
      </p>
    </div>
  );
}
