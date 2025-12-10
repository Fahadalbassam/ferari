"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { Menu, LogIn, LogOut, ShoppingBag, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

/**
 * AccountSidebar
 * - Right-side overlay (Sheet) that does NOT shift layout.
 * - Trigger button is intended to sit to the right of the profile avatar in the navbar.
 * - Shows auth-aware actions (sign in, orders, sign out, admin).
 */
export function AccountSidebar() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string; isAdmin?: boolean } | undefined)?.role;
  const isAdmin = role === "admin" || (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin === true;

  return (
    <Sheet>
      {/* Small circular trigger; place to the right of the avatar in the navbar */}
      <SheetTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-sm transition hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-300"
          aria-label="Open account sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>
      </SheetTrigger>

      {/* Overlay sheet from the right; fixed so it doesn't push content */}
      <SheetContent side="right" className="w-80 max-w-[320px]">
        <SheetHeader>
          <SheetTitle className="text-neutral-900">Account</SheetTitle>
        </SheetHeader>

        <div className="mt-4 flex flex-col gap-2">
          {!session?.user ? (
            <Button className="w-full justify-start gap-2" onClick={() => signIn()}>
              <LogIn className="h-4 w-4" />
              Sign in
            </Button>
          ) : (
            <>
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <Link href="/orders">
                  <ShoppingBag className="h-4 w-4" />
                  Orders
                </Link>
              </Button>

              {isAdmin && (
                <Button asChild variant="outline" className="w-full justify-start gap-2">
                  <Link href="/admin-dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    Admin dashboard
                  </Link>
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

