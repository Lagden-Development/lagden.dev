// app/projects/page.tsx

import ProjectsGrid from '@/components/shared/ui/ProjectsGrid';

export default function Projects() {
  return (
    <div className="relative min-h-screen overflow-visible py-12">
      {/* Hero Section */}
      <section className="relative mb-16 text-center">
        <div className="animate-pulse-slow absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2">
          <div className="bg-gradient-radial absolute h-full w-full from-violet-500/30 via-indigo-500/20 to-transparent blur-3xl" />
          <div className="bg-gradient-conic absolute h-full w-full from-violet-500/20 via-indigo-500/20 to-transparent blur-3xl" />
        </div>

        <div className="relative">
          <h1 className="mb-6 bg-gradient-to-br from-white via-white to-violet-200 bg-clip-text text-6xl font-bold tracking-tight text-transparent sm:text-7xl">
            Our Projects
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-400">
            Discover our open-source contributions and ongoing initiatives
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <ProjectsGrid enablePagination={true} itemsPerPage={9} />
    </div>
  );
}
