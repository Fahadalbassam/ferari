import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function DashboardRedirect() {
  const session = (await getServerSession(authOptions as never)) as { user?: { role?: string } } | null;
  if (!session?.user) {
    redirect("/auth/signin");
  }
  const role = (session.user as { role?: string }).role;
  if (role === "admin") {
    redirect("/admin-dashboard");
  }
  redirect("/");
}


