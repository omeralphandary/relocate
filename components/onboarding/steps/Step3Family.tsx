"use client";

import { FamilyStatus, OnboardingData } from "@/types";

interface Props {
  data: Partial<OnboardingData>;
  onChange: (fields: Partial<OnboardingData>) => void;
}

const FAMILY_OPTIONS: { value: FamilyStatus; label: string; emoji: string }[] = [
  { value: "single", label: "Just me", emoji: "🧍" },
  { value: "couple", label: "Me and my partner", emoji: "👫" },
  { value: "family_with_kids", label: "Family with children", emoji: "👨‍👩‍👧" },
];

export default function Step3Family({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Family & timeline</h2>
        <p className="text-gray-500 mt-1">The last few details to complete your relocation profile.</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Who's moving with you?
          </label>
          <div className="grid grid-cols-3 gap-3">
            {FAMILY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange({
                    familyStatus: opt.value,
                    hasChildren: opt.value === "family_with_kids",
                  });
                }}
                className={`
                  flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                  ${data.familyStatus === opt.value
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                  }
                `}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className={`text-sm font-medium text-center ${data.familyStatus === opt.value ? "text-emerald-600" : "text-gray-700"}`}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Planned moving date <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="date"
            value={data.movingDate ?? ""}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => onChange({ movingDate: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
          />
          <p className="text-xs text-gray-400 mt-1">Helps us prioritize time-sensitive tasks for you.</p>
        </div>
      </div>
    </div>
  );
}
