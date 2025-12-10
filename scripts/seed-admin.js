// Seed or upsert an admin user and create useful indexes.
// Run with:
//   node -r dotenv/config scripts/seed-admin.js
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

async function main() {
  const uri = process.env.MONGODB_URI || process.env.MONGODB_URL_MONGODB_URI;
  const dbName = process.env.MONGODB_DB;
  if (!uri || !dbName) throw new Error("Missing MONGODB_URI (or MONGODB_URL_MONGODB_URI) or MONGODB_DB");

  const email = (process.env.SEED_ADMIN_EMAIL || "admin@example.com").toLowerCase().trim();
  const password = process.env.SEED_ADMIN_PASSWORD || "Admin123!";
  const role = "admin";

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  // Indexes
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("accounts").createIndex({ provider: 1, providerAccountId: 1 }, { unique: true });
  await db.collection("sessions").createIndex({ sessionToken: 1 }, { unique: true });
  await db.collection("otps").createIndex({ email: 1, purpose: 1, createdAt: -1 });

  const now = new Date();
  const passwordHash = await bcrypt.hash(password, 10);
  const res = await db.collection("users").findOneAndUpdate(
    { email },
    {
      $set: {
        email,
        name: "Admin",
        role,
        passwordHash,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true, returnDocument: "after" },
  );

  console.log("Seeded admin user:", res.value ? res.value._id : null, email);
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

