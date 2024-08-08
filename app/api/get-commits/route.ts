import axios from "axios";
import { NextResponse } from "next/server";
import projects from "../../../public/projects.json";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  const project = projects.find((project: { githubUrl: string }) => {
    const repoNameMatch = project.githubUrl.match(
      /github\.com\/([^\/]+)\/([^\/]+)/
    );
    if (!repoNameMatch) return false;
    return repoNameMatch[1] === owner && repoNameMatch[2] === repo;
  });

  if (!owner || !repo || !project) {
    return new NextResponse(
      JSON.stringify({
        error: "Invalid owner, repo, or project not in whitelist",
      }),
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits`,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
      }
    );

    return new NextResponse(JSON.stringify(response.data), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: "Error fetching commits" }),
      { status: 500 }
    );
  }
}
