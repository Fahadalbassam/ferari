import { ObjectId } from "mongodb";
import slugify from "slugify";
import { getDb } from "../db";

export type CarRecord = {
  _id: ObjectId;
  model: string;
  slug: string;
  price: number;
  currency: string;
  type: "buy" | "rent" | "both";
  colors: string[];
  images: string[];
  inventory: number;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
};

export async function listCars(options?: { status?: "active" | "inactive"; slug?: string }) {
  const db = await getDb();
  const query: Record<string, unknown> = {};
  if (options?.status) query.status = options.status;
  if (options?.slug) query.slug = options.slug;
  const cars = await db.collection<CarRecord>("cars").find(query).sort({ createdAt: -1 }).toArray();
  return cars;
}

export async function getCarById(id: string) {
  const db = await getDb();
  return db.collection<CarRecord>("cars").findOne({ _id: new ObjectId(id) });
}

export async function getCarBySlug(slug: string) {
  const db = await getDb();
  return db.collection<CarRecord>("cars").findOne({ slug });
}

export async function createCar(input: {
  model: string;
  price: number;
  currency: string;
  type: "buy" | "rent" | "both";
  colors?: string[];
  images?: string[];
  inventory?: number;
  status?: "active" | "inactive";
}) {
  const db = await getDb();
  const slug = slugify(input.model, { lower: true, strict: true });
  const doc: Omit<CarRecord, "_id"> = {
    model: input.model,
    slug,
    price: input.price,
    currency: input.currency,
    type: input.type,
    colors: input.colors ?? [],
    images: input.images ?? [],
    inventory: input.inventory ?? 0,
    status: input.status ?? "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const res = await db.collection<CarRecord>("cars").insertOne(doc as CarRecord);
  return { ...doc, _id: res.insertedId };
}

export async function updateCar(id: string, updates: Partial<Omit<CarRecord, "_id" | "createdAt">>) {
  const db = await getDb();
  const toSet: Record<string, unknown> = { ...updates, updatedAt: new Date() };
  if (updates?.model) {
    toSet.slug = slugify(updates.model, { lower: true, strict: true });
  }
  await db.collection<CarRecord>("cars").updateOne({ _id: new ObjectId(id) }, { $set: toSet });
  return getCarById(id);
}

export async function adjustInventory(id: string, delta: number) {
  const db = await getDb();
  const res = await db
    .collection<CarRecord>("cars")
    .findOneAndUpdate({ _id: new ObjectId(id), inventory: { $gte: Math.max(0, -delta) } }, { $inc: { inventory: delta }, $set: { updatedAt: new Date() } }, { returnDocument: "after" });
  return res.value;
}

