// Run with: node scripts/seedAdmin.js
// Requires env: MONGODB_URI, MONGODB_DB
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  if (!uri || !dbName) {
    console.error("MONGODB_URI and MONGODB_DB must be set");
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const email = "Fahad@admin.com";
  const password = "12345@Admin";
  const passwordHash = await bcrypt.hash(password, 10);

  await db.collection("users").updateOne(
    { email: email.toLowerCase() },
    {
      $set: {
        email: email.toLowerCase(),
        name: "Fahad Admin",
        role: "admin",
        accountType: "admin",
        passwordHash,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true },
  );

  console.log("Admin user seeded:", email);
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

