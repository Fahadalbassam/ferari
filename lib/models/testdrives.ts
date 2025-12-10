import { ObjectId } from "mongodb";
import { getDb } from "../db";

export type TestDriveStatus = "new" | "confirmed" | "completed" | "cancelled";

export type TestDriveRecord = {
  _id: ObjectId;
  requestNumber: string;
  carId: ObjectId;
  carModel: string;
  customerEmail: string;
  customerName: string;
  preferredDate: string;
  status: TestDriveStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  inventoryHoldReleased?: boolean;
};

export async function createTestDrive(input: {
  carId: ObjectId;
  carModel: string;
  customerEmail: string;
  customerName: string;
  preferredDate: string;
  notes?: string;
}) {
  const db = await getDb();
  const count = await db.collection<TestDriveRecord>("test_drive_requests").countDocuments();
  const requestNumber = `TD-${2000 + count + 1}`;
  const doc: Omit<TestDriveRecord, "_id"> = {
    requestNumber,
    carId: input.carId,
    carModel: input.carModel,
    customerEmail: input.customerEmail,
    customerName: input.customerName,
    preferredDate: input.preferredDate,
    notes: input.notes,
    status: "new",
    createdAt: new Date(),
    updatedAt: new Date(),
    inventoryHoldReleased: false,
  };
  const res = await db.collection<TestDriveRecord>("test_drive_requests").insertOne(doc as TestDriveRecord);
  return { ...doc, _id: res.insertedId };
}

export async function listTestDrives(options: { status?: TestDriveStatus; q?: string; page?: number; limit?: number }) {
  const db = await getDb();
  const query: Record<string, unknown> = {};
  if (options.status) query.status = options.status;
  if (options.q) {
    query.$or = [
      { requestNumber: { $regex: options.q, $options: "i" } },
      { customerEmail: { $regex: options.q, $options: "i" } },
    ];
  }
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const skip = (page - 1) * limit;
  const total = await db.collection<TestDriveRecord>("test_drive_requests").countDocuments(query);
  const requests = await db
    .collection<TestDriveRecord>("test_drive_requests")
    .find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();
  return { total, page, limit, requests };
}

export async function getTestDriveById(id: string) {
  const db = await getDb();
  return db.collection<TestDriveRecord>("test_drive_requests").findOne({ _id: new ObjectId(id) });
}

export async function updateTestDrive(id: string, updates: Partial<Pick<TestDriveRecord, "status" | "notes" | "inventoryHoldReleased">>) {
  const db = await getDb();
  await db
    .collection<TestDriveRecord>("test_drive_requests")
    .updateOne({ _id: new ObjectId(id) }, { $set: { ...updates, updatedAt: new Date() } });
  return getTestDriveById(id);
}


