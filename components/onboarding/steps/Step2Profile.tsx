"use client";

import { useState } from "react";
import { EmploymentStatus, OnboardingData } from "@/types";
import CountrySelect from "@/components/onboarding/CountrySelect";

interface Props {
  data: Partial<OnboardingData>;
  onChange: (fields: Partial<OnboardingData>) => void;
}

const EMPLOYMENT_OPTIONS: { value: EmploymentStatus; label: string; description: string }[] = [
  { value: "employed", label: "Employed", description: "Working for a company" },
  { value: "self_employed", label: "Self-employed", description: "Running your own business" },
  { value: "freelancer", label: "Freelancer", description: "Independent contractor" },
  { value: "student", label: "Student", description: "Enrolled in a university or academic programme" },
  { value: "unemployed", label: "Not working", description: "Between jobs or not currently employed" },
];

export default function Step2Profile({ data, onChange }: Props) {
  const [showSecond, setShowSecond] = useState(!!data.secondNationality);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Tell us about yourself</h2>
        <p className="text-gray-500 mt-1">This helps us tailor visa and work requirements for your situation.</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your nationality
          </label>
          <CountrySelect
            value={data.nationality ?? ""}
            onChange={(v) => onChange({ nationality: v })}
            placeholder="Select your nationality"
          />

          {!showSecond ? (
            <button
              type="button"
              onClick={() => setShowSecond(true)}
              className="mt-2 text-xs text-gray-400 hover:text-emerald-500 transition-colors"
            >
              + Add second nationality (dual citizen?)
            </button>
          ) : (
            <div className="mt-2 space-y-1">
              <label className="block text-xs font-medium text-gray-500">Second nationality (optional)</label>
              <div className="flex gap-2 items-start">
                <div className="flex-1">
                  <CountrySelect
                    value={data.secondNationality ?? ""}
                    onChange={(v) => onChange({ secondNationality: v || undefined })}
                    placeholder="Select second nationality"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => { setShowSecond(false); onChange({ secondNationality: undefined }); }}
                  className="text-gray-300 hover:text-gray-500 transition-colors px-2 text-lg mt-2.5"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Employment status
          </label>
          <div className="grid grid-cols-1 gap-3">
            {EMPLOYMENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ employmentStatus: opt.value })}
                className={`
                  flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all
                  ${data.employmentStatus === opt.value
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                  }
                `}
              >
                <div className={`
                  mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                  ${data.employmentStatus === opt.value ? "border-emerald-500" : "border-gray-300"}
                `}>
                  {data.employmentStatus === opt.value && (
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">{opt.label}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{opt.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
