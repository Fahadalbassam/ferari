export type UserRole = "user" | "admin";

export type OrderItem = {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  currency: "SAR";
};

export type Order = {
  id: string;
  userId: string;
  total: number;
  currency: "SAR";
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: string;
  email: string;
  passwordHash?: string;
  name?: string;
  username?: string;
  role: UserRole;
  orders?: Order[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  emailVerifiedAt?: string;
  banned?: boolean;
};

