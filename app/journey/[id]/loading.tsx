export default function JourneyLoading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-5">
          <div className="h-3 w-16 bg-gray-200 rounded-full mb-2" />
          <div className="h-6 w-48 bg-gray-200 rounded-full mb-4" />
          <div className="h-2 w-full bg-gray-100 rounded-full" />
        </div>
      </div>

      {/* Category card skeletons */}
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 px-5 py-4 flex items-center gap-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded-full" />
              <div className="h-3 w-36 bg-gray-100 rounded-full" />
            </div>
            <div className="w-11 h-11 bg-gray-100 rounded-full flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
