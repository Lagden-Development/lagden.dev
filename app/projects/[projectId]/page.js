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
  const [status, setStatus] = useState(null);
  const [statusDetails, setStatusDetails] = useState({});
  const [averageResponseTime, setAverageResponseTime] = useState(null);

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

            if (foundProject.statusId) {
              fetchProjectStatus(foundProject.statusId);
              const interval = setInterval(() => {
                fetchProjectStatus(foundProject.statusId);
              }, 30000); // 30 seconds

              return () => clearInterval(interval); // Cleanup interval on component unmount
            }
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

  const fetchProjectStatus = (statusId) => {
    fetch(`/api/project-status?statusId=${statusId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status) {
          setStatus(data.status);
          setStatusDetails(data);
          const responseTimes =
            data.response_times.data.attributes.regions.flatMap((region) =>
              region.response_times.map((rt) => rt.response_time)
            );
          const avgResponseTime = (
            responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
          ).toFixed(2);
          setAverageResponseTime(avgResponseTime);
        }
      })
      .catch((err) => {
        console.error("Error fetching project status: ", err);
      });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isNotFound) {
    return <ProjectNotFound />;
  }

  const statusIndicator = status ? (
    <div className="relative flex items-center ml-4">
      <div className="relative group">
        <span
          className={`inline-block w-6 h-6 mr-2 rounded-full ${
            status === "up"
              ? "bg-green-500"
              : status === "down"
              ? "bg-red-500"
              : status === "validating"
              ? "bg-yellow-500"
              : ""
          }`}
          style={{
            animation: "waves 1.5s ease-in-out infinite",
          }}
        ></span>
        <div
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 text-xs text-center text-white bg-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ zIndex: 10 }}
        >
          {status === "up" ? (
            <>
              <div>
                <strong>Status:</strong>{" "}
                {statusDetails.status[0]
                  .toUpperCase()
                  .concat(statusDetails.status.slice(1))}
              </div>
              <div>
                <strong>Last Checked:</strong>{" "}
                {new Date(statusDetails.last_checked_at).toLocaleString()}
              </div>
              <div>
                <strong>Average Response Time:</strong> {averageResponseTime}{" "}
                seconds
              </div>
              <Link
                href="https://status.lagden.dev"
                className="mt-2 text-blue-500 hover:underline"
              >
                More Info
              </Link>
            </>
          ) : (
            <>
              <div>
                <strong>Status:</strong>{" "}
                {statusDetails.status[0]
                  .toUpperCase()
                  .concat(statusDetails.status.slice(1))}
              </div>
              <div>
                <strong>Last Checked:</strong>{" "}
                {new Date(statusDetails.last_checked_at).toLocaleString()}
              </div>
              <a
                href="https://status.lagden.dev"
                className="mt-2 text-blue-500 hover:underline"
                _target="blank"
              >
                More Info
              </a>
            </>
          )}
        </div>
      </div>
      <style jsx>{`
        @keyframes waves {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  ) : null;

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
          <div className="flex items-center">
            <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
            {statusIndicator}
          </div>
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
