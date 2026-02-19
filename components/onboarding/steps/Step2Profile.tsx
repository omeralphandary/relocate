"use client";

import { COUNTRIES } from "@/lib/countries";
import { EmploymentStatus, OnboardingData } from "@/types";

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
          <select
            value={data.nationality ?? ""}
            onChange={(e) => onChange({ nationality: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
          >
            <option value="" disabled>Select your nationality</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
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
