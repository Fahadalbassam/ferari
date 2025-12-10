"use client";

import dynamic from "next/dynamic";

const StaticCar = dynamic(() => import("@/components/StaticCar"), {
  ssr: false,
  loading: () => <div className="h-[40vh] w-full bg-[#f4ede3]" />,
});

export default function ShowcasePage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <div className="w-full bg-[#f4ede3]">
        <StaticCar />
      </div>

      <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-700">Showcase</p>
        <h1 className="text-3xl font-bold">Studio orbit view</h1>
        <p className="max-w-2xl text-sm text-neutral-700">
          Auto-rotating hero with ACES tone mapping, sRGB, beige ground plane, and cube-mapped reflections that match the
          interactive drive.
        </p>
      </section>
    </main>
  );
}

