// Simple connectivity test. Run with:
//   node -r dotenv/config scripts/test-mongo.js
import { MongoClient } from "mongodb";

async function main() {
  const uri = process.env.MONGODB_URI || process.env.MONGODB_URL_MONGODB_URI;
  const dbName = process.env.MONGODB_DB;
  if (!uri || !dbName) {
    console.error("Missing MONGODB_URI (or MONGODB_URL_MONGODB_URI) or MONGODB_DB");
    process.exit(1);
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const res = await client.db(dbName).command({ ping: 1 });
    console.log("Mongo ping ok:", res);
  } catch (err) {
    console.error("Mongo ping failed:", err);
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

