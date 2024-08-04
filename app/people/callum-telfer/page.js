// app/people/zach-lagden/page.js
"use client"; // This marks the component as a client component

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { remark } from "remark";
import remarkHtml from "remark-html";

export default function CallumTelfer() {
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const person = {
    id: "callum-telfer",
    name: "Callum Telfer",
    role: "Software Engineer",
    imgSrc: "/images/person-callum-telfer.png",
    skills: ["Skill", "Skill", "Skill", "Skill"],
    githubUrl: "https://github.com/VoidemLIVE",
    linkedinUrl: "https://www.linkedin.com/in/zach-lagden",
    webUrl: "https://callumtelfer.uk/",
    location: "Location",
    pronouns: "he/him",
    bioUrl:
      "https://raw.githubusercontent.com/Lagden-Development/profiles/main/callum-telfer.md",
  };

  useEffect(() => {
    fetch(person.bioUrl)
      .then((res) => res.text())
      .then((text) => {
        remark()
          .use(remarkHtml)
          .process(text)
          .then((file) => {
            setBio(String(file));
            setIsLoading(false);
          });
      });
  }, [person.bioUrl]);

  return (
    <div className="flex justify-center py-8">
      <div className="max-w-6xl w-full flex flex-col md:flex-row px-4">
        <div className="md:w-1/3 md:pr-8">
          <Image
            src={person.imgSrc}
            alt={person.name}
            width={400}
            height={400}
            className="object-cover rounded mb-4"
          />
          <h1 className="text-4xl font-bold mb-2">{person.name}</h1>
          <p className="text-lg mb-2">{person.role}</p>
          <p className="text-gray-500 mb-4">
            {person.location} <span className="mx-2">|</span> {person.pronouns}
          </p>
          <div className="mb-4">
            {person.skills.map((skill, index) => (
              <span
                key={index}
                className="inline-block bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded mr-2 mb-2"
              >
                {skill}
              </span>
            ))}
          </div>
          <div className="flex space-x-4 mb-4">
            {person.githubUrl && (
              <a
                href={person.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-nobel hover:text-white"
              >
                <i className="fab fa-github fa-2x"></i>
              </a>
            )}
            {person.linkedinUrl && (
              <a
                href={person.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-nobel hover:text-white"
              >
                <i className="fab fa-linkedin fa-2x"></i>
              </a>
            )}
            {person.webUrl && (
              <a
                href={person.webUrl}
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
          <Link href="/people">
            <p className="text-blue-500 hover:underline mb-4 inline-block">
              &larr; Back to All People
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
              dangerouslySetInnerHTML={{ __html: bio }}
              className="prose"
            ></div>
          )}
        </div>
      </div>
    </div>
  );
}
