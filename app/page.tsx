"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pointerStartX, setPointerStartX] = useState<number | null>(null);
  const [faceProgress, setFaceProgress] = useState(0);
  const faceRef = useRef<HTMLElement | null>(null);

  const slides = useMemo(
    () => [
      "/carousel.webp",
      "/carousel1.jpg",
      "/carousel2.jpg",
      "/carousel3.webp",
      "/carousel5.jpg",
      "/carousel6.png",
      "/carousel8.webp",
      "/carousel9.webp",
    ],
    [],
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePointerStart = (clientX: number) => {
    setPointerStartX(clientX);
  };

  const handlePointerEnd = (clientX: number) => {
    if (pointerStartX === null) return;
    const delta = clientX - pointerStartX;
    const threshold = 50;
    if (delta > threshold) {
      setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
    } else if (delta < -threshold) {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }
    setPointerStartX(null);
  };

  useEffect(() => {
    const handleScroll = () => {
      const el = faceRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const visible = Math.min(Math.max((vh - rect.top) / (vh + rect.height), 0), 1);
      setFaceProgress(visible);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Image
            src="/ferrari-logo-png_seeklogo-512505.png"
            alt="Ferrari logo"
            width={48}
            height={48}
            priority
          />
        </div>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          {[
            { label: "Home", href: "/" },
            { label: "Browse", href: "/browse" },
            { label: "Test Drive", href: "/test-drive" },
            { label: "More About Ferrari", href: "/more-about" },
          ].map((item) => (
            <Link key={item.label} href={item.href} className="transition-colors hover:text-neutral-600">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <Link
                href="/orders"
                className="hidden rounded-md border border-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-800 transition hover:border-neutral-400 md:inline-flex"
              >
                Orders
              </Link>
              {(session.user as { role?: string }).role === "admin" && (
                <Link
                  href="/admin-dashboard"
                  className="hidden rounded-md border border-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-800 transition hover:border-neutral-400 md:inline-flex"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hidden rounded-md border border-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-800 transition hover:border-neutral-400 md:inline-flex"
              >
                Logout
              </button>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
                {session.user.email?.slice(0, 2).toUpperCase()}
              </div>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="rounded-md border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-800 transition hover:border-neutral-400"
            >
              Sign In
            </Link>
          )}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex items-center justify-center rounded-md border border-neutral-200 px-3 py-2 text-lg font-semibold shadow-sm transition hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-400 md:hidden"
            aria-label="Open menu"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 stroke-current" role="img">
              <line x1="4" y1="7" x2="20" y2="7" strokeWidth="2" strokeLinecap="round" />
              <line x1="4" y1="12" x2="20" y2="12" strokeWidth="2" strokeLinecap="round" />
              <line x1="4" y1="17" x2="20" y2="17" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      {session?.user && (
        <div className="border-b border-neutral-200 bg-white px-6 py-3 text-sm text-neutral-700">
          Signed in as {session.user.email}
        </div>
      )}

      <section
        className="relative w-full overflow-hidden touch-pan-y"
        onMouseDown={(e) => handlePointerStart(e.clientX)}
        onMouseUp={(e) => handlePointerEnd(e.clientX)}
        onMouseLeave={() => setPointerStartX(null)}
        onTouchStart={(e) => handlePointerStart(e.touches[0]?.clientX ?? 0)}
        onTouchEnd={(e) => handlePointerEnd(e.changedTouches[0]?.clientX ?? 0)}
      >
        <div
          className="flex transition-transform duration-500"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides.map((src, idx) => (
            <div key={src} className="relative h-[460px] min-w-full">
              <Image
                src={src}
                alt={`Ferrari slide ${idx + 1}`}
                fill
                sizes="100vw"
                className="object-cover"
                priority={idx === 0}
              />
            </div>
          ))}
        </div>
      </section>

      <section
        ref={faceRef}
        className="relative flex min-h-[520px] items-center justify-center overflow-hidden bg-white px-6 py-10"
        style={{ perspective: "1200px" }}
      >
        <div className="relative flex w-full max-w-5xl items-center justify-center">
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            aria-hidden
          >
            <Image
              src="/FERRARIFACE.png"
              alt="Ferrari face"
              width={1200}
              height={600}
              className="pointer-events-none select-none object-contain"
              style={{
                transform: `translateY(${(120 - faceProgress * 70) - 50}px) scale(${0.3 + faceProgress * 0.4})`,
                transition: "transform 0.16s ease-out",
              }}
              priority
            />
          </div>

          <div className="relative flex w-full flex-col items-center gap-8 text-center text-black">
            <div className="relative flex w-full items-center justify-between text-sm font-semibold uppercase tracking-[0.3em] text-neutral-800">
              <span
                className="block text-2xl font-extrabold text-neutral-900"
                style={{
                  opacity: faceProgress,
                  transform: `translate(${ -50 + faceProgress * (100 * Math.cos(135 * (Math.PI / 180))) }px, ${
                    10 + faceProgress * (100 * Math.sin(135 * (Math.PI / 180)))
                  }px)`,
                  transition: "transform 0.12s linear, opacity 0.12s linear",
                }}
              >
                #EssereFerrari
              </span>
              <span
                className="block text-2xl font-extrabold text-neutral-900"
                style={{
                  opacity: faceProgress,
                  transform: `translate(${ 40 + faceProgress * (100 * Math.cos(45 * (Math.PI / 180))) }px, ${
                    -120 + faceProgress * (100 * Math.sin(45 * (Math.PI / 180)))
                  }px)`,
                  transition: "transform 0.12s linear, opacity 0.12s linear",
                }}
              >
                The best Ferrari ever built is the next one
              </span>
            </div>
            <div
              className="text-3xl font-black text-neutral-900"
              style={{
                opacity: faceProgress,
                transform: `translate(${ -60 + faceProgress * (80 * Math.cos(270 * (Math.PI / 180))) }px, ${
                  250 + faceProgress * (80 * Math.sin(270 * (Math.PI / 180)))
                }px)`,
                transition: "transform 0.12s linear, opacity 0.12s linear",
              }}
            >
              Italian Excellence that makes the world dream
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 space-y-10 pb-16" />

      <section className="bg-white px-6 pb-16">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 shadow-sm lg:flex-row lg:items-center">
          <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <Image
              src={session?.user ? "/Ferrari Test drive.jpg" : "/Join the family.jpg"}
              alt={session?.user ? "Ferrari Test Drive" : "Join the family"}
              width={800}
              height={600}
              className="h-full w-full object-cover"
              priority={false}
            />
          </div>
          <div className="flex-1 space-y-4">
            <h2 className="text-2xl font-bold text-neutral-900">
              {session?.user ? "Feel the drive before it's yours" : "Join the Ferrari family"}
            </h2>
            <p className="text-sm leading-6 text-neutral-700">
              {session?.user
                ? "Book a test drive and experience the Ferrari you could be driving—performance, sound, and heritage in one lap."
                : "Become part of the Ferrarista community. Get exclusive invites, model news, and priority access to launches, test drives, and events."}
            </p>
            <Link
              href={session?.user ? "/test-drive" : "/auth/signin"}
              className="inline-flex w-fit items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              {session?.user ? "Book a test drive with us" : "Register now"}
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t px-6 py-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/Ferari footer.png"
              alt="Ferrari footer logo"
              width={160}
              height={60}
              className="h-10 w-auto"
            />
            <div className="text-sm text-neutral-600">
              Driving passion and performance.
            </div>
          </div>

          <div className="text-center text-sm text-neutral-500 md:flex-1">
            © {new Date().getFullYear()} Ferrari. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center justify-start gap-4 text-sm text-neutral-700 md:justify-end">
            <a href="#" className="transition hover:text-neutral-500">
              Instagram
            </a>
            <a href="#" className="transition hover:text-neutral-500">
              YouTube
            </a>
            <a href="#" className="transition hover:text-neutral-500">
              X
            </a>
            <a href="#" className="transition hover:text-neutral-500">
              Terms of Service
            </a>
            <a href="#" className="transition hover:text-neutral-500">
              User Agreement
            </a>
          </div>
        </div>
      </footer>

      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-72 flex-col border-l bg-white shadow-xl transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Sidebar"
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="text-lg font-semibold">Menu</div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-md px-2 py-1 text-sm text-neutral-600 transition hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400"
          >
            Close
          </button>
        </div>
        <div className="flex flex-1 items-center justify-center px-5">
          {session?.user ? (
            <div className="flex w-full flex-col gap-3">
              <div className="text-sm text-neutral-700">Hello, {session.user.email}</div>
              <div className="flex gap-2">
                <Link
                  href="/orders"
                  className="w-full rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800 text-center transition hover:border-neutral-500"
                >
                  Orders
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full rounded-md bg-black px-4 py-3 text-sm font-semibold text-white text-center transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="w-full rounded-md bg-black px-4 py-3 text-sm font-semibold text-white text-center transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400"
            >
              Sign In
            </Link>
          )}
        </div>
      </aside>
    </div>
  );
}
