"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import ProgressBar from "./ProgressBar";
import Step1Countries from "./steps/Step1Countries";
import Step2Profile from "./steps/Step2Profile";
import Step3Family from "./steps/Step3Family";
import Step4Account from "./steps/Step4Account";
import { OnboardingData } from "@/types";
import { isEU } from "@/lib/eu-countries";
import EULuckyModal from "./EULuckyModal";

const STEPS_NEW    = ["Where", "About you", "Family", "Account"];
const STEPS_RETURN = ["Where", "About you", "Family"];

const LOADING_MESSAGES = [
  "Analysing your relocation corridor...",
  "Checking visa & residency requirements...",
  "Mapping tasks for your destination...",
  "Personalising for your profile...",
  "Ordering tasks by dependency...",
  "Almost ready...",
];

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

function JourneyLoadingScreen() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Cycle messages every 2.4s
    const msgTimer = setInterval(() => {
      setMsgIndex((i) => Math.min(i + 1, LOADING_MESSAGES.length - 1));
    }, 2400);

    // Fake progress — grows quickly to ~85%, then slows
    const progressTimer = setInterval(() => {
      setProgress((p) => {
        if (p >= 85) return p + 0.3;
        return p + 2.5;
      });
    }, 120);

    return () => { clearInterval(msgTimer); clearInterval(progressTimer); };
  }, []);

  const clampedProgress = Math.min(progress, 97);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-12">
        <span className="font-bold text-xl tracking-tight text-white">
          Realocate<span className="text-emerald-400">.ai</span>
        </span>
      </div>

      {/* Spinner */}
      <div className="relative w-20 h-20 mb-8">
        <svg className="w-20 h-20 animate-spin" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="34" stroke="#1e293b" strokeWidth="6" />
          <circle
            cx="40" cy="40" r="34"
            stroke="url(#grad)" strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="213"
            strokeDashoffset="160"
          />
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
        </svg>
        {/* Inner dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* Headline */}
      <h2 className="text-white text-xl font-bold mb-2 tracking-tight">
        Building your journey
      </h2>

      {/* Cycling message */}
      <p
        key={msgIndex}
        className="text-slate-400 text-sm mb-10 text-center transition-all duration-500"
      >
        {LOADING_MESSAGES[msgIndex]}
      </p>

      {/* Fake progress bar */}
      <div className="w-64 h-1 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-300"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>

      <p className="text-slate-600 text-xs mt-4">This usually takes 5–15 seconds</p>
    </div>
  );
}

export default function OnboardingWizard() {
  const router = useRouter();
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  const STEPS = isAuthenticated ? STEPS_RETURN : STEPS_NEW;
  const totalSteps = STEPS.length;

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
    if (step === 2 && (isEU(data.nationality ?? "") || isEU(data.secondNationality ?? "")) && isEU(data.destinationCountry ?? "")) {
      setShowEUModal(true);
      return;
    }
    if (step < totalSteps) {
      setStep((s) => s + 1);
    } else {
      isAuthenticated ? handleSubmitAuthenticated() : handleSubmit();
    }
  };

  const handleGoogleSignup = () => {
    localStorage.setItem("onboarding_data", JSON.stringify(data));
    signIn("google", { callbackUrl: "/onboarding/complete" });
  };

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

  // Show full-screen loading experience while LLM generates the journey
  if (loading) return <JourneyLoadingScreen />;

  const isLastStep = step === totalSteps;

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

        <ProgressBar currentStep={step} totalSteps={totalSteps} labels={STEPS} />

        <div className="min-h-[340px] sm:min-h-[380px] flex flex-col justify-between">
          <div>
            {step === 1 && <Step1Countries data={data} onChange={updateData} />}
            {step === 2 && <Step2Profile data={data} onChange={updateData} />}
            {step === 3 && <Step3Family data={data} onChange={updateData} />}
            {step === 4 && !isAuthenticated && <Step4Account data={account} onChange={updateAccount} onGoogleSignup={handleGoogleSignup} />}
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
              disabled={!canAdvance}
              className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLastStep
                ? isAuthenticated ? "Start my journey →" : "Create account & start →"
                : "Next →"}
            </button>
          </div>
          {isLastStep && !isAuthenticated && (
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
