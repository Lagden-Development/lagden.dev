"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "../../../components/LoadingSpinner";
import CommitModal from "../../../components/CommitModal";
import projects from "../../../../public/projects.json";

type Commit = {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author: {
    login: string;
    html_url: string;
  };
};

const CommitsPage = () => {
  const params = useParams();
  const projectId = params?.projectId;
  const [commits, setCommits] = useState<Commit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null);
  const [projectName, setProjectName] = useState<string>("");
  const [owner, setOwner] = useState<string>("");
  const [repo, setRepo] = useState<string>("");

  useEffect(() => {
    console.log("useEffect called");

    if (!projectId) {
      console.log("No projectId");
      return;
    }

    console.log("Params:", params);
    console.log("Project ID:", projectId);

    const project = projects.find((project) => project.id === projectId);
    if (!project) {
      console.log("Project not found for ID:", projectId);
      setError("Invalid project ID");
      setIsLoading(false);
      return;
    }

    console.log("Project found:", project);

    const projectName = project.title;
    console.log("Project name:", projectName);
    setProjectName(projectName);

    const repoUrl = project.githubUrl;
    const repoNameMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!repoNameMatch) {
      setError("Invalid GitHub URL");
      setIsLoading(false);
      return;
    }

    const fetchedOwner = repoNameMatch[1];
    const fetchedRepo = repoNameMatch[2];

    setOwner(fetchedOwner);
    setRepo(fetchedRepo);

    console.log("Owner:", fetchedOwner);
    console.log("Repo:", fetchedRepo);

    const fetchCommits = async () => {
      try {
        console.log("Fetching commits for", fetchedOwner, fetchedRepo);
        const response = await axios.get<Commit[]>("/api/get-commits", {
          params: {
            owner: fetchedOwner,
            repo: fetchedRepo,
          },
        });
        console.log("Commits fetched:", response.data);
        setCommits(response.data);
        setIsLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setIsLoading(false);
      }
    };

    fetchCommits();
  }, [projectId, params]); // Added `params` to the dependency array

  const handleCommitClick = (commit: Commit) => {
    setSelectedCommit(commit);
  };

  const handleCloseModal = () => {
    setSelectedCommit(null);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex justify-center">
      <div className="max-w-4xl w-full text-center px-4">
        <section className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Commit Updates</h1>
          <p className="text-lg">
            Latest commits to the {projectName} repository.
          </p>
          <Link href={`/projects/${projectId}`}>
            <p className="text-gray-400 mt-4 cursor-pointer hover:underline">
              Go back to {projectName}
            </p>
          </Link>
        </section>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <section className="mb-8">
            <div className="grid grid-cols-1 gap-6">
              {commits.map((commit) => (
                <div
                  key={commit.sha}
                  className="border border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-800"
                  onClick={() => handleCommitClick(commit)}
                >
                  <p className="text-xl font-bold">
                    {commit.commit.message.length > 50
                      ? `${commit.commit.message.substring(0, 50)}...`
                      : commit.commit.message}
                  </p>
                  <p className="text-gray-400">
                    <Link
                      href={`https://github.com/${owner}/${repo}/commit/${commit.sha}`}
                      target="_blank"
                      className="underline"
                    >
                      {commit.sha.substring(0, 7)}
                    </Link>
                    {" - "}
                    <a
                      href={commit.author.html_url}
                      target="_blank"
                      className="underline"
                    >
                      {commit.commit.author.name}
                    </a>
                    {" - "}
                    {new Date(commit.commit.author.date).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {selectedCommit && (
          <CommitModal
            commit={selectedCommit}
            owner={owner}
            repo={repo}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
};

export default CommitsPage;
