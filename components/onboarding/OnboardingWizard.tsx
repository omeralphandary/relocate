"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "./ProgressBar";
import Step1Countries from "./steps/Step1Countries";
import Step2Profile from "./steps/Step2Profile";
import Step3Family from "./steps/Step3Family";
import { OnboardingData } from "@/types";

const STEPS = ["Where", "About you", "Family"];

const STEP_VALID: Record<number, (d: Partial<OnboardingData>) => boolean> = {
  1: (d) => !!d.originCountry && !!d.destinationCountry,
  2: (d) => !!d.nationality && !!d.employmentStatus,
  3: (d) => !!d.familyStatus,
};

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Partial<OnboardingData>>({});

  const update = (fields: Partial<OnboardingData>) =>
    setData((prev) => ({ ...prev, ...fields }));

  const canAdvance = STEP_VALID[step]?.(data) ?? false;

  const handleNext = () => {
    if (step < 3) {
      setStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Something went wrong, please try again.");
      const { journeyId } = await res.json();
      router.push(`/journey/${journeyId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="mb-6">
          <span className="text-emerald-500 font-semibold text-sm tracking-wide uppercase">Relocate</span>
        </div>

        <ProgressBar currentStep={step} totalSteps={3} labels={STEPS} />

        <div className="min-h-[380px] flex flex-col justify-between">
          <div>
            {step === 1 && <Step1Countries data={data} onChange={update} />}
            {step === 2 && <Step2Profile data={data} onChange={update} />}
            {step === 3 && <Step3Family data={data} onChange={update} />}
          </div>

          {error && (
            <p className="text-red-500 text-sm mt-4">{error}</p>
          )}

          <div className="flex items-center justify-between mt-8">
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className={`text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors ${step === 1 ? "invisible" : ""}`}
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!canAdvance || loading}
              className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Building your journey..." : step === 3 ? "Build my journey →" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
