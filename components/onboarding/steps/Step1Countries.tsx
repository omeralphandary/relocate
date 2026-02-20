"use client";

import { OnboardingData } from "@/types";
import CountrySelect from "@/components/onboarding/CountrySelect";

interface Props {
  data: Partial<OnboardingData>;
  onChange: (fields: Partial<OnboardingData>) => void;
}

export default function Step1Countries({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Where are you moving?</h2>
        <p className="text-gray-500 mt-1">We'll build your personal relocation checklist based on this.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Moving from
          </label>
          <CountrySelect
            value={data.originCountry ?? ""}
            onChange={(v) => onChange({ originCountry: v })}
            placeholder="Select country of origin"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Moving to
          </label>
          <CountrySelect
            value={data.destinationCountry ?? ""}
            onChange={(v) => onChange({ destinationCountry: v })}
            placeholder="Select destination"
          />
        </div>
      </div>
    </div>
  );
}
