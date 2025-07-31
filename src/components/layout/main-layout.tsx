"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Router, 
  Users, 
  Settings, 
  Home, 
  Wifi, 
  FileText, 
  CreditCard,
  Menu,
  LogOut,
  UserCircle,
  Activity
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";

const navigation = {
  ISP_OWNER: [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Routers", href: "/routers", icon: Router },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Plans", href: "/plans", icon: Wifi },
    { name: "Invoices", href: "/invoices", icon: FileText },
    { name: "Sessions", href: "/sessions", icon: Activity },
    { name: "Settings", href: "/settings", icon: Settings },
  ],
  CUSTOMER: [
    { name: "Dashboard", href: "/customer/dashboard", icon: Home },
    { name: "My Account", href: "/customer/account", icon: UserCircle },
    { name: "Billing", href: "/customer/billing", icon: CreditCard },
    { name: "Sessions", href: "/customer/sessions", icon: Activity },
  ],
};

interface SidebarProps {
  className?: string;
}

function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role || "CUSTOMER";

  const currentNavigation = navigation[userRole as keyof typeof navigation] || navigation.CUSTOMER;

  return (
    <div className={cn("pb-12 w-64", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center mb-6">
            <Router className="h-8 w-8 text-primary mr-2" />
            <h2 className="text-lg font-semibold">ISP Manager</h2>
          </div>
          <div className="space-y-1">
            {currentNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { data: session } = useSession();

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-card border-r pt-5 overflow-y-auto">
          <Sidebar />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <Router className="h-6 w-6 text-primary mr-2" />
            <span className="font-semibold">ISP Manager</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 flex-1">
        <div className="flex flex-col h-screen">
          {/* Top Header */}
          <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              {session && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {session.user?.name || session.user?.email}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut()}
                    className="h-8 w-8 p-0"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}