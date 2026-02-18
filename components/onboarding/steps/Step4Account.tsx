"use client";

interface AccountData {
  name: string;
  email: string;
  password: string;
}

interface Props {
  data: Partial<AccountData>;
  onChange: (fields: Partial<AccountData>) => void;
}

export default function Step4Account({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Save your journey</h2>
        <p className="text-gray-500 mt-1">Create a free account so you can return to your checklist from any device.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
          <input
            type="text"
            value={data.name ?? ""}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Your name"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={data.email ?? ""}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="you@example.com"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={data.password ?? ""}
            onChange={(e) => onChange({ password: e.target.value })}
            placeholder="At least 8 characters"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
          />
        </div>
      </div>

      <p className="text-xs text-gray-400">
        Already have an account?{" "}
        <a href="/auth/signin" className="text-emerald-500 hover:underline font-medium">Sign in</a>
      </p>
    </div>
  );
}
