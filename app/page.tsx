// app/page.tsx

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ProjectsGrid from '@/components/shared/ui/ProjectsGrid';
import SectionHeader from '@/components/SectionHeader';
import StaggerContainer from '@/components/StaggerContainer';
import DynamicHero from '@/components/DynamicHero';
import SplitHero from '@/components/SplitHero';
import {
  OrganizationStructuredData,
  WebsiteStructuredData,
} from '@/lib/structured-data';
import {
  GithubIcon,
  Mail,
  Code2,
  Sparkles,
  ChevronRight,
  CommandIcon,
  Globe,
  Boxes,
} from 'lucide-react';
import './page.css';

interface Project {
  title: string;
  slug: string;
  description: string;
  tags: string[];
  github_repo_url: string;
  website_url: string;
  project_readme: Record<string, any>;
  picture_url: string;
  better_stack_status_id: string;
  is_featured: boolean;
}

const highlights = [
  {
    label: 'Open Source First',
    description: 'Building in public, for the community',
    icon: Code2,
    gradient: 'from-violet-500/80 via-fuchsia-500/80 to-indigo-500/80',
  },
  {
    label: 'Global Collaboration',
    description: 'Connected across time zones',
    icon: Globe,
    gradient: 'from-indigo-500/80 via-blue-500/80 to-cyan-500/80',
  },
  {
    label: 'Modern Stack',
    description: 'Embracing cutting-edge tech',
    icon: Boxes,
    gradient: 'from-cyan-500/80 via-violet-500/80 to-fuchsia-500/80',
  },
];

const pillars = [
  {
    title: 'Modern Development',
    description:
      "Crafting tomorrow's solutions with React, Next.js, and emerging web technologies.",
    icon: CommandIcon,
    gradient: 'from-violet-500/20 via-fuchsia-500/20 to-indigo-500/20',
  },
  {
    title: 'Cloud Innovation',
    description:
      'Building scalable, resilient architectures with cloud-native design principles.',
    icon: Sparkles,
    gradient: 'from-cyan-500/20 via-blue-500/20 to-violet-500/20',
  },
];

export default function Home() {
  return (
    <>
      <OrganizationStructuredData />
      <WebsiteStructuredData />

      <div className="relative overflow-visible">
        {/* Expanded Hero Section with integrated highlights */}
        <DynamicHero className="mb-16">
          <div className="relative space-y-16">
            {/* Hero Content */}
            <div className="relative">
              {/* Status badge with enhanced effects */}
              <div className="mb-8 inline-flex items-center rounded-full border border-gray-800/80 bg-gradient-to-r from-black/80 to-gray-900/80 px-4 py-2 text-sm text-gray-400 shadow-[0_0_15px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all duration-500 hover:border-violet-500/20 hover:shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                <div className="relative mr-2 flex items-center">
                  <span className="absolute h-3 w-3 animate-ping rounded-full bg-violet-500 opacity-75" />
                  <span className="relative h-3 w-3 rounded-full bg-violet-500" />
                </div>
                <span className="bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
                  Crafting the Future of Web Development
                </span>
              </div>
              {/* Hero title with enhanced sizing */}
              <h1 className="hero-title relative mb-8 text-5xl font-bold tracking-tight text-white transition-all duration-700 sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl">
                <span className="animate-font-weight font-sans">We are</span>{' '}
                <span className="relative inline-block bg-gradient-to-br from-violet-400 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">
                  Lagden Development
                  <div className="animate-glow-smooth absolute -right-3 top-0 h-32 w-32 bg-gradient-to-r from-violet-500/20 to-transparent blur-2xl" />
                </span>
              </h1>

              <p className="mx-auto mb-10 max-w-3xl bg-gradient-to-br from-gray-200 to-gray-400 bg-clip-text text-xl leading-extra-relaxed text-transparent sm:text-2xl">
                An emerging collective of passionate developers shaping the next
                generation of open-source solutions and digital experiences.
              </p>

              {/* Enhanced CTA buttons */}
              <div className="flex flex-col justify-center gap-4 sm:flex-row sm:gap-0 sm:space-x-4">
                <Button
                  className="group relative overflow-hidden rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 px-8 py-5 text-lg font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)]"
                  asChild
                >
                  <Link href="/projects">
                    <span className="relative z-10 flex items-center">
                      Explore Projects
                      <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_25%,rgba(0,0,0,0.2))]" />
                  </Link>
                </Button>
                <Button
                  className="group relative overflow-hidden rounded-full border border-gray-800 bg-black/50 px-8 py-5 text-lg font-medium text-white backdrop-blur transition-all duration-300 hover:scale-[1.02] hover:border-violet-500/50 hover:bg-black/60 hover:shadow-[0_0_25px_rgba(0,0,0,0.5)]"
                  asChild
                >
                  <a
                    href="https://github.com/Lagden-Development"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <GithubIcon className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                    GitHub
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_25%,rgba(0,0,0,0.2))]" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Highlights Section integrated into hero */}
            <StaggerContainer
              className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3"
              delay={120}
            >
              {highlights.map((item, index) => (
                <div key={item.label} className="group relative">
                  <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-violet-500/30 via-fuchsia-500/30 to-indigo-500/30 opacity-0 blur transition-all duration-300 group-hover:opacity-100" />
                  <div className="relative overflow-hidden rounded-xl border border-gray-800/80 bg-black/50 p-4 sm:p-6 shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-300 hover:border-violet-500/30 hover:shadow-[0_0_25px_rgba(124,58,237,0.2)]">
                    <div className="absolute inset-0 bg-gradient-to-br from-black via-transparent to-transparent opacity-50" />
                    <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div
                        className={`h-full w-full bg-gradient-to-r ${item.gradient} opacity-10`}
                      />
                    </div>
                    <div className="relative flex items-start gap-3 sm:gap-4">
                      <div
                        className={`relative mt-0.5 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-r ${item.gradient} p-2.5 sm:p-3 transition-transform duration-300 group-hover:scale-110`}
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_25%,rgba(0,0,0,0.2))]" />
                        <item.icon className="relative h-5 w-5 sm:h-6 sm:w-6 text-white transition-transform duration-300 group-hover:rotate-12" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <h3 className="text-lg sm:text-xl font-semibold text-white leading-tight mb-1">
                          {item.label}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </StaggerContainer>
          </div>
        </DynamicHero>

        {/* Split Hero Section - Code to Visual Transformation */}
        <SplitHero />

        {/* Pillars Section with enhanced cards */}
        <section className="mb-32">
          <StaggerContainer
            className="grid grid-cols-1 gap-8 md:grid-cols-2"
            delay={200}
          >
            {pillars.map((pillar, index) => (
              <div key={pillar.title} className="group relative">
                <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-violet-500/30 via-fuchsia-500/30 to-indigo-500/30 opacity-0 blur transition-all duration-300 group-hover:opacity-100" />
                <div className="relative overflow-hidden rounded-xl border border-gray-800/80 bg-black/50 p-8 shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-300 hover:border-violet-500/30 hover:shadow-[0_0_25px_rgba(124,58,237,0.2)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-black via-transparent to-transparent opacity-50" />
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div
                      className={`h-full w-full bg-gradient-to-r ${pillar.gradient}`}
                    />
                  </div>
                  <div className="relative">
                    <pillar.icon className="mb-4 h-8 w-8 text-violet-500 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                    <h3 className="mb-3 text-2xl font-semibold text-white group-hover:text-violet-200">
                      {pillar.title}
                    </h3>
                    <p className="text-gray-400">{pillar.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </StaggerContainer>
        </section>

        {/* Featured Projects Section */}
        <section className="mb-32">
          <div className="relative mb-12 text-center">
            <div className="animate-glow-slow absolute left-1/2 top-0 h-[200px] w-[200px] -translate-x-1/2">
              <div className="bg-gradient-conic absolute h-full w-full from-violet-500/20 via-transparent to-transparent blur-3xl" />
            </div>
            <SectionHeader className="relative mb-4 bg-gradient-to-br from-white to-gray-300 bg-clip-text text-4xl font-bold text-transparent">
              Featured Projects
            </SectionHeader>
            <p className="relative text-xl text-gray-400">
              Discover our latest innovations
            </p>
          </div>

          <ProjectsGrid featuredOnly={true} fromPage="home" />
        </section>

        {/* Contact Section */}
        <section className="relative mb-24">
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-violet-500/30 via-fuchsia-500/30 to-indigo-500/30 opacity-0 blur-lg transition-opacity duration-500 hover:opacity-100" />
          <div className="relative overflow-hidden rounded-2xl border border-gray-800/80 bg-black/50 shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/10 to-indigo-500/10" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px]" />
            </div>
            <div className="relative px-8 py-12 text-center sm:px-12">
              <span className="animate-shimmer inline-block rounded-full bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-indigo-500/20 px-4 py-1.5 text-sm text-violet-300">
                Join Our Journey
              </span>
              <SectionHeader className="mb-4 mt-6 bg-gradient-to-br from-white to-gray-300 bg-clip-text text-4xl font-bold text-transparent">
                Let&apos;s Build Together
              </SectionHeader>
              <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-400">
                Whether you&apos;re interested in collaboration, contributions,
                or just want to connect, we&apos;re excited to hear from you.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  className="group relative overflow-hidden rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 px-8 py-6 text-lg font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25pxrgba(124,58,237,0.5)]"
                  asChild
                >
                  <a href="mailto:hello@lagden.dev" className="relative">
                    <span className="relative z-10 flex items-center">
                      <Mail className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                      Start a Conversation
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_25%,rgba(0,0,0,0.2))]" />
                  </a>
                </Button>
                <Button
                  className="group relative overflow-hidden rounded-full border border-gray-800 bg-black/50 px-8 py-6 text-lg font-medium text-white backdrop-blur transition-all duration-300 hover:scale-[1.02] hover:border-violet-500/50 hover:bg-black/60 hover:shadow-[0_0_25px_rgba(0,0,0,0.5)]"
                  asChild
                >
                  <a
                    href="https://github.com/Lagden-Development"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <GithubIcon className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                    Follow Our Work
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_25%,rgba(0,0,0,0.2))]" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
