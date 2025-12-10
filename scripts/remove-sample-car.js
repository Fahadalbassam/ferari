// Remove sample car by slug. Run with:
//   node -r dotenv/config scripts/remove-sample-car.js
import { MongoClient } from "mongodb";

async function main() {
  const uri = process.env.MONGODB_URI || process.env.MONGODB_URL_MONGODB_URI;
  const dbName = process.env.MONGODB_DB;
  if (!uri || !dbName) throw new Error("Missing MONGODB_URI (or MONGODB_URL_MONGODB_URI) or MONGODB_DB");

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const res = await db.collection("cars").deleteOne({ slug: "ferrari-sample" });
  console.log("Deleted sample car count:", res.deletedCount);

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

