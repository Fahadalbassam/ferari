/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Normalize users collection AND allow explicit admin promotion via ENV:
 * - lowercase emails
 * - if passwordHash missing but password exists, copy it
 * - set role: existing role | (accountType === 'admin' ? 'admin' : 'user') | 'user'
 * - set isAdmin boolean
 * - if PROMOTE_EMAIL env is set, force that user to admin
 */
const fs = require("fs");
const { MongoClient } = require("mongodb");

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

  const promoteEmail = (process.env.PROMOTE_EMAIL || map.PROMOTE_EMAIL || "").toLowerCase().trim();

  const client = new MongoClient(uri);
  await client.connect();
  try {
    const db = client.db(dbName);
    const users = await db.collection("users").find({}).toArray();
    console.log("Found users:", users.length);
    for (const u of users) {
      const updates = {};
      const email = (u.email || "").toLowerCase().trim();
      if (email && email !== u.email) updates.email = email;
      if (!u.passwordHash && u.password) updates.passwordHash = u.password;
      let role = u.role || (u.accountType === "admin" ? "admin" : "user") || "user";
      if (promoteEmail && email === promoteEmail) role = "admin";
      if (role !== u.role) updates.role = role;
      const isAdmin = role === "admin";
      if (u.isAdmin !== isAdmin) updates.isAdmin = isAdmin;
      if (Object.keys(updates).length === 0) continue;
      updates.updatedAt = new Date();
      await db.collection("users").updateOne({ _id: u._id }, { $set: updates });
      console.log("Updated", email || u.email, updates);
    }

    if (promoteEmail && !users.some((u) => (u.email || "").toLowerCase().trim() === promoteEmail)) {
      const now = new Date();
      const doc = {
        email: promoteEmail,
        name: promoteEmail.split("@")[0],
        role: "admin",
        isAdmin: true,
        emailVerified: now,
        createdAt: now,
        updatedAt: now,
      };
      const res = await db.collection("users").insertOne(doc);
      console.log("Created admin user", promoteEmail, "id", res.insertedId);
    }
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});



