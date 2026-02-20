"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import ProgressBar from "./ProgressBar";
import Step1Countries from "./steps/Step1Countries";
import Step2Profile from "./steps/Step2Profile";
import Step3Family from "./steps/Step3Family";
import Step4Account from "./steps/Step4Account";
import { OnboardingData } from "@/types";
import { isEU } from "@/lib/eu-countries";
import EULuckyModal from "./EULuckyModal";

const STEPS = ["Where", "About you", "Family", "Account"];

interface AccountData {
  name: string;
  email: string;
  password: string;
}

const STEP_VALID: Record<number, (d: Partial<OnboardingData>, a: Partial<AccountData>) => boolean> = {
  1: (d) => !!d.originCountry && !!d.destinationCountry,
  2: (d) => !!d.nationality && !!d.employmentStatus,
  3: (d) => !!d.familyStatus,
  4: (_, a) => !!a.name && !!a.email && (a.password?.length ?? 0) >= 8,
};

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Partial<OnboardingData>>({});
  const [account, setAccount] = useState<Partial<AccountData>>({});
  const [showEUModal, setShowEUModal] = useState(false);

  const updateData = (fields: Partial<OnboardingData>) => setData((prev) => ({ ...prev, ...fields }));
  const updateAccount = (fields: Partial<AccountData>) => setAccount((prev) => ({ ...prev, ...fields }));

  const canAdvance = STEP_VALID[step]?.(data, account) ?? false;

  const handleNext = () => {
    // After step 2: show EU lucky modal if both nationality and destination are EU
    if (step === 2 && (isEU(data.nationality ?? "") || isEU(data.secondNationality ?? "")) && isEU(data.destinationCountry ?? "")) {
      setShowEUModal(true);
      return;
    }
    if (step < 4) {
      setStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  };

  const handleGoogleSignup = () => {
    // Persist steps 1–3 data so /onboarding/complete can pick it up after OAuth redirect
    localStorage.setItem("onboarding_data", JSON.stringify(data));
    signIn("google", { callbackUrl: "/onboarding/complete" });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ...account }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Something went wrong, please try again.");
      }

      const { journeyId } = await res.json();

      // Sign in immediately after account creation
      const result = await signIn("credentials", {
        email: account.email,
        password: account.password,
        redirect: false,
      });

      if (result?.error) throw new Error("Account created but sign-in failed. Please sign in manually.");

      router.push(`/journey/${journeyId}?welcome=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      {showEUModal && (
        <EULuckyModal
          destination={data.destinationCountry!}
          onContinue={() => { setShowEUModal(false); setStep(3); }}
        />
      )}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="mb-6">
          <span className="font-bold text-xl tracking-tight text-slate-900">Realocate<span className="text-emerald-500">.ai</span></span>
        </div>

        <ProgressBar currentStep={step} totalSteps={4} labels={STEPS} />

        <div className="min-h-[340px] sm:min-h-[380px] flex flex-col justify-between">
          <div>
            {step === 1 && <Step1Countries data={data} onChange={updateData} />}
            {step === 2 && <Step2Profile data={data} onChange={updateData} />}
            {step === 3 && <Step3Family data={data} onChange={updateData} />}
            {step === 4 && <Step4Account data={account} onChange={updateAccount} onGoogleSignup={handleGoogleSignup} />}
          </div>

          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

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
              {loading
                ? "Building your journey..."
                : step === 4
                ? "Create account & start →"
                : "Next →"}
            </button>
          </div>
          {step === 4 && (
            <p className="text-center text-xs text-gray-400 mt-4">
              By creating an account you agree to our{" "}
              <a href="/terms" target="_blank" className="underline hover:text-gray-600">Terms of Service</a>
              {" "}and{" "}
              <a href="/privacy" target="_blank" className="underline hover:text-gray-600">Privacy Policy</a>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
