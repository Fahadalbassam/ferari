import { MongoClient, Db } from "mongodb";

// Prefer MONGODB_URI; fallback to Vercel-provided MONGODB_URL_MONGODB_URI.
const uri = process.env.MONGODB_URI || process.env.MONGODB_URL_MONGODB_URI || "";
const dbName = process.env.MONGODB_DB || "app";

if (!uri) {
  // Helpful message for developers; avoids accidental undefined URI usage.
  console.warn("[db] MONGODB_URI is not set. Database calls will fail.");
}

let clientPromise: Promise<MongoClient> | null = null;

export function getMongoClient(): Promise<MongoClient> {
  if (!clientPromise) {
    clientPromise = MongoClient.connect(uri);
  }
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(dbName);
}





