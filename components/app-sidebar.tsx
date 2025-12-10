"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, LogOut, ShoppingBag, Home, Car, Info, LayoutDashboard } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import {
  Sidebar,
  SidebarTrigger,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "Browse", href: "/browse", icon: ShoppingBag },
  { label: "Test Drive", href: "/test-drive", icon: Car },
  { label: "More About", href: "/more-about", icon: Info },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isAdmin = role === "admin";
  const { open, setOpen } = useSidebar();

  return (
    <>
      <SidebarTrigger
        className="fixed right-4 top-5 z-[60] h-9 w-9 rounded-full border border-neutral-200 bg-white shadow-sm hover:border-neutral-300 focus-visible:ring-2 focus-visible:ring-neutral-300"
        onClick={() => setOpen(!open)}
        aria-label="Toggle sidebar"
      />
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <Sidebar
        side="right"
        variant="floating"
        collapsible="offcanvas"
        className="fixed right-0 top-0 z-50 h-screen w-[16rem] bg-white shadow-xl"
      >
        <SidebarHeader className="flex items-center gap-2 px-3 py-3">
          <div className="text-sm font-semibold text-neutral-900">Ferrari</div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs uppercase tracking-wide text-neutral-500">
              Explore
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navLinks.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="space-y-2">
          <SidebarSeparator />
          {session?.user ? (
            <>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/orders"}>
                    <Link href="/orders">
                      <ShoppingBag className="h-4 w-4" />
                      <span>Orders</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {isAdmin && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith("/admin-dashboard")}>
                      <Link href="/admin-dashboard">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Admin</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </Button>
            </>
          ) : (
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <Link href="/auth/signin">
                <LogIn className="h-4 w-4" />
                <span>Sign in</span>
              </Link>
            </Button>
          )}
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>
    </>
  );
}

