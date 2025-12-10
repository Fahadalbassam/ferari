import Image from "next/image";
import Link from "next/link";

type ThankYouSearchParams = { order?: string | string[] };

export default function ThankYouPage({ searchParams = {} as ThankYouSearchParams }: { searchParams?: ThankYouSearchParams }) {
  const rawOrder = searchParams.order;
  const order = Array.isArray(rawOrder) ? rawOrder[0] : rawOrder;
  return (
    <main className="min-h-screen bg-white px-6 py-14 text-neutral-900">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 rounded-xl border border-neutral-200 bg-neutral-50 p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="relative h-20 w-32 overflow-hidden rounded-md bg-white shadow-sm">
            <Image
              src="/ferrari-logo-png_seeklogo-512505.png"
              alt="Ferrari logo"
              fill
              sizes="180px"
              className="object-contain p-2"
              priority
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Welcome to the Ferrari family</h1>
            <p className="text-sm text-neutral-600">
              Thank you for your purchase request{order ? ` (${order})` : ""}. Our team will invoice and confirm next
              steps shortly.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Home
          </Link>
          <Link
            href="/browse"
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:border-neutral-400"
          >
            Continue browsing
          </Link>
          <Link
            href="/more-about"
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:border-neutral-400"
          >
            Learn more about Ferrari
          </Link>
        </div>
      </div>
    </main>
  );
}

