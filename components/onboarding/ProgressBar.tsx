"use client";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export default function ProgressBar({ currentStep, totalSteps, labels }: ProgressBarProps) {
  return (
    <div className="w-full mb-10">
      <div className="flex items-center justify-between mb-2">
        {labels.map((label, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isActive = step === currentStep;
          return (
            <div key={label} className="flex flex-col items-center flex-1">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-1
                ${isCompleted ? "bg-emerald-500 text-white" : ""}
                ${isActive ? "bg-emerald-500 text-white ring-4 ring-emerald-100" : ""}
                ${!isCompleted && !isActive ? "bg-gray-100 text-gray-400" : ""}
              `}>
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : step}
              </div>
              <span className={`text-xs font-medium ${isActive ? "text-emerald-500" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="relative h-1 bg-gray-100 rounded-full mt-2">
        <div
          className="absolute h-1 bg-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}
