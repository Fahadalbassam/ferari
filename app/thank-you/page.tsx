import Link from "next/link";

export default function ThankYouPage({ searchParams }: { searchParams: { order?: string } }) {
  const order = searchParams?.order;
  return (
    <main className="min-h-screen bg-white px-6 py-14 text-neutral-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-xl border border-neutral-200 bg-neutral-50 p-8 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold">Welcome to the Ferrari family</h1>
          <p className="text-sm text-neutral-600">
            Thank you for your purchase request{order ? ` (${order})` : ""}. Our team will invoice and confirm next steps
            shortly.
          </p>
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
        </div>
      </div>
    </main>
  );
}

