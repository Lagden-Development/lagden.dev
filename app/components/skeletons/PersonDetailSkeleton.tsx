const PersonDetailSkeleton = () => (
  <div className="min-h-screen py-12">
    <div className="mx-auto flex max-w-6xl flex-col px-4 text-white md:flex-row">
      {/* Sidebar skeleton */}
      <div className="md:w-1/3 md:pr-8">
        <div className="relative overflow-hidden rounded-xl border border-gray-800/80 bg-black/50 shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md">
          <div className="animate-pulse p-6">
            {/* Image skeleton */}
            <div className="mb-6 h-96 rounded-lg bg-gray-800/50" />

            {/* Name skeleton */}
            <div className="mb-2 h-10 w-3/4 rounded bg-gray-800/50" />

            {/* Info skeleton */}
            <div className="mb-4 space-y-2">
              <div className="h-4 w-1/2 rounded bg-gray-800/50" />
              <div className="h-4 w-2/3 rounded bg-gray-800/50" />
              <div className="h-4 w-1/3 rounded bg-gray-800/50" />
            </div>

            {/* Skills skeleton */}
            <div className="mb-6 flex flex-wrap gap-2">
              <div className="h-6 w-16 rounded bg-gray-800/50" />
              <div className="h-6 w-20 rounded bg-gray-800/50" />
              <div className="h-6 w-12 rounded bg-gray-800/50" />
              <div className="w-18 h-6 rounded bg-gray-800/50" />
            </div>

            {/* Links skeleton */}
            <div className="flex flex-wrap gap-3">
              <div className="h-10 w-24 rounded bg-gray-800/50" />
              <div className="h-10 w-28 rounded bg-gray-800/50" />
              <div className="h-10 w-24 rounded bg-gray-800/50" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="mt-8 md:mt-0 md:w-2/3 md:pl-8">
        <div className="relative overflow-hidden rounded-xl border border-gray-800/80 bg-black/50 shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md">
          <div className="animate-pulse p-6">
            {/* Header skeleton */}
            <div className="mb-6 h-10 w-48 rounded bg-gray-800/50" />

            {/* Content skeleton */}
            <div className="space-y-4 pt-6">
              <div className="h-4 rounded bg-gray-800/50" />
              <div className="h-4 w-4/5 rounded bg-gray-800/50" />
              <div className="h-4 w-3/4 rounded bg-gray-800/50" />
              <div className="h-4 rounded bg-gray-800/50" />
              <div className="h-4 w-2/3 rounded bg-gray-800/50" />
              <div className="h-4 rounded bg-gray-800/50" />
              <div className="h-4 w-3/5 rounded bg-gray-800/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default PersonDetailSkeleton;
