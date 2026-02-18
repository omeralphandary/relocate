"use client";

interface Props {
  destination: string;
  onContinue: () => void;
}

export default function EULuckyModal({ destination, onContinue }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
        <div className="text-5xl mb-4">🍀</div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Lucky you!</h2>

        <p className="text-gray-600 text-sm leading-relaxed mb-2">
          As an <span className="font-semibold text-emerald-600">EU citizen moving to {destination}</span>, you have the right of free movement — no visa, no work permit, no lengthy immigration process.
        </p>

        <p className="text-gray-500 text-sm leading-relaxed mb-6">
          You'll still need to handle a few local formalities like registering your address and opening a bank account, but compared to non-EU movers your journey will be significantly shorter and simpler. 🎉
        </p>

        <button
          type="button"
          onClick={onContinue}
          className="w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 transition-colors"
        >
          Great, let's keep going →
        </button>
      </div>
    </div>
  );
}
