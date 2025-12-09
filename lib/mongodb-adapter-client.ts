import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "";
if (!uri) {
  console.warn("[auth] MONGODB_URI is not set. Auth adapter will fail to connect.");
}

// Auth.js adapter expects a stable promise export.
const clientPromise = MongoClient.connect(uri);

export default clientPromise;

