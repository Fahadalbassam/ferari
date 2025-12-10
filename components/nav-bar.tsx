"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { AccountSidebar } from "@/components/account-sidebar";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Browse", href: "/browse" },
  { label: "Test Drive", href: "/test-drive" },
  { label: "More About Ferrari", href: "/more-about" },
];

export default function NavBar() {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between border-b px-6 py-4 bg-white">
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
          {navLinks.map((item) => (
            <Link key={item.label} href={item.href} className="transition-colors hover:text-neutral-600">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              {(session.user as { role?: string }).role === "admin" && (
                <Link
                  href="/admin-dashboard"
                  className="hidden rounded-md border border-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-800 transition hover:border-neutral-400 md:inline-flex"
                >
                  Admin
                </Link>
              )}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
                {session.user.email?.slice(0, 2).toUpperCase()}
              </div>
              <AccountSidebar />
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="rounded-md border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-800 transition hover:border-neutral-400"
            >
              Sign In
            </Link>
          )}
          {/* Mobile menu trigger (existing) */}
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
        <div className="flex flex-1 flex-col gap-3 px-5 py-4">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:border-neutral-400"
              onClick={() => setSidebarOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          {session?.user ? (
            <>
              <Link
                href="/orders"
                className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800 text-center transition hover:border-neutral-500"
                onClick={() => setSidebarOpen(false)}
              >
                Orders
              </Link>
              {(session.user as { role?: string }).role === "admin" && (
                <Link
                  href="/admin-dashboard"
                  className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800 text-center transition hover:border-neutral-500"
                  onClick={() => setSidebarOpen(false)}
                >
                  Admin
                </Link>
              )}
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="w-full rounded-md bg-black px-4 py-3 text-sm font-semibold text-white text-center transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="w-full rounded-md bg-black px-4 py-3 text-sm font-semibold text-white text-center transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400"
              onClick={() => setSidebarOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
