"use client";

import { useState, useRef, useEffect } from "react";
import { COUNTRIES } from "@/lib/countries";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export default function CountrySelect({ value, onChange, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const ALIASES: Record<string, string> = {
    us: "United States", usa: "United States",
    uk: "United Kingdom", gb: "United Kingdom",
    uae: "United Arab Emirates",
    cz: "Czech Republic",
    de: "Germany", fr: "France", es: "Spain", it: "Italy",
    nl: "Netherlands", pl: "Poland", at: "Austria",
    ch: "Switzerland", se: "Sweden", no: "Norway",
    dk: "Denmark", fi: "Finland", be: "Belgium",
    pt: "Portugal", ie: "Ireland", ru: "Russia",
    il: "Israel", au: "Australia", nz: "New Zealand",
    za: "South Africa", sg: "Singapore", jp: "Japan",
    kr: "South Korea", cn: "China", in: "India",
    br: "Brazil", ca: "Canada", mx: "Mexico",
    sa: "Saudi Arabia", tr: "Turkey", ae: "United Arab Emirates",
  };

  const aliasTarget = ALIASES[search.toLowerCase()];
  const filtered = search
    ? COUNTRIES.filter((c) =>
        c.toLowerCase().includes(search.toLowerCase()) ||
        (aliasTarget !== undefined && c === aliasTarget)
      )
    : COUNTRIES;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleSelect = (country: string) => {
    onChange(country);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white flex items-center justify-between gap-2"
      >
        <span className={`truncate text-sm ${value ? "text-gray-900" : "text-gray-400"}`}>
          {value || placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") { setOpen(false); setSearch(""); }
                if (e.key === "Enter" && filtered.length === 1) handleSelect(filtered[0]);
              }}
              placeholder="Search..."
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div className="max-h-52 overflow-y-auto overscroll-contain">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-gray-400">No results</p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleSelect(c)}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                    c === value
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {c}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
