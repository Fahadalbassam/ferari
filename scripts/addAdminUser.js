/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Upsert admin user User@Admin.com with password 12345@Admin.
 * Uses .env.local (MONGODB_URI, MONGODB_DB).
 */
const fs = require("fs");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

async function main() {
  const envPath = ".env.local";
  const env = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  const map = {};
  for (const line of env.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx === -1) continue;
    map[line.slice(0, idx)] = line.slice(idx + 1);
  }
  const uri = map.MONGODB_URI || process.env.MONGODB_URI;
  const dbName = map.MONGODB_DB || process.env.MONGODB_DB || "test";
  if (!uri) throw new Error("Missing MONGODB_URI");

  const emailRaw = "User@Admin.com";
  const email = emailRaw.toLowerCase().trim();
  const password = "12345@Admin";

  const client = new MongoClient(uri);
  await client.connect();
  try {
    const db = client.db(dbName);
    const passwordHash = await bcrypt.hash(password, 10);
    const res = await db.collection("users").findOneAndUpdate(
      { email },
      {
        $set: {
          email,
          name: "User Admin",
          role: "admin",
          passwordHash,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true, returnDocument: "after" },
    );
    console.log("Upserted user id:", res.value ? res.value._id : null, "db:", dbName);
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});


