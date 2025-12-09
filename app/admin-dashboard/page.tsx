"use client";

import { useEffect, useMemo, useState } from "react";

type Status = "idle" | "checking" | "prompt" | "ready" | "error";

type Order = {
  id: string;
  orderNumber: string;
  email: string;
  total: number;
  status: string;
  createdAt: string;
};

type TestDrive = {
  id: string;
  requestNumber: string;
  email: string;
  vehicle: string;
  preferredDate: string;
  status: string;
  createdAt: string;
};

export default function AdminDashboardPage() {
  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [requests, setRequests] = useState<TestDrive[]>([]);

  const fetchVerify = async () => {
    setError(null);
    const res = await fetch("/api/admin/verify-access");
    if (res.ok) {
      setStatus("ready");
      return true;
    }
    if (res.status === 401) {
      setStatus("prompt");
      return false;
    }
    setError("Failed to verify admin access");
    setStatus("error");
    return false;
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchVerify();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (status !== "ready") return;
      const [oRes, tRes] = await Promise.all([
        fetch("/api/admin/orders?page=1&limit=20"),
        fetch("/api/admin/testdrives?page=1&limit=20"),
      ]);
      if (oRes.ok) {
        const data = await oRes.json();
        setOrders(data.orders || []);
      }
      if (tRes.ok) {
        const data = await tRes.json();
        setRequests(data.requests || []);
      }
    };
    loadData();
  }, [status]);

  const handleSubmit = async () => {
    setError(null);
    const res = await fetch("/api/admin/verify-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setStatus("ready");
      setPassword("");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Invalid password");
    }
  };

  const orderStats = useMemo(() => {
    const total = orders.length;
    const byStatus = orders.reduce<Record<string, number>>((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});
    return { total, byStatus };
  }, [orders]);

  const requestStats = useMemo(() => {
    const total = requests.length;
    const byStatus = requests.reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});
    return { total, byStatus };
  }, [requests]);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
            <p className="text-sm text-white/60">Orders and Test-Drive Requests</p>
          </div>
        </div>

        {status === "checking" && (
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/70">Verifying access…</div>
        )}

        {status === "prompt" && (
          <div className="rounded-lg border border-white/10 bg-white/5 p-5 text-sm text-white">
            <div className="mb-2 text-base font-semibold">Enter admin root password</div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-white/20 bg-neutral-900 px-3 py-2 text-white"
              placeholder="Admin root password"
            />
            {error && <div className="mt-2 text-xs text-red-300">{error}</div>}
            <button
              onClick={handleSubmit}
              className="mt-3 rounded-md bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/80"
            >
              Verify
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error || "Failed to verify admin access"}
          </div>
        )}

        {status === "ready" && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <StatCard
                title="Orders"
                value={orderStats.total}
                breakdown={orderStats.byStatus}
                accent="from-sky-500/30 via-sky-500/10 to-transparent"
              />
              <StatCard
                title="Test Drives"
                value={requestStats.total}
                breakdown={requestStats.byStatus}
                accent="from-emerald-500/30 via-emerald-500/10 to-transparent"
              />
            </div>

            <section className="space-y-3">
              <div className="text-lg font-semibold">Recent Orders</div>
              <div className="overflow-hidden rounded-lg border border-white/10 bg-white/5">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 text-white/70">
                    <tr>
                      <th className="px-4 py-2 text-left">Order #</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Total</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-t border-white/5">
                        <td className="px-4 py-2">{o.orderNumber}</td>
                        <td className="px-4 py-2 text-white/80">{o.email}</td>
                        <td className="px-4 py-2">${o.total.toLocaleString()}</td>
                        <td className="px-4 py-2">
                          <Badge>{o.status}</Badge>
                        </td>
                        <td className="px-4 py-2 text-white/60">{new Date(o.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                    {!orders.length && (
                      <tr>
                        <td className="px-4 py-3 text-center text-white/60" colSpan={5}>
                          No orders
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-3">
              <div className="text-lg font-semibold">Recent Test-Drive Requests</div>
              <div className="overflow-hidden rounded-lg border border-white/10 bg-white/5">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 text-white/70">
                    <tr>
                      <th className="px-4 py-2 text-left">Request #</th>
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Vehicle</th>
                      <th className="px-4 py-2 text-left">Preferred</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r.id} className="border-t border-white/5">
                        <td className="px-4 py-2">{r.requestNumber}</td>
                        <td className="px-4 py-2 text-white/80">{r.email}</td>
                        <td className="px-4 py-2">{r.vehicle}</td>
                        <td className="px-4 py-2 text-white/60">{r.preferredDate}</td>
                        <td className="px-4 py-2">
                          <Badge>{r.status}</Badge>
                        </td>
                      </tr>
                    ))}
                    {!requests.length && (
                      <tr>
                        <td className="px-4 py-3 text-center text-white/60" colSpan={5}>
                          No requests
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  breakdown,
  accent,
}: {
  title: string;
  value: number;
  breakdown: Record<string, number>;
  accent: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent}`} />
      <div className="relative space-y-2">
        <div className="text-sm text-white/70">{title}</div>
        <div className="text-2xl font-semibold">{value}</div>
        <div className="flex flex-wrap gap-2 text-xs text-white/70">
          {Object.entries(breakdown).map(([k, v]) => (
            <span key={k} className="rounded-full border border-white/20 px-2 py-1">
              {k}: {v}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Badge({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-2 py-1 text-xs font-semibold text-white">
      {children}
    </span>
  );
}

