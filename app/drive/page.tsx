"use client";

import dynamic from "next/dynamic";

const CarCanvas = dynamic(() => import("@/components/CarCanvas"), {
  ssr: false,
  loading: () => <div className="h-[60vh] w-full bg-[#f4ede3]" />,
});

export default function DrivePage() {
  return (
    <main className="min-h-screen bg-[#f4ede3] text-neutral-900">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 space-y-6">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-700">Test Drive</p>
          <h1 className="text-3xl font-bold text-neutral-900">Drive the Ferrari interactively</h1>
          <p className="max-w-3xl text-sm text-neutral-700">
            WASD / arrow keys to move, Space to brake, and toggle the follow camera for a chase view. Lighting, shadows,
            and reflections are matched to the studio cube-map.
          </p>
        </header>
        <div className="overflow-hidden rounded-2xl border border-neutral-200 shadow-lg bg-[#f4ede3]">
          <CarCanvas />
        </div>
      </div>
    </main>
  );
}

