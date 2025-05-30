import Script from 'next/script';
import type { Project, Person } from '@/types';

interface OrganizationData {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  logo?: string;
  sameAs?: string[];
  founder?: {
    '@type': string;
    name: string;
  }[];
  knowsAbout?: string[];
}

interface ProjectData {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  creator: {
    '@type': string;
    name: string;
    url: string;
  };
  programmingLanguage?: string[];
  codeRepository?: string;
  applicationCategory?: string;
  operatingSystem?: string[];
  license?: string;
  keywords?: string[];
  dateCreated?: string;
  dateModified?: string;
}

interface PersonData {
  '@context': string;
  '@type': string;
  name: string;
  description?: string;
  url: string;
  image?: string;
  worksFor: {
    '@type': string;
    name: string;
    url: string;
  };
  knowsAbout?: string[];
  sameAs?: string[];
  jobTitle?: string;
  address?: {
    '@type': string;
    addressLocality: string;
  };
}

interface WebsiteData {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  publisher: {
    '@type': string;
    name: string;
  };
  potentialAction: {
    '@type': string;
    target: string;
    'query-input': string;
  };
  mainEntity: {
    '@type': string;
    name: string;
    description: string;
    url: string;
  };
}

// Organization structured data
export const OrganizationStructuredData = () => {
  const organizationData: OrganizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Lagden Development',
    description:
      'A small development group passionate about open-source software development.',
    url: 'https://lagden.dev',
    logo: 'https://i.lagden.dev/logo.png',
    sameAs: ['https://github.com/Lagden-Development'],
    founder: [
      {
        '@type': 'Person',
        name: 'Lagden Development Team',
      },
    ],
    knowsAbout: [
      'Software Development',
      'Open Source',
      'Web Development',
      'TypeScript',
      'React',
      'Next.js',
      'Node.js',
    ],
  };

  return (
    <Script
      id="organization-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(organizationData),
      }}
    />
  );
};

// Project structured data
export const ProjectStructuredData = ({ project }: { project: Project }) => {
  const projectData: ProjectData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: project.title,
    description: project.description,
    url: `https://lagden.dev/projects/${project.slug}`,
    creator: {
      '@type': 'Organization',
      name: 'Lagden Development',
      url: 'https://lagden.dev',
    },
    programmingLanguage: project.tags.filter((tag) =>
      [
        'TypeScript',
        'JavaScript',
        'Python',
        'Rust',
        'Go',
        'Java',
        'C++',
        'C#',
      ].includes(tag)
    ),
    codeRepository: project.github_repo_url,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: ['Windows', 'macOS', 'Linux'],
    license: 'https://opensource.org/licenses/MIT',
    keywords: project.tags,
  };

  return (
    <Script
      id="project-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(projectData),
      }}
    />
  );
};

// Person structured data
export const PersonStructuredData = ({ person }: { person: Person }) => {
  const personData: PersonData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    description: person.occupation,
    url: `https://lagden.dev/people/${person.slug}`,
    image: person.picture_url,
    worksFor: {
      '@type': 'Organization',
      name: 'Lagden Development',
      url: 'https://lagden.dev',
    },
    knowsAbout: person.skills,
    sameAs: person.links.map((link) => link.url),
    jobTitle: person.occupation,
    address: {
      '@type': 'PostalAddress',
      addressLocality: person.location,
    },
  };

  return (
    <Script
      id="person-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(personData),
      }}
    />
  );
};

// Website structured data
export const WebsiteStructuredData = () => {
  const websiteData: WebsiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Lagden Development',
    description: 'A small development group passionate about open-source.',
    url: 'https://lagden.dev',
    publisher: {
      '@type': 'Organization',
      name: 'Lagden Development',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://lagden.dev/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
    mainEntity: {
      '@type': 'Organization',
      name: 'Lagden Development',
      description:
        'A small development group passionate about open-source software development.',
      url: 'https://lagden.dev',
    },
  };

  return (
    <Script
      id="website-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(websiteData),
      }}
    />
  );
};

// Breadcrumb structured data
export const BreadcrumbStructuredData = ({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) => {
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Script
      id="breadcrumb-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbData),
      }}
    />
  );
};
