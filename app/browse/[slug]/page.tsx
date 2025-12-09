import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { samplePosts } from "@/lib/samplePosts";

export default function PostDetail({ params }: { params: { slug: string } }) {
  const post = samplePosts.find((p) => p.slug === params.slug);
  if (!post) return notFound();

  const showBuy = post.type === "buy" || post.type === "both" || !post.type;
  const showRent = post.type === "rent" || post.type === "both";

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Image src="/ferrari-logo-png_seeklogo-512505.png" alt="Ferrari logo" width={44} height={44} priority />
          <div className="text-sm text-neutral-600">Listing details</div>
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex text-neutral-800">
          {[
            { label: "Home", href: "/" },
            { label: "Browse", href: "/browse" },
          ].map((item) => (
            <Link key={item.label} href={item.href} className="text-neutral-700 transition hover:text-neutral-900">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 lg:px-0">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="relative h-80 w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
            {post.images[0] ? (
              <Image src={post.images[0]} alt={post.title} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-neutral-500">No image</div>
            )}
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wide text-neutral-500">{post.category}</div>
              <h1 className="text-2xl font-semibold">{post.title}</h1>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-neutral-700">
              <span className="rounded-full bg-neutral-100 px-3 py-1">{post.city}</span>
              <span className="rounded-full bg-neutral-100 px-3 py-1">{post.university}</span>
              <span className="rounded-full bg-neutral-100 px-3 py-1">{post.subcategory}</span>
            </div>
            <div className="flex items-center gap-3 text-lg font-semibold">
              <Image src="/SAR.png" alt="SAR" width={22} height={16} className="h-5 w-auto" />
              <span>{post.price.toLocaleString()}</span>
              {post.priceNegotiable && (
                <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-800">Negotiable</span>
              )}
            </div>
            <div className="text-sm leading-6 text-neutral-700">{post.description}</div>
            <div className="flex items-center gap-3 text-sm text-neutral-700">
              <span className="rounded-full bg-neutral-100 px-2 py-1">Seller: {post.userName}</span>
              <span className="rounded-full bg-neutral-100 px-2 py-1">
                ★ {post.sellerRating.toFixed(1)} · {post.reviewCount} reviews
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-neutral-700">
              {post.colors?.length ? (
                <span className="rounded-full bg-neutral-100 px-3 py-1">
                  Colors: {post.colors.join(", ")}
                </span>
              ) : null}
              {typeof post.inventory === "number" && (
                <span className="rounded-full bg-neutral-100 px-3 py-1">In stock: {post.inventory}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              {showBuy && (
                <Link
                  href={`/checkout?slug=${post.slug}&mode=buy`}
                  className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  Buy now
                </Link>
              )}
              {showRent && (
                <Link
                  href={`/checkout?slug=${post.slug}&mode=rent`}
                  className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:border-neutral-500"
                >
                  Rent now
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 text-sm text-neutral-700">
          <div className="mb-2 text-base font-semibold text-neutral-900">Vehicle highlights</div>
          <ul className="list-disc space-y-1 pl-5">
            <li>Category: {post.category}</li>
            <li>Subcategory: {post.subcategory}</li>
            <li>Location: {post.city}</li>
            <li>Created: {post.createdAt}</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

