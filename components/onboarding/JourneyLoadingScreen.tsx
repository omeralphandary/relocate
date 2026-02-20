"use client";

import { useState, useEffect } from "react";

const LOADING_MESSAGES = [
  "Analysing your relocation corridor...",
  "Checking visa & residency requirements...",
  "Mapping tasks for your destination...",
  "Personalising for your profile...",
  "Ordering tasks by dependency...",
  "Almost ready...",
];

export default function JourneyLoadingScreen() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIndex((i) => Math.min(i + 1, LOADING_MESSAGES.length - 1));
    }, 2400);

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
      <div className="mb-12">
        <span className="font-bold text-xl tracking-tight text-white">
          Realocate<span className="text-emerald-400">.ai</span>
        </span>
      </div>

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
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      <h2 className="text-white text-xl font-bold mb-2 tracking-tight">Building your journey</h2>

      <p key={msgIndex} className="text-slate-400 text-sm mb-10 text-center transition-all duration-500">
        {LOADING_MESSAGES[msgIndex]}
      </p>

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
