import Link from "next/link";

export default function JourneyNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-5xl mb-4">🗺️</p>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Journey not found</h1>
        <p className="text-gray-500 text-sm mb-6">
          This link may have expired or the journey doesn't exist.
        </p>
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 transition-colors"
        >
          Start a new journey →
        </Link>
      </div>
    </div>
  );
}
