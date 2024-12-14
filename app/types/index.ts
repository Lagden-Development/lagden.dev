export interface Person {
  name: string;
  slug: string;
  occupation: string;
  location: string;
  pronouns: string;
  skills: string[];
  links: {
    url: string;
    name: string;
  }[];
  introduction: Record<string, any>;
  picture_url: string;
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  picture_url: string;
  github_repo_url?: string;
  website_url?: string;
  tags: string[];
  project_readme: {
    nodeType: 'document';
    content: any[];
    data: {};
  };
  status?: {
    status: string;
    last_checked_at: string;
    url: string;
  };
}

export interface Commit {
  sha: string;
  message: string;
  author_name: string;
  author_email: string;
  date: string;
  url: string;
}

export interface CommitsResponse {
  project_title: string;
  repository_url: string;
  commits: Commit[];
}
