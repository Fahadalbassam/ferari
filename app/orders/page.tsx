import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";

export default async function OrdersPage() {
  const session = await getServerAuthSession();
  const userId = (session as { user?: { id?: string } } | null)?.user?.id;
  if (!userId) {
    redirect("/auth/signin");
  }

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-neutral-900">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold">Your orders</h1>
          <p className="text-sm text-neutral-600">
            Orders are tied to your account. (Placeholder view — replace with real order data.)
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-700">
          No orders yet.
        </div>
      </div>
    </main>
  );
}

