"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import JourneyLoadingScreen from "@/components/onboarding/JourneyLoadingScreen";

export default function OnboardingCompletePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/auth/signin");
      return;
    }

    const raw = typeof window !== "undefined" ? localStorage.getItem("onboarding_data") : null;
    if (!raw) {
      // No data — user is authenticated, send them to their journey or onboarding start
      router.replace("/journey");
      return;
    }

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(raw);
    } catch {
      localStorage.removeItem("onboarding_data");
      router.replace("/onboarding");
      return;
    }

    fetch("/api/onboarding/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((body: { journeyId?: string; error?: string }) => {
        if (body.error) throw new Error(body.error);
        localStorage.removeItem("onboarding_data");
        router.replace(`/journey/${body.journeyId}?welcome=1`);
      })
      .catch((err: Error) => {
        setError(err.message ?? "Something went wrong. Please try again.");
      });
  }, [session, status, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <p className="text-4xl mb-4">⚠️</p>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-sm text-gray-500 mb-6 max-w-xs">{error}</p>
        <button
          type="button"
          onClick={() => router.replace("/onboarding")}
          className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors"
        >
          Start over
        </button>
      </div>
    );
  }

  return <JourneyLoadingScreen />;
}
