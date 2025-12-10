export type AdminOrder = {
  id: string;
  orderNumber: string;
  email: string;
  total: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  updatedAt: string;
  carrier?: string;
  tracking?: string;
};

export type TestDrive = {
  id: string;
  requestNumber: string;
  email: string;
  vehicle: string;
  preferredDate: string;
  status: "new" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export const sampleOrders: AdminOrder[] = [
  {
    id: "o1",
    orderNumber: "ORD-1001",
    email: "customer1@example.com",
    total: 520000,
    status: "paid",
    createdAt: "2024-12-01T12:00:00Z",
    updatedAt: "2024-12-02T09:00:00Z",
    carrier: "DHL",
    tracking: "DHL123456",
  },
  {
    id: "o2",
    orderNumber: "ORD-1002",
    email: "customer2@example.com",
    total: 1400000,
    status: "pending",
    createdAt: "2024-12-05T10:00:00Z",
    updatedAt: "2024-12-05T10:00:00Z",
  },
];

export const sampleTestDrives: TestDrive[] = [
  {
    id: "t1",
    requestNumber: "TD-2001",
    email: "prospect1@example.com",
    vehicle: "SF90 Stradale",
    preferredDate: "2025-01-12",
    status: "new",
    notes: "Morning slot preferred",
    createdAt: "2024-12-07T08:00:00Z",
    updatedAt: "2024-12-07T08:00:00Z",
  },
  {
    id: "t2",
    requestNumber: "TD-2002",
    email: "prospect2@example.com",
    vehicle: "Roma Spider",
    preferredDate: "2025-01-15",
    status: "confirmed",
    notes: "Wants highway route",
    createdAt: "2024-12-08T10:30:00Z",
    updatedAt: "2024-12-09T11:00:00Z",
  },
];


