const ProjectDetailSkeleton = () => (
  <div className="relative min-h-screen overflow-hidden">
    <div className="relative mx-auto max-w-7xl px-4 py-16">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar skeleton */}
        <div className="md:w-1/3">
          <div className="relative overflow-hidden rounded-xl border border-gray-800/80 bg-black/50 shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md">
            <div className="animate-pulse p-6">
              {/* Image skeleton */}
              <div className="mb-6 h-96 rounded-lg bg-gray-800/50" />

              {/* Title skeleton */}
              <div className="mb-4 h-10 rounded bg-gray-800/50" />

              {/* Description skeleton */}
              <div className="mb-4 space-y-2">
                <div className="h-4 rounded bg-gray-800/50" />
                <div className="h-4 w-4/5 rounded bg-gray-800/50" />
              </div>

              {/* Status skeleton */}
              <div className="mb-4 h-8 rounded bg-gray-800/50" />

              {/* Tags skeleton */}
              <div className="mb-6 flex gap-2">
                <div className="h-6 w-16 rounded-full bg-gray-800/50" />
                <div className="h-6 w-20 rounded-full bg-gray-800/50" />
                <div className="h-6 w-12 rounded-full bg-gray-800/50" />
              </div>

              {/* Buttons skeleton */}
              <div className="space-y-3">
                <div className="h-10 rounded-full bg-gray-800/50" />
                <div className="h-10 rounded-full bg-gray-800/50" />
                <div className="h-10 rounded-full bg-gray-800/50" />
              </div>
            </div>
          </div>
        </div>

        {/* Main content skeleton */}
        <div className="md:w-2/3">
          <div className="relative overflow-hidden rounded-xl border border-gray-800/80 bg-black/50 shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md">
            <div className="animate-pulse p-6">
              {/* Header skeleton */}
              <div className="mb-6 flex items-center justify-between">
                <div className="h-10 w-32 rounded-full bg-gray-800/50" />
                <div className="h-10 w-36 rounded-full bg-gray-800/50" />
              </div>

              {/* Content skeleton */}
              <div className="space-y-4 pt-6">
                <div className="h-6 rounded bg-gray-800/50" />
                <div className="h-4 rounded bg-gray-800/50" />
                <div className="h-4 w-4/5 rounded bg-gray-800/50" />
                <div className="h-4 w-3/4 rounded bg-gray-800/50" />
                <div className="h-4 rounded bg-gray-800/50" />
                <div className="h-4 w-2/3 rounded bg-gray-800/50" />
                <div className="h-4 rounded bg-gray-800/50" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ProjectDetailSkeleton;
