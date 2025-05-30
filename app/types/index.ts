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
    status: 'operational' | 'degraded' | 'down' | 'maintenance' | 'unknown';
    last_checked_at: string;
    monitor_url: string;
    uptime_percentage?: number;
    response_time?: number;
    total_downtime?: number;
    incidents_count?: number;
    check_frequency?: number;
  };
  better_stack_status_id?: string;
  is_featured: boolean;
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
