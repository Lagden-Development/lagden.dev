interface PeopleSkeletonProps {
  count?: number;
}

const PeopleSkeleton = ({ count = 6 }: PeopleSkeletonProps) => (
  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="relative h-[360px] overflow-hidden rounded-xl border border-gray-800/80 bg-black/50 shadow-[0_0_15px_rgba(0,0,0,0.3)] backdrop-blur-md">
          <div className="relative flex h-full flex-col p-6">
            {/* Image skeleton */}
            <div className="mb-4 h-44 rounded-lg bg-gray-800/50" />

            {/* Name skeleton */}
            <div className="mb-2 h-6 w-3/4 rounded bg-gray-800/50" />

            {/* Info skeleton */}
            <div className="mb-4 space-y-2">
              <div className="h-4 w-1/2 rounded bg-gray-800/50" />
              <div className="h-4 w-2/3 rounded bg-gray-800/50" />
              <div className="h-4 w-1/3 rounded bg-gray-800/50" />
            </div>

            {/* Skills skeleton */}
            <div className="mt-auto flex gap-2">
              <div className="h-6 w-16 rounded-full bg-gray-800/50" />
              <div className="h-6 w-20 rounded-full bg-gray-800/50" />
              <div className="h-6 w-12 rounded-full bg-gray-800/50" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default PeopleSkeleton;
