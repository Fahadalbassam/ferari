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
  category: string; // sedan, suv, truck, coupe, convertible, ev, hybrid, luxury, offroad, van
  trim?: string;
  year?: number;
  location?: string;
  condition?: "new" | "used" | "certified";
  rating?: number;
  reviewsCount?: number;
  colors: string[];
  images: string[];
  details?: string;
  inventory: number;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
};

export type CarQueryOptions = {
  status?: "active" | "inactive";
  slug?: string;
  category?: string;
  type?: "buy" | "rent" | "both";
  search?: string;
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  conditions?: Array<"new" | "used" | "certified">;
  location?: string;
  inStockOnly?: boolean;
  limit?: number;
  skip?: number;
  sort?: "recent" | "price-asc" | "price-desc";
};

const DEFAULT_CATEGORY = "general";

export async function listCars(options?: { status?: "active" | "inactive"; slug?: string }) {
  const { cars } = await queryCars({ ...options, includeTotal: false });
  return cars;
}

export async function queryCars(options: CarQueryOptions & { includeTotal?: boolean } = {}) {
  const db = await getDb();
  const query: Record<string, unknown> = {};

  if (options.status) query.status = options.status;
  if (options.slug) query.slug = options.slug;
  if (options.category) query.category = options.category;
  if (options.type) query.type = options.type;
  if (options.priceMin !== undefined || options.priceMax !== undefined) {
    query.price = {};
    if (options.priceMin !== undefined) (query.price as Record<string, number>).$gte = options.priceMin;
    if (options.priceMax !== undefined) (query.price as Record<string, number>).$lte = options.priceMax;
  }
  if (options.yearMin !== undefined || options.yearMax !== undefined) {
    query.year = {};
    if (options.yearMin !== undefined) (query.year as Record<string, number>).$gte = options.yearMin;
    if (options.yearMax !== undefined) (query.year as Record<string, number>).$lte = options.yearMax;
  }
  if (options.conditions?.length) {
    query.condition = { $in: options.conditions };
  }
  if (options.location) {
    query.location = { $regex: options.location, $options: "i" };
  }
  if (options.inStockOnly) {
    query.inventory = { $gt: 0 };
  }
  if (options.search) {
    const regex = { $regex: options.search, $options: "i" };
    query.$or = [
      { model: regex },
      { trim: regex },
      { category: regex },
      { location: regex },
    ];
  }

  const limit = Math.min(Math.max(options.limit ?? 24, 1), 200);
  const skip = Math.max(options.skip ?? 0, 0);

  const sort: Record<string, 1 | -1> =
    options.sort === "price-asc"
      ? { price: 1 }
      : options.sort === "price-desc"
        ? { price: -1 }
        : { createdAt: -1 };

  const collection = db.collection<CarRecord>("cars");
  const cursor = collection.find(query).sort(sort).skip(skip).limit(limit);
  const cars = await cursor.toArray();

  const total = options.includeTotal ? await collection.countDocuments(query) : undefined;

  // Normalize category to avoid undefined entries in existing data.
  const normalizedCars = cars.map((c) => ({
    ...c,
    category: c.category || DEFAULT_CATEGORY,
  }));

  return { cars: normalizedCars, total: total ?? normalizedCars.length };
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
  category?: string;
  trim?: string;
  year?: number;
  location?: string;
  condition?: "new" | "used" | "certified";
  rating?: number;
  reviewsCount?: number;
  colors?: string[];
  images?: string[];
  details?: string;
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
    category: input.category ?? DEFAULT_CATEGORY,
    trim: input.trim,
    year: input.year ?? new Date().getFullYear(),
    location: input.location,
    condition: input.condition,
    rating: input.rating,
    reviewsCount: input.reviewsCount,
    colors: input.colors ?? [],
    images: input.images ?? [],
    details: input.details,
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

