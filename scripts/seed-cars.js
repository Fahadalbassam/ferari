// Seed a sample car if the collection is empty.
// Run with:
//   node -r dotenv/config scripts/seed-cars.js
import { MongoClient } from "mongodb";

async function main() {
  const uri = process.env.MONGODB_URI || process.env.MONGODB_URL_MONGODB_URI;
  const dbName = process.env.MONGODB_DB;
  if (!uri || !dbName) throw new Error("Missing MONGODB_URI (or MONGODB_URL_MONGODB_URI) or MONGODB_DB");

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const count = await db.collection("cars").countDocuments();
  if (count === 0) {
    const now = new Date();
    await db.collection("cars").insertOne({
      model: "Ferrari Sample",
      slug: "ferrari-sample",
      price: 250000,
      currency: "USD",
      type: "buy",
      category: "general",
      colors: ["red"],
      images: [],
      inventory: 1,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
    console.log("Inserted sample car");
  } else {
    console.log("Cars collection not empty, skipping");
  }
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

