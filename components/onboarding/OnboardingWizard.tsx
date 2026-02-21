"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import ProgressBar from "./ProgressBar";
import Step1Countries from "./steps/Step1Countries";
import Step2Profile from "./steps/Step2Profile";
import Step3Family from "./steps/Step3Family";
import Step4Account from "./steps/Step4Account";
import JourneyLoadingScreen from "./JourneyLoadingScreen";
import { OnboardingData } from "@/types";
import { isEU } from "@/lib/eu-countries";
import EULuckyModal from "./EULuckyModal";

const STEPS = ["Where", "About you", "Family"];

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
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Partial<OnboardingData>>({});
  const [account, setAccount] = useState<Partial<AccountData>>({});
  const [showEUModal, setShowEUModal] = useState(false);

  const updateData = (fields: Partial<OnboardingData>) => setData((prev) => ({ ...prev, ...fields }));
  const updateAccount = (fields: Partial<AccountData>) => setAccount((prev) => ({ ...prev, ...fields }));

  const canAdvance = STEP_VALID[step]?.(data, account) ?? false;

  // Google OAuth — save steps 1–3 data to localStorage, redirect to Google
  const handleGoogleSignup = () => {
    localStorage.setItem("onboarding_data", JSON.stringify(data));
    signIn("google", { callbackUrl: "/onboarding/complete" });
  };

  // Authenticated returning user — create new journey directly
  const handleSubmitAuthenticated = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Something went wrong, please try again.");
      }
      const { journeyId } = await res.json();
      router.push(`/journey/${journeyId}?welcome=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
      setLoading(false);
    }
  };

  // Email/password fallback (step 4)
  const handleSubmitEmail = async () => {
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

  const handleNext = () => {
    if (step === 2 && (isEU(data.nationality ?? "") || isEU(data.secondNationality ?? "")) && isEU(data.destinationCountry ?? "")) {
      setShowEUModal(true);
      return;
    }
    if (step < 3) { setStep((s) => s + 1); return; }
    // Step 3: final step for authenticated users and Google new users
    if (step === 3) {
      if (isAuthenticated) { handleSubmitAuthenticated(); return; }
      handleGoogleSignup();
      return;
    }
    // Step 4: email/password fallback
    handleSubmitEmail();
  };

  if (loading) return <JourneyLoadingScreen />;

  // Step 4 is the email fallback — outside the progress bar, full-card replace
  if (step === 4) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <div className="mb-6">
            <span className="font-bold text-xl tracking-tight text-slate-900">Realocate<span className="text-emerald-500">.ai</span></span>
          </div>
          <Step4Account data={account} onChange={updateAccount} onGoogleSignup={handleGoogleSignup} />
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          <div className="flex items-center justify-between mt-8">
            <button
              type="button"
              onClick={() => { setStep(3); setError(null); }}
              className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!canAdvance}
              className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Create account & start →
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            By creating an account you agree to our{" "}
            <a href="/terms" target="_blank" className="underline hover:text-gray-600">Terms of Service</a>
            {" "}and{" "}
            <a href="/privacy" target="_blank" className="underline hover:text-gray-600">Privacy Policy</a>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      {showEUModal && (
        <EULuckyModal
          destination={data.destinationCountry!}
          onContinue={() => { setShowEUModal(false); setStep(3); }}
        />
      )}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <span className="font-bold text-xl tracking-tight text-slate-900">Realocate<span className="text-emerald-500">.ai</span></span>
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/onboarding" })}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Sign out →
            </button>
          )}
        </div>

        <ProgressBar currentStep={step} totalSteps={3} labels={STEPS} />

        <div className="min-h-[340px] sm:min-h-[380px] flex flex-col justify-between">
          <div>
            {step === 1 && <Step1Countries data={data} onChange={updateData} />}
            {step === 2 && <Step2Profile data={data} onChange={updateData} />}
            {step === 3 && <Step3Family data={data} onChange={updateData} />}
          </div>

          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

          <div className="flex flex-col gap-3 mt-8">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className={`text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors ${step === 1 ? "invisible" : ""}`}
              >
                ← Back
              </button>

              {/* Step 3 new user: Google CTA */}
              {step === 3 && !isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canAdvance}
                  className="flex items-center gap-2.5 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canAdvance}
                  className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {step === 3 && isAuthenticated ? "Start my journey →" : "Next →"}
                </button>
              )}
            </div>

            {/* Email fallback — only on step 3 for new users */}
            {step === 3 && !isAuthenticated && (
              <p className="text-center text-xs text-gray-400">
                or{" "}
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="text-gray-500 hover:text-emerald-600 underline transition-colors"
                >
                  use email & password instead
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
