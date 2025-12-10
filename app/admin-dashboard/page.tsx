"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Status = "idle" | "checking" | "prompt" | "ready" | "error";

type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";
type TestDriveStatus = "new" | "confirmed" | "completed" | "cancelled";

const ORDER_STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "delivered", "cancelled"];
const TD_STATUSES: TestDriveStatus[] = ["new", "confirmed", "completed", "cancelled"];
const RENT_RATE = 0.05;

type Order = {
  id: string;
  orderNumber: string;
  buyerEmail: string;
  buyerName: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  currency: string;
  tracking?: string;
};

type TestDrive = {
  id: string;
  requestNumber: string;
  email: string;
  vehicle: string;
  preferredDate: string;
  status: TestDriveStatus;
  createdAt: string;
  notes?: string;
};

type Car = {
  _id: string;
  model: string;
  price: number;
  rentalPrice?: number;
  currency: string;
  type: "buy" | "rent" | "both";
  category: string;
  year?: number;
  inventory: number;
  status: string;
  slug?: string;
};

export default function AdminDashboardPage() {
  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [requests, setRequests] = useState<TestDrive[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [ordersMeta, setOrdersMeta] = useState({ page: 1, totalPages: 1 });
  const [requestsMeta, setRequestsMeta] = useState({ page: 1, totalPages: 1 });
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [updatingRequestId, setUpdatingRequestId] = useState<string | null>(null);

  const [newCar, setNewCar] = useState({
    model: "",
    price: "",
    currency: "SAR",
    type: "buy",
    category: "berlinetta",
    year: String(new Date().getFullYear()),
    inventory: "0",
  });
  const [newCarImages, setNewCarImages] = useState<string[]>([]);
  const [newCarDetails, setNewCarDetails] = useState("");
  const [creatingCar, setCreatingCar] = useState(false);
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [editingCarId, setEditingCarId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Car> | null>(null);
  const [editMessage, setEditMessage] = useState<string | null>(null);
  const [savingCarId, setSavingCarId] = useState<string | null>(null);
  const [deletingCarId, setDeletingCarId] = useState<string | null>(null);

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

  const loadData = async (opts?: { ordersPage?: number; requestsPage?: number }) => {
    if (status !== "ready") return;
    const ordersPage = opts?.ordersPage ?? ordersMeta.page;
    const requestsPage = opts?.requestsPage ?? requestsMeta.page;
    const [oRes, tRes, cRes] = await Promise.all([
      fetch(`/api/admin/orders?page=${ordersPage}&limit=20`),
      fetch(`/api/admin/testdrives?page=${requestsPage}&limit=20`),
      fetch("/api/admin/cars"),
    ]);
    if (oRes.ok) {
      const data = await oRes.json();
      setOrders(data.orders || []);
      setOrdersMeta({ page: data.page ?? ordersPage, totalPages: data.totalPages ?? 1 });
    }
    if (tRes.ok) {
      const data = await tRes.json();
      setRequests(data.requests || []);
      setRequestsMeta({ page: data.page ?? requestsPage, totalPages: data.totalPages ?? 1 });
    }
    if (cRes.ok) {
      const data = await cRes.json();
      setCars(data.cars || []);
    }
  };

  useEffect(() => {
    fetchVerify();
  }, []);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    if (!editingCarId || !editDraft) return;
    if (editDraft.type === "rent" || editDraft.type === "both") {
      const basePrice = Number(editDraft.price ?? 0);
      const derivedRental = Math.round(basePrice * RENT_RATE);
      if (Number.isFinite(derivedRental) && editDraft.rentalPrice !== derivedRental) {
        setEditDraft((prev) => (prev ? { ...prev, rentalPrice: derivedRental } : prev));
      }
    }
  }, [editDraft, editingCarId]);

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

  const carStats = useMemo(() => {
    const total = cars.length;
    const active = cars.filter((c) => c.status === "active").length;
    return { total, active };
  }, [cars]);

  const handleCreateCar = async () => {
    setError(null);
    setCreateMessage(null);
    const numericPrice = Number(String(newCar.price).replace(/,/g, "").trim());
    const numericYear = Number(newCar.year);
    const numericInventory = Number(String(newCar.inventory || "0").replace(/,/g, "").trim() || "0");
    if (!newCar.model || !newCar.currency || !newCar.category || !newCar.year || !newCar.type) {
      setCreateMessage("Please fill model, currency, category, year, and type.");
      return;
    }
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setCreateMessage("Price must be a valid number greater than 0 (no commas).");
      return;
    }
    if (!Number.isFinite(numericYear) || numericYear < 1900) {
      setCreateMessage("Year must be a valid number (>= 1900).");
      return;
    }
    if (!Number.isFinite(numericInventory) || numericInventory < 0) {
      setCreateMessage("Inventory must be 0 or more.");
      return;
    }
    setCreatingCar(true);
    const rentalPrice = Math.round(numericPrice * RENT_RATE);
    const payload = {
      model: newCar.model,
      price: numericPrice,
      rentalPrice,
      currency: newCar.currency,
      type: newCar.type as "buy" | "rent" | "both",
      category: newCar.category,
      year: numericYear,
      inventory: numericInventory,
      images: newCarImages.slice(0, 5),
      details: newCarDetails || undefined,
    };
    try {
      const res = await fetch("/api/admin/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create car");
      }
      const data = await res.json();
      setCars((prev) => [data.car, ...prev]);
      setNewCar({
        model: "",
        price: "",
        currency: "SAR",
        type: "buy",
        category: "general",
        year: String(new Date().getFullYear()),
        inventory: "0",
      });
      setNewCarImages([]);
      setNewCarDetails("");
      setCreateMessage("Car posted successfully.");
    } catch (err) {
      const message = (err as Error).message || "Failed to create car";
      setError(message);
      setCreateMessage(message);
    } finally {
      setCreatingCar(false);
    }
  };

  const startEdit = (car: Car) => {
    setEditingCarId(car._id);
    setEditDraft({
      ...car,
      price: car.price,
      rentalPrice: car.rentalPrice ?? Math.round(car.price * RENT_RATE),
      inventory: car.inventory,
    });
    setEditMessage(null);
  };

  const cancelEdit = () => {
    setEditingCarId(null);
    setEditDraft(null);
    setEditMessage(null);
  };

  const saveEdit = async () => {
    if (!editingCarId || !editDraft) return;
    setSavingCarId(editingCarId);
    setEditMessage(null);
    try {
      const res = await fetch("/api/admin/cars", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingCarId,
          model: editDraft.model,
          price: editDraft.price,
          currency: editDraft.currency,
          type: editDraft.type,
          category: editDraft.category,
          year: editDraft.year,
          rentalPrice: editDraft.rentalPrice,
          inventory: editDraft.inventory,
          status: editDraft.status,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update car");
      }
      const data = await res.json();
      setCars((prev) => prev.map((c) => (c._id === editingCarId ? { ...c, ...data.car } : c)));
      setEditMessage("Updated successfully.");
      setEditingCarId(null);
      setEditDraft(null);
    } catch (err) {
      setEditMessage((err as Error).message);
    } finally {
      setSavingCarId(null);
    }
  };

  const handleDelete = async (carId: string) => {
    if (!confirm("Delete this car? This cannot be undone.")) return;
    setDeletingCarId(carId);
    setError(null);
    try {
      const res = await fetch("/api/admin/cars", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: carId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete car");
      }
      setCars((prev) => prev.filter((c) => c._id !== carId));
      if (editingCarId === carId) cancelEdit();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeletingCarId(null);
    }
  };

  const handleOrderStatus = async (id: string, nextStatus: OrderStatus) => {
    setUpdatingOrderId(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update order");
      }
      const data = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...data.order } : o)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleTestDriveStatus = async (id: string, nextStatus: TestDriveStatus) => {
    setUpdatingRequestId(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/testdrives", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update request");
      }
      const data = await res.json();
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, ...data.request } : r)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdatingRequestId(null);
    }
  };

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
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard
                title="Cars"
                value={carStats.total}
                breakdown={{ active: carStats.active, inactive: carStats.total - carStats.active }}
                accent="from-purple-500/30 via-purple-500/10 to-transparent"
              />
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
              <div className="text-lg font-semibold">Inventory</div>
              <div className="grid gap-3 rounded-lg border border-white/10 bg-white/5 p-4 lg:grid-cols-2">
                <div className="space-y-3">
                  <div className="text-sm text-white/80">Add / Post car</div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      value={newCar.model}
                      onChange={(e) => setNewCar((p) => ({ ...p, model: e.target.value }))}
                      placeholder="Model"
                      className="w-full rounded-md border border-white/20 bg-neutral-900 px-3 py-2 text-sm text-white"
                    />
                    <input
                      value={newCar.price}
                      onChange={(e) => setNewCar((p) => ({ ...p, price: e.target.value }))}
                      placeholder="Price"
                      className="w-full rounded-md border border-white/20 bg-neutral-900 px-3 py-2 text-sm text-white"
                    />
                    <input
                      value={newCar.currency}
                      onChange={(e) => setNewCar((p) => ({ ...p, currency: e.target.value }))}
                      placeholder="Currency (USD/SAR)"
                      className="w-full rounded-md border border-white/20 bg-neutral-900 px-3 py-2 text-sm text-white"
                    />
                    <input
                      value={newCar.year}
                      onChange={(e) => setNewCar((p) => ({ ...p, year: e.target.value }))}
                      placeholder="Year"
                      type="number"
                      min={1980}
                      max={new Date().getFullYear() + 1}
                      className="w-full rounded-md border border-white/20 bg-neutral-900 px-3 py-2 text-sm text-white"
                    />
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs text-white/70">Images (webp, png, jpg, jpeg, avif)</label>
                      <input
                        type="file"
                        accept=".webp,.png,.jpg,.jpeg,.avif,image/webp,image/png,image/jpeg,image/avif"
                        multiple
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          const urls: string[] = [];
                          for (const file of files) {
                            const dataUrl = await new Promise<string>((resolve, reject) => {
                              const reader = new FileReader();
                              reader.onload = () => resolve(reader.result as string);
                              reader.onerror = () => reject(reader.error);
                              reader.readAsDataURL(file);
                            });
                            urls.push(dataUrl);
                          }
                          setNewCarImages(urls);
                        }}
                        className="w-full rounded-md border border-white/20 bg-neutral-900 px-3 py-2 text-sm text-white"
                      />
                      {!!newCarImages.length && (
                        <div className="text-xs text-white/70">{newCarImages.length} image(s) selected</div>
                      )}
                    </div>
                    <select
                      value={newCar.category}
                      onChange={(e) => setNewCar((p) => ({ ...p, category: e.target.value }))}
                      className="w-full rounded-md border border-white/20 bg-neutral-900 px-3 py-2 text-sm text-white"
                    >
                      <option value="berlinetta">Type: Berlinetta (mid-engine)</option>
                      <option value="spider">Type: Spider / Aperta</option>
                      <option value="gt">Type: GT / 2+2</option>
                      <option value="track">Type: Track / Pista</option>
                      <option value="icona">Type: Icona / Limited</option>
                      <option value="special">Type: Special Series</option>
                      <option value="classic">Type: Classic</option>
                      <option value="general">Type: General</option>
                    </select>
                    <select
                      value={newCar.type}
                      onChange={(e) => setNewCar((p) => ({ ...p, type: e.target.value }))}
                      className="w-full rounded-md border border-white/20 bg-neutral-900 px-3 py-2 text-sm text-white"
                    >
                      <option value="buy">Buy</option>
                      <option value="rent">Rent</option>
                      <option value="both">Both</option>
                    </select>
                    <input
                      value={newCar.inventory}
                      onChange={(e) => setNewCar((p) => ({ ...p, inventory: e.target.value }))}
                      placeholder="Inventory"
                      className="w-full rounded-md border border-white/20 bg-neutral-900 px-3 py-2 text-sm text-white"
                    />
                    <textarea
                      value={newCarDetails}
                      onChange={(e) => setNewCarDetails(e.target.value)}
                      placeholder="Details / description"
                      className="sm:col-span-2 w-full rounded-md border border-white/20 bg-neutral-900 px-3 py-2 text-sm text-white"
                      rows={3}
                    />
                  </div>
                  <button
                    onClick={handleCreateCar}
                    disabled={creatingCar}
                    className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/80 disabled:opacity-60"
                  >
                    {creatingCar ? "Posting…" : "Post car to browse"}
                  </button>
                  {createMessage && (
                    <div className="text-xs text-white/80">{createMessage}</div>
                  )}
                </div>
                <div className="space-y-2 text-sm text-white/70">
                  <div className="font-semibold text-white">Guidelines</div>
                  <ul className="list-disc space-y-1 pl-4">
                    <li>Set inventory to allow buy/test-drive.</li>
                    <li>Price and currency appear on browse cards.</li>
                    <li>Add images later via edit if needed.</li>
                  </ul>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg border border-white/10 bg-white/5">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 text-white/70">
                    <tr>
                      <th className="px-4 py-2 text-left">Model</th>
                      <th className="px-4 py-2 text-left">Year</th>
                      <th className="px-4 py-2 text-left">Price</th>
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-left">Listing</th>
                      <th className="px-4 py-2 text-left">Inventory</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cars.map((c) => (
                      <tr key={c._id} className="border-t border-white/5">
                        {editingCarId === c._id ? (
                          <>
                            <td className="px-4 py-2">
                              <input
                                value={editDraft?.model ?? ""}
                                onChange={(e) => setEditDraft((p) => ({ ...(p || {}), model: e.target.value }))}
                                className="w-full rounded-md border border-white/20 bg-neutral-900 px-2 py-1 text-sm text-white"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                value={editDraft?.year ?? ""}
                                onChange={(e) => setEditDraft((p) => ({ ...(p || {}), year: Number(e.target.value) }))}
                                className="w-full rounded-md border border-white/20 bg-neutral-900 px-2 py-1 text-sm text-white"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex gap-2">
                                <input
                                  value={editDraft?.price ?? ""}
                                  onChange={(e) => setEditDraft((p) => ({ ...(p || {}), price: Number(e.target.value) }))}
                                  className="w-full rounded-md border border-white/20 bg-neutral-900 px-2 py-1 text-sm text-white"
                                />
                                <input
                                  value={editDraft?.currency ?? ""}
                                  onChange={(e) => setEditDraft((p) => ({ ...(p || {}), currency: e.target.value }))}
                                  className="w-20 rounded-md border border-white/20 bg-neutral-900 px-2 py-1 text-sm text-white"
                                />
                              </div>
                              {(editDraft?.type === "rent" || editDraft?.type === "both") && (
                                <div className="mt-1 text-xs text-white/70">
                                  Rent ({Math.round(RENT_RATE * 100)}%): {editDraft?.currency ?? ""}{" "}
                                  {(editDraft?.rentalPrice ?? Math.round((editDraft?.price ?? 0) * RENT_RATE)).toLocaleString()}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-2">
                              <select
                                value={editDraft?.category ?? "general"}
                                onChange={(e) => setEditDraft((p) => ({ ...(p || {}), category: e.target.value }))}
                                className="w-full rounded-md border border-white/20 bg-neutral-900 px-2 py-1 text-sm text-white"
                              >
                                <option value="berlinetta">Berlinetta (mid-engine)</option>
                                <option value="spider">Spider / Aperta</option>
                                <option value="gt">GT / 2+2</option>
                                <option value="track">Track / Pista</option>
                                <option value="icona">Icona / Limited</option>
                                <option value="special">Special Series</option>
                                <option value="classic">Classic</option>
                                <option value="general">General</option>
                              </select>
                            </td>
                            <td className="px-4 py-2">
                              <select
                                value={editDraft?.type ?? "buy"}
                                onChange={(e) => setEditDraft((p) => ({ ...(p || {}), type: e.target.value as Car["type"] }))}
                                className="w-full rounded-md border border-white/20 bg-neutral-900 px-2 py-1 text-sm text-white"
                              >
                                <option value="buy">Buy</option>
                                <option value="rent">Rent</option>
                                <option value="both">Both</option>
                              </select>
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                value={editDraft?.inventory ?? ""}
                                onChange={(e) => setEditDraft((p) => ({ ...(p || {}), inventory: Number(e.target.value) }))}
                                className="w-full rounded-md border border-white/20 bg-neutral-900 px-2 py-1 text-sm text-white"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <select
                                value={editDraft?.status ?? "active"}
                                onChange={(e) => setEditDraft((p) => ({ ...(p || {}), status: e.target.value }))}
                                className="w-full rounded-md border border-white/20 bg-neutral-900 px-2 py-1 text-sm text-white"
                              >
                                <option value="active">active</option>
                                <option value="inactive">inactive</option>
                              </select>
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={saveEdit}
                                  disabled={savingCarId === c._id}
                                  className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-black hover:bg-white/80 disabled:opacity-60"
                                >
                                  {savingCarId === c._id ? "Saving…" : "Save"}
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="rounded-md border border-white/30 px-2 py-1 text-xs font-semibold text-white hover:bg-white/10"
                                >
                                  Cancel
                                </button>
                              </div>
                              {editMessage && <div className="mt-1 text-xs text-white/70">{editMessage}</div>}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-2">{c.model}</td>
                            <td className="px-4 py-2">{c.year ?? "—"}</td>
                            <td className="px-4 py-2">
                              {c.currency} {c.price.toLocaleString()}
                              {(c.type === "rent" || c.type === "both") && (
                                <div className="text-xs text-white/70">
                                  Rent: {c.currency} {(c.rentalPrice ?? Math.round(c.price * RENT_RATE)).toLocaleString()}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-2">{c.category}</td>
                            <td className="px-4 py-2">{c.type}</td>
                            <td className="px-4 py-2">{c.inventory}</td>
                            <td className="px-4 py-2">
                              <Badge>{c.status}</Badge>
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => startEdit(c)}
                                  className="rounded-md border border-white/30 px-2 py-1 text-xs font-semibold text-white hover:bg-white/10"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(c._id)}
                                  disabled={deletingCarId === c._id}
                                  className="rounded-md border border-red-300 px-2 py-1 text-xs font-semibold text-red-100 hover:bg-red-600/20 disabled:opacity-60"
                                >
                                  {deletingCarId === c._id ? "Deleting…" : "Delete"}
                                </button>
                                {c.slug ? (
                                  <>
                                    <Link
                                      href={`/browse/${c.slug}`}
                                      className="rounded-md border border-white/30 px-2 py-1 text-xs font-semibold text-white hover:bg-white/10"
                                    >
                                      Buy now
                                    </Link>
                                    <Link
                                      href={`/browse/${c.slug}`}
                                      className="rounded-md border border-white/30 px-2 py-1 text-xs font-semibold text-white hover:bg-white/10"
                                    >
                                      Book test drive
                                    </Link>
                                  </>
                                ) : (
                                  <span className="text-xs text-white/60">No slug</span>
                                )}
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                    {!cars.length && (
                      <tr>
                        <td className="px-4 py-3 text-center text-white/60" colSpan={8}>
                          No cars posted yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

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
                    <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-t border-white/5">
                        <td className="px-4 py-2">{o.orderNumber}</td>
                        <td className="px-4 py-2 text-white/80">{o.buyerEmail}</td>
                        <td className="px-4 py-2">${o.total.toLocaleString()}</td>
                        <td className="px-4 py-2">
                          <Badge>{o.status}</Badge>
                        </td>
                        <td className="px-4 py-2 text-white/60">{new Date(o.createdAt).toLocaleString()}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <select
                              value={o.status}
                              onChange={(e) => handleOrderStatus(o.id, e.target.value as OrderStatus)}
                              disabled={updatingOrderId === o.id}
                              className="rounded-md border border-white/20 bg-neutral-900 px-2 py-1 text-xs text-white"
                            >
                              {ORDER_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                            {updatingOrderId === o.id && <span className="text-xs text-white/60">Updating…</span>}
                          </div>
                        </td>
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
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>
                  Page {ordersMeta.page} of {ordersMeta.totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const next = Math.max(1, ordersMeta.page - 1);
                      setOrdersMeta((p) => ({ ...p, page: next }));
                      loadData({ ordersPage: next });
                    }}
                    disabled={ordersMeta.page <= 1}
                    className="rounded-md border border-white/20 px-2 py-1 text-xs text-white disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => {
                      const next = Math.min(ordersMeta.totalPages, ordersMeta.page + 1);
                      setOrdersMeta((p) => ({ ...p, page: next }));
                      loadData({ ordersPage: next });
                    }}
                    disabled={ordersMeta.page >= ordersMeta.totalPages}
                    className="rounded-md border border-white/20 px-2 py-1 text-xs text-white disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
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
                      <th className="px-4 py-2 text-left">Actions</th>
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
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <select
                              value={r.status}
                              onChange={(e) => handleTestDriveStatus(r.id, e.target.value as TestDriveStatus)}
                              disabled={updatingRequestId === r.id}
                              className="rounded-md border border-white/20 bg-neutral-900 px-2 py-1 text-xs text-white"
                            >
                              {TD_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                            {updatingRequestId === r.id && <span className="text-xs text-white/60">Updating…</span>}
                          </div>
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
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>
                  Page {requestsMeta.page} of {requestsMeta.totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const next = Math.max(1, requestsMeta.page - 1);
                      setRequestsMeta((p) => ({ ...p, page: next }));
                      loadData({ requestsPage: next });
                    }}
                    disabled={requestsMeta.page <= 1}
                    className="rounded-md border border-white/20 px-2 py-1 text-xs text-white disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => {
                      const next = Math.min(requestsMeta.totalPages, requestsMeta.page + 1);
                      setRequestsMeta((p) => ({ ...p, page: next }));
                      loadData({ requestsPage: next });
                    }}
                    disabled={requestsMeta.page >= requestsMeta.totalPages}
                    className="rounded-md border border-white/20 px-2 py-1 text-xs text-white disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
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
      <div className={`pointer-events-none absolute inset-0 bg-linear-to-br ${accent}`} />
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
