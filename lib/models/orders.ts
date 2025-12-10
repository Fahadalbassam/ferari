import { ObjectId } from "mongodb";
import { getDb } from "../db";

export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

export type OrderRecord = {
  _id: ObjectId;
  orderNumber: string;
  carId: ObjectId;
  carModel: string;
  price: number;
  currency: string;
  buyerEmail: string;
  buyerName: string;
  status: OrderStatus;
  address?: string;
  tracking?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function createOrder(input: {
  carId: ObjectId;
  carModel: string;
  price: number;
  currency: string;
  buyerEmail: string;
  buyerName: string;
  address?: string;
}) {
  const db = await getDb();
  const count = await db.collection<OrderRecord>("orders").countDocuments();
  const orderNumber = `ORD-${1000 + count + 1}`;
  const doc: Omit<OrderRecord, "_id"> = {
    orderNumber,
    carId: input.carId,
    carModel: input.carModel,
    price: input.price,
    currency: input.currency,
    buyerEmail: input.buyerEmail,
    buyerName: input.buyerName,
    address: input.address,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const res = await db.collection<OrderRecord>("orders").insertOne(doc as OrderRecord);
  return { ...doc, _id: res.insertedId };
}

export async function listOrders(options: { status?: OrderStatus; q?: string; page?: number; limit?: number }) {
  const db = await getDb();
  const query: Record<string, unknown> = {};
  if (options.status) query.status = options.status;
  if (options.q) {
    query.$or = [
      { orderNumber: { $regex: options.q, $options: "i" } },
      { buyerEmail: { $regex: options.q, $options: "i" } },
    ];
  }
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const skip = (page - 1) * limit;
  const total = await db.collection<OrderRecord>("orders").countDocuments(query);
  const orders = await db.collection<OrderRecord>("orders").find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray();
  return { total, page, limit, orders };
}

export async function getOrderById(id: string) {
  const db = await getDb();
  return db.collection<OrderRecord>("orders").findOne({ _id: new ObjectId(id) });
}

export async function updateOrder(id: string, updates: Partial<Pick<OrderRecord, "status" | "tracking" | "address" | "notes">>) {
  const db = await getDb();
  await db
    .collection<OrderRecord>("orders")
    .updateOne({ _id: new ObjectId(id) }, { $set: { ...updates, updatedAt: new Date() } });
  return getOrderById(id);
}





